import type { Payload } from 'payload'
import sharp from 'sharp'
import {
  acceptedFile,
  emailPattern,
  type InquiryOffice,
  type InquiryTopic,
  inquiryOffices,
  inquiryTopics,
  looksLikeSpam,
  type RoutingRule,
  routeInquiry,
  uploadLimits,
  validPhone,
} from './inquiries'

// Stores an inquiry from the contact wizard (docs/cms-schema.md § 3, § 5): checks it, stores the
// files and the inquiry, and queues its two emails. The server action calls it; integration tests
// call it directly. Nothing the visitor sends is trusted: every value is checked here again.

export type InquiryInput = {
  topic?: string
  office?: string
  course?: string
  name?: string
  email?: string
  phone?: string
  message?: string
  answers?: { question: string; answer: string }[]
  privacyAck?: boolean
  sourcePage?: string
  /** The hidden field: people leave it empty. */
  website?: string
  /** When the wizard was opened (ms since epoch). */
  startedAt?: number
}

export type InquiryFileInput = { name: string; type: string; data: Buffer }

export type FieldError =
  'required' | 'email' | 'phone' | 'privacy' | 'fileType' | 'fileSize' | 'fileCount'

export type SubmitResult =
  { ok: true; id: number | null } | { ok: false; errors: Partial<Record<string, FieldError>> }

const text = (value: string | undefined, max: number) => value?.trim().slice(0, max) ?? ''

/** Only a path on this site, without its query (which could carry personal data). */
function cleanPath(value: string | undefined): string | undefined {
  if (!value?.startsWith('/') || value.startsWith('//')) return undefined
  return value.split(/[?#]/)[0].slice(0, 200)
}

export function validateInquiry(input: InquiryInput, files: InquiryFileInput[]) {
  const errors: Partial<Record<string, FieldError>> = {}
  const topic = inquiryTopics.find((value) => value === input.topic) as InquiryTopic | undefined
  const office = inquiryOffices.find((value) => value === input.office) as InquiryOffice | undefined
  const email = text(input.email, 200)
  const phone = text(input.phone, 40)

  if (!topic) errors.topic = 'required'
  if (topic === 'translations' && !office) errors.office = 'required'
  if (!text(input.name, 120)) errors.name = 'required'
  if (!email) errors.email = 'required'
  else if (!emailPattern.test(email)) errors.email = 'email'
  if (phone && !validPhone(phone)) errors.phone = 'phone'
  if (!input.privacyAck) errors.privacyAck = 'privacy'

  if (files.length > uploadLimits.maxFiles) errors.files = 'fileCount'
  else if (files.some((file) => file.data.length > uploadLimits.maxBytes)) errors.files = 'fileSize'
  else if (files.some((file) => !acceptedFile(file.type, file.data))) errors.files = 'fileType'

  return { errors, topic, office, email, phone }
}

/** Images lose their EXIF (phone photos carry GPS); orientation is applied first. */
async function stripMetadata(file: InquiryFileInput): Promise<InquiryFileInput> {
  if (!file.type.startsWith('image/')) return file
  return { ...file, data: await sharp(file.data).rotate().toBuffer() }
}

export async function submitInquiry(
  payload: Payload,
  input: InquiryInput,
  files: InquiryFileInput[],
  now = Date.now(),
): Promise<SubmitResult> {
  // A bot gets the same answer as a person, and nothing is stored.
  if (looksLikeSpam(input.website ?? '', Number(input.startedAt), now))
    return { ok: true, id: null }

  const { errors, topic, office, email, phone } = validateInquiry(input, files)
  if (Object.keys(errors).length > 0) return { ok: false, errors }

  const routing = await payload.findGlobal({ slug: 'inquiry-routing', depth: 0 })
  const routedTo = routeInquiry({ topic, office }, (routing.rules ?? []) as RoutingRule[])

  const course = input.course
    ? (
        await payload.find({
          collection: 'courses',
          where: { slug: { equals: input.course } },
          depth: 0,
          limit: 1,
          overrideAccess: false,
        })
      ).docs[0]
    : undefined

  const stored = []
  for (const file of topic === 'translations' ? files : []) {
    const clean = await stripMetadata(file)
    stored.push(
      await payload.create({
        collection: 'inquiry-files',
        data: {},
        file: {
          data: clean.data,
          mimetype: clean.type,
          name: clean.name.slice(-120),
          size: clean.data.length,
        },
        overrideAccess: true,
      }),
    )
  }

  const inquiry = await payload.create({
    collection: 'inquiries',
    data: {
      topic,
      office: topic === 'translations' ? office : undefined,
      course: course?.id,
      name: text(input.name, 120),
      email,
      phone: phone || undefined,
      message: text(input.message, 5000) || undefined,
      answers: (input.answers ?? []).slice(0, 10).map((answer) => ({
        question: text(answer.question, 200),
        answer: text(answer.answer, 500),
      })),
      files: stored.map((file) => file.id),
      privacyAck: true,
      sourcePage: cleanPath(input.sourcePage),
      routedTo,
      status: 'new',
      emailStatus: 'pending',
    },
    overrideAccess: true,
  })

  return { ok: true, id: inquiry.id }
}

/** Queues the inquiry's emails; returns the job ids so the caller can run them at once. */
export async function queueInquiryEmails(payload: Payload, inquiry: number) {
  const jobs = await Promise.all([
    payload.jobs.queue({ task: 'sendInquiryNotification', input: { inquiry } }),
    payload.jobs.queue({ task: 'sendInquiryConfirmation', input: { inquiry } }),
  ])
  return jobs.map((job) => job.id)
}
