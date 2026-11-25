import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

// Whether a request carries a session Payload itself signed, checked without loading Payload
// (src/proxy.ts): the door for large uploads to /api, which Payload would otherwise read into
// memory before it asks who is sending them. It only opens the door; Payload still decides what
// the account may do. Payload signs its token with HS256 and a key made from PAYLOAD_SECRET
// (payload/dist/index.js: sha256, hex, the first 32 characters); if that ever changes, signed-in
// uploads are refused here and tests/e2e/admin.spec.ts fails.

const cookieName = 'payload-token'

function tokenOf(cookie: string | null, authorization: string | null): string | undefined {
  const header = /^(?:JWT|Bearer)\s+(\S+)$/i.exec(authorization ?? '')?.[1]
  if (header) return header
  for (const part of (cookie ?? '').split(';')) {
    const at = part.indexOf('=')
    if (at > 0 && part.slice(0, at).trim() === cookieName) return part.slice(at + 1).trim()
  }
  return undefined
}

export function signingKey(secret: string): string {
  return createHash('sha256').update(secret).digest('hex').slice(0, 32)
}

export function signedSession(
  headers: { cookie: string | null; authorization: string | null },
  secret = process.env.PAYLOAD_SECRET ?? '',
  now = Date.now(),
): boolean {
  const token = tokenOf(headers.cookie, headers.authorization)
  if (!token || !secret) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [head, body, signature] = parts as [string, string, string]
  try {
    const { alg } = JSON.parse(Buffer.from(head, 'base64url').toString()) as { alg?: string }
    if (alg !== 'HS256') return false
    const expected = createHmac('sha256', signingKey(secret)).update(`${head}.${body}`).digest()
    const given = Buffer.from(signature, 'base64url')
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false
    const { exp } = JSON.parse(Buffer.from(body, 'base64url').toString()) as { exp?: number }
    return typeof exp === 'number' && exp * 1000 > now
  } catch {
    return false
  }
}
