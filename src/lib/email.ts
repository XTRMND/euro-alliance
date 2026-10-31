import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import type { PayloadEmailAdapter, SendEmailOptions } from 'payload'

type Recipients = string | { address: string } | Recipients[] | undefined

function addresses(recipients: Recipients): string[] {
  if (!recipients) return []
  if (Array.isArray(recipients)) return recipients.flatMap(addresses)
  return [typeof recipients === 'string' ? recipients : recipients.address]
}

/**
 * Sends a message to `override` only: to, cc and bcc are all replaced, so staging can never
 * email the client's inboxes. The original recipients travel in a header for debugging.
 */
export function redirect(message: SendEmailOptions, override: string): SendEmailOptions {
  const original = addresses([message.to, message.cc, message.bcc] as Recipients)
  const headers =
    message.headers && !Array.isArray(message.headers) ? { ...message.headers } : undefined
  const redirected: SendEmailOptions = {
    ...message,
    to: override,
    headers: { ...headers, 'X-Original-Recipients': original.join(', ') },
  }
  delete redirected.cc
  delete redirected.bcc
  return redirected
}

/** "Name <address>" or a bare address. */
export function parseFrom(value: string): { name: string; address: string } {
  const match = value.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/)
  return match
    ? { name: match[1], address: match[2] }
    : { name: value.trim(), address: value.trim() }
}

/**
 * SMTP from the environment. Without SMTP_HOST there is no adapter and Payload logs emails to the
 * console instead. With INQUIRY_EMAIL_OVERRIDE set, every message goes to that address.
 */
export function emailAdapter(
  env: Record<string, string | undefined> = process.env,
): Promise<PayloadEmailAdapter> | undefined {
  if (!env.SMTP_HOST) return undefined

  const from = parseFrom(env.MAIL_FROM ?? '')
  const adapter = nodemailerAdapter({
    defaultFromAddress: from.address,
    defaultFromName: from.name,
    transportOptions: {
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT ?? 587),
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    },
  })

  const override = env.INQUIRY_EMAIL_OVERRIDE
  if (!override) return adapter

  return adapter.then((create) => (args) => {
    const initialized = create(args)
    return {
      ...initialized,
      sendEmail: (message) => initialized.sendEmail(redirect(message, override)),
    }
  })
}
