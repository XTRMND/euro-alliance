import { timingSafeEqual } from 'node:crypto'
import type { JobsConfig, PayloadRequest } from 'payload'
import { sendInquiryConfirmation, sendInquiryNotification } from './inquiry-emails'
import { deleteExpiredInquiries } from './retention'

// Background jobs: the inquiry emails (retried) and the nightly retention. How they run is the
// user's choice (open item), and both ways work:
// - JOBS_AUTORUN=true: the site's own process runs the queues on a timer (one server only).
// - A system cron calls GET /api/payload-jobs/run (every minute) and
//   /api/payload-jobs/handle-schedules then /api/payload-jobs/run?queue=nightly (nightly) with
//   `Authorization: Bearer $CRON_SECRET`.

/** Whether the request carries the cron secret (at least 32 characters). */
export function cronAuthorized(
  req: Pick<PayloadRequest, 'headers'>,
  secret = process.env.CRON_SECRET,
) {
  if (!secret || secret.length < 32) return false
  const header = req.headers.get('authorization') ?? ''
  const expected = Buffer.from(`Bearer ${secret}`)
  const given = Buffer.from(header)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

const autoRun = process.env.JOBS_AUTORUN === 'true'

export const jobs: JobsConfig = {
  tasks: [sendInquiryNotification, sendInquiryConfirmation, deleteExpiredInquiries],
  access: { run: ({ req }) => Boolean(req.user) || cronAuthorized(req) },
  deleteJobOnComplete: true,
  autoRun: autoRun
    ? [
        { cron: '* * * * *', queue: 'default', limit: 10 },
        { cron: '*/30 * * * *', queue: 'nightly', limit: 5 },
      ]
    : [],
  shouldAutoRun: () => autoRun,
}
