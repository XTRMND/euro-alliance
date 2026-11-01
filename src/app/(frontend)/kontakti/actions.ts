'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { getPayload } from 'payload'
import { rateLimiter } from '@/lib/inquiries'
import {
  type InquiryFileInput,
  type InquiryInput,
  queueInquiryEmails,
  type SubmitResult,
  submitInquiry,
} from '@/lib/inquiry-submit'

// The contact wizard's server action (docs/motion.md § 9): stores the inquiry, then sends its
// emails after the response, through jobs that retry a failed send. Five inquiries per address in
// ten minutes, per app instance.

const allow = rateLimiter(5, 10 * 60 * 1000)

export type SendInquiryResult = SubmitResult | { ok: false; errors: { form: 'tooMany' } }

export async function sendInquiry(formData: FormData): Promise<SendInquiryResult> {
  const forwarded = (await headers()).get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  if (!allow(ip)) return { ok: false, errors: { form: 'tooMany' } }

  let input: InquiryInput = {}
  try {
    input = JSON.parse(String(formData.get('inquiry') ?? '{}')) as InquiryInput
  } catch {
    return { ok: false, errors: { form: 'required' } } as SubmitResult
  }
  const files: InquiryFileInput[] = await Promise.all(
    formData
      .getAll('files')
      .filter((value): value is File => value instanceof File && value.size > 0)
      .map(async (file) => ({
        name: file.name,
        type: file.type,
        data: Buffer.from(await file.arrayBuffer()),
      })),
  )

  const payload = await getPayload({ config })
  const result = await submitInquiry(payload, input, files)
  if (result.ok && result.id !== null) {
    const jobs = await queueInquiryEmails(payload, result.id)
    after(async () => {
      for (const id of jobs) await payload.jobs.runByID({ id })
    })
  }
  return result
}
