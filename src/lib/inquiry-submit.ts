import { randomUUID } from 'node:crypto'
import { type Payload, ValidationError } from 'payload'
import sharp from 'sharp'
import {
  acceptedFile,
  emailPattern,
  type InquiryOffice,
  type InquiryTopic,
  inquiryOffices,
  inquiryTopics,
  looksLikeSpam,
  neededByDate,
  type RoutingRule,
  routeInquiry,
  uploadLimits,
  validNeededBy,
  validPhone,
} from './inquiries'
import { inspectFile, storedExtension } from './upload-checks'

// Stores an inquiry from the contact wizard (docs/cms-schema.md § 3, § 5): checks it, stores the
// files and the inquiry, and queues its two emails. The server action calls it; integration tests
// call it directly. Nothing the visitor sends is trusted: every value is checked here again.

export type InquiryInput = {
  topic?: string
  office?: string
  course?: string
  /** The day a translation is needed by, «2026-11-21». Optional. */
  neededBy?: string
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
  | 'required'
  | 'email'
  | 'phone'
  | 'privacy'
  | 'date'
  | 'fileType'
  | 'fileUnsafe'
  | 'fileSize'
  | 'fileCount'

export type SubmitResult =
  { ok: true; id: number | null } | { ok: false; errors: Partial<Record<string, FieldError>> }

const text = (value: string | undefined, max: number) => value?.trim().slice(0, max) ?? ''

/** A file's name as the visitor sent it, for showing: no path, no control characters. */
export function displayName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? ''
  return (
    base
      .replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, '')
      .trim()
      .slice(-120) || 'file'
  )
}

/** Only a path on this site, without its query (which could carry personal data). */
function cleanPath(value: string | undefined): string | undefined {
  if (!value?.startsWith('/') || value.startsWith('//')) return undefined
  return value.split(/[?#]/)[0].slice(0, 200)
}

export function validateInquiry(input: InquiryInput, files: InquiryFileInput[], now = new Date()) {
  const errors: Partial<Record<string, FieldError>> = {}
  const topic = inquiryTopics.find((value) => value === input.topic) as InquiryTopic | undefined
  const office = inquiryOffices.find((value) => value === input.office) as InquiryOffice | undefined
  const email = text(input.email, 200)
  const phone = text(input.phone, 40)
  // Only a translation has a day it's needed by; any other topic's is dropped.
  const neededBy = topic === 'translation' ? text(input.neededBy, 10) : ''

  if (!topic) errors.topic = 'required'
  if (topic === 'translation' && !office) errors.office = 'required'
  if (!text(input.name, 120)) errors.name = 'required'
  if (!email) errors.email = 'required'
  else if (!emailPattern.test(email)) errors.email = 'email'
  if (phone && !validPhone(phone)) errors.phone = 'phone'
  if (!input.privacyAck) errors.privacyAck = 'privacy'
  if (neededBy && !validNeededBy(neededBy, now)) errors.neededBy = 'date'

  if (files.length > uploadLimits.maxFiles) errors.files = 'fileCount'
  else if (files.some((file) => file.data.length > uploadLimits.maxBytes)) errors.files = 'fileSize'
  else if (files.some((file) => !acceptedFile(file.type, file.data))) errors.files = 'fileType'
  else {
    // A closer look (src/lib/upload-checks.ts): a real document of its type, without macros.
    const verdict = files.map((file) => inspectFile(file.type, file.data)).find((v) => v !== 'ok')
    if (verdict) errors.files = verdict
  }

  return { errors, topic, office, email, phone, neededBy }
}

/** The largest photo that's decoded: 110 megapixels, above a phone's 108 MP mode. */
export const maxImagePixels = 110_000_000

/**
 * Images are decoded and written again: they lose their EXIF (phone photos carry GPS) and
 * anything else that rode along in the file; orientation is applied first. Undefined for a file
 * that isn't the image it says it is, or is too large to decode safely.
 */
async function cleanImage(file: InquiryFileInput): Promise<InquiryFileInput | undefined> {
  if (!file.type.startsWith('image/')) return file
  try {
    const image = sharp(file.data, { limitInputPixels: maxImagePixels })
    const { format } = await image.metadata()
    if (format !== (file.type === 'image/png' ? 'png' : 'jpeg')) return undefined
    return { ...file, data: await image.rotate().toBuffer() }
  } catch {
    return undefined
  }
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

  const { errors, topic, office, email, phone, neededBy } = validateInquiry(
    input,
    files,
    new Date(now),
  )
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

  // Every image is checked before anything is stored, so a refused file leaves nothing behind.
  const cleaned: InquiryFileInput[] = []
  for (const file of topic === 'translation' ? files : []) {
    const clean = await cleanImage(file)
    if (!clean) return { ok: false, errors: { files: 'fileType' } }
    cleaned.push(clean)
  }

  // Payload looks at a file too (a PDF it can't read is refused): then the visitor is told, and
  // the files stored so far are taken out again.
  const stored: { id: number }[] = []
  try {
    for (const clean of cleaned) {
      stored.push(
        await payload.create({
          collection: 'inquiry-files',
          // The visitor's name for the file is kept as text only; on disk and in its address the
          // file has a random name with the extension of its checked type.
          data: { originalName: displayName(clean.name) },
          file: {
            data: clean.data,
            mimetype: clean.type,
            name: `${randomUUID()}.${storedExtension(clean.type, uploadLimits.types)}`,
            size: clean.data.length,
          },
          overrideAccess: true,
        }),
      )
    }
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error
    for (const file of stored) {
      await payload.delete({ collection: 'inquiry-files', id: file.id, overrideAccess: true })
    }
    return { ok: false, errors: { files: 'fileType' } }
  }

  const inquiry = await payload.create({
    collection: 'inquiries',
    data: {
      topic,
      office: topic === 'translation' ? office : undefined,
      course: course?.id,
      neededBy: neededBy ? neededByDate(neededBy) : undefined,
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
