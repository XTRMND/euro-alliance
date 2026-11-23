import { rateLimiter } from './inquiries'

// The door for uploads (src/proxy.ts). A server action's files are read into memory before any
// of its own checks run, so the size of what's on its way in is limited here, from the request's
// headers alone, before the body is read: one request's size, how many large requests an address
// may send, and how much all addresses together may send at once.

const MB = 1024 * 1024

export const uploadBudget = {
  /** One request: ten files of 20 MB and the form (next.config.ts `bodySizeLimit`). */
  requestBytes: 205 * MB,
  /** Above this a request counts as an upload. */
  largeBytes: 1 * MB,
  /** Large requests per address in ten minutes: above the wizard's own five, so it answers first. */
  perAddress: 8,
  /** What all addresses together may send within the window. */
  windowBytes: 600 * MB,
  windowMs: 2 * 60 * 1000,
}

export type UploadVerdict = 'ok' | 'lengthRequired' | 'tooLarge' | 'tooMany' | 'busy'

export const uploadStatus: Record<Exclude<UploadVerdict, 'ok'>, number> = {
  lengthRequired: 411,
  tooLarge: 413,
  tooMany: 429,
  busy: 503,
}

/** Whether a request brings a form with files: a multipart POST. */
export function isUpload(method: string, contentType: string | null): boolean {
  return method === 'POST' && (contentType ?? '').toLowerCase().startsWith('multipart/form-data')
}

export function uploadGuard(budget = uploadBudget) {
  const allow = rateLimiter(budget.perAddress, 10 * 60 * 1000)
  let recent: { at: number; bytes: number }[] = []

  return (contentLength: string | null, address: string, now = Date.now()): UploadVerdict => {
    const bytes = contentLength === null ? NaN : Number(contentLength)
    if (!Number.isInteger(bytes) || bytes < 0) return 'lengthRequired'
    if (bytes > budget.requestBytes) return 'tooLarge'
    if (bytes <= budget.largeBytes) return 'ok'

    recent = recent.filter((upload) => now - upload.at < budget.windowMs)
    const onTheWay = recent.reduce((sum, upload) => sum + upload.bytes, 0)
    if (onTheWay + bytes > budget.windowBytes) return 'busy'
    if (!allow(address, now)) return 'tooMany'
    recent.push({ at: now, bytes })
    return 'ok'
  }
}
