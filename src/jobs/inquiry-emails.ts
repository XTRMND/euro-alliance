import { createTranslator } from 'next-intl'
import type { PayloadRequest, TaskConfig } from 'payload'
import bg from '@/messages/bg.json'
import type { Course, Inquiry } from '@/payload-types'

// The two emails of an inquiry (docs/cms-schema.md § 5), each its own retried task so a failed
// confirmation never sends the notification twice. The inquiry is already stored; a send that
// keeps failing marks it, and staff still see it in the admin. Files are never attached: the
// notification links to the inquiry in the admin, behind login.

const t = createTranslator({ locale: 'bg', messages: bg, namespace: 'inquiryEmail' })

async function load(req: PayloadRequest, id: number) {
  return req.payload.findByID({ collection: 'inquiries', id, depth: 1, req, overrideAccess: true })
}

async function mark(req: PayloadRequest, id: number, emailStatus: Inquiry['emailStatus']) {
  await req.payload.update({
    collection: 'inquiries',
    id,
    data: { emailStatus },
    req,
    overrideAccess: true,
  })
}

/** The notification's text: every answer, and where to see the files. */
export function notificationText(inquiry: Inquiry, adminUrl: string): string {
  const course = typeof inquiry.course === 'object' ? (inquiry.course as Course | null) : null
  const lines = [
    [t('topic'), inquiry.topic && t(`topics.${inquiry.topic}`)],
    [t('office'), inquiry.office && t(`offices.${inquiry.office}`)],
    [t('course'), course?.title],
    [t('name'), inquiry.name],
    [t('email'), inquiry.email],
    [t('phone'), inquiry.phone],
    ...(inquiry.answers ?? []).map((answer) => [answer.question, answer.answer]),
    [t('message'), inquiry.message],
    [t('files'), inquiry.files?.length ? String(inquiry.files.length) : undefined],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
  return [...lines, '', `${t('open')}: ${adminUrl}/admin/collections/inquiries/${inquiry.id}`].join(
    '\n',
  )
}

export const sendInquiryNotification: TaskConfig<{
  input: { inquiry: number }
  output: object
}> = {
  slug: 'sendInquiryNotification',
  retries: 5,
  inputSchema: [{ name: 'inquiry', type: 'number', required: true }],
  handler: async ({ input, req }) => {
    const inquiry = await load(req, input.inquiry)
    try {
      await req.payload.sendEmail({
        to: inquiry.routedTo ?? undefined,
        replyTo: inquiry.email ?? undefined,
        subject: t('notificationSubject', {
          topic: inquiry.topic ? t(`topics.${inquiry.topic}`) : t('topics.none'),
          name: inquiry.name ?? '',
        }),
        text: notificationText(inquiry, process.env.NEXT_PUBLIC_SITE_URL ?? ''),
      })
    } catch (error) {
      await mark(req, inquiry.id, 'failed')
      throw error
    }
    await mark(req, inquiry.id, 'sent')
    return { output: {} }
  },
}

export const sendInquiryConfirmation: TaskConfig<{
  input: { inquiry: number }
  output: object
}> = {
  slug: 'sendInquiryConfirmation',
  retries: 5,
  inputSchema: [{ name: 'inquiry', type: 'number', required: true }],
  handler: async ({ input, req }) => {
    const inquiry = await load(req, input.inquiry)
    if (inquiry.email) {
      await req.payload.sendEmail({
        to: inquiry.email,
        subject: t('confirmationSubject'),
        text: t('confirmationText', { name: inquiry.name ?? '' }),
      })
    }
    return { output: {} }
  },
}
