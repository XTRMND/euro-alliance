import { segments } from './routes'

// Inquiries from the contact wizard (docs/cms-schema.md § 3, § 5). Topics are keyed as in the
// links that open the wizard (/kontakti?tema=prevodi), so a link preselects its topic.

export const inquiryTopics = [
  'courses',
  'vouchers',
  'professions',
  'teachers',
  'farmers',
  'computer',
  'translations',
] as const
export type InquiryTopic = (typeof inquiryTopics)[number]

/** The `tema` value of each topic in the URL. */
export const topicSegments: Record<InquiryTopic, string> = {
  courses: segments.courses,
  vouchers: segments.vouchers,
  professions: segments.professions,
  teachers: segments.teachers,
  farmers: segments.farmers,
  computer: segments.computerCourses,
  translations: segments.translations,
}

export function topicFromQuery(value: string | string[] | undefined): InquiryTopic | undefined {
  const text = Array.isArray(value) ? value[0] : value
  return inquiryTopics.find((topic) => topicSegments[topic] === text)
}

export const inquiryOffices = ['plovdiv', 'sofia'] as const
export type InquiryOffice = (typeof inquiryOffices)[number]

export type RoutingRule = { topic: InquiryTopic; office?: InquiryOffice | null; email: string }

/**
 * The routing table the `inquiryRouting` global is seeded with (docs/cms-schema.md § 5).
 * Vouchers, professions, teachers, farmers and computer courses go to office@: a proposed
 * default for the client to confirm.
 */
export const defaultRouting: RoutingRule[] = [
  { topic: 'courses', email: 'office@euro-alliance.net' },
  { topic: 'translations', office: 'plovdiv', email: 'prevod@euro-alliance.net' },
  { topic: 'translations', office: 'sofia', email: 'trans@euro-alliance.net' },
  { topic: 'vouchers', email: 'office@euro-alliance.net' },
  { topic: 'professions', email: 'office@euro-alliance.net' },
  { topic: 'teachers', email: 'office@euro-alliance.net' },
  { topic: 'farmers', email: 'office@euro-alliance.net' },
  { topic: 'computer', email: 'office@euro-alliance.net' },
]

export const fallbackInbox = 'office@euro-alliance.net'

/**
 * The inbox for an inquiry: the rule for its topic and office, else the topic's rule without an
 * office, else the topic's first rule, else the fallback (office@).
 */
export function routeInquiry(
  inquiry: { topic?: InquiryTopic | null; office?: InquiryOffice | null },
  table: RoutingRule[],
  fallback = fallbackInbox,
): string {
  if (!inquiry.topic) return fallback
  const rules = table.filter((rule) => rule.topic === inquiry.topic)
  const exact = rules.find((rule) => (rule.office ?? null) === (inquiry.office ?? null))
  return (exact ?? rules.find((rule) => !rule.office) ?? rules[0])?.email ?? fallback
}

/** Upload limits for translation documents (proposed in docs/cms-schema.md; confirm). */
export const uploadLimits = {
  maxFiles: 10,
  maxBytes: 20 * 1024 * 1024,
  types: {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.oasis.opendocument.text': 'odt',
  } as Record<string, string>,
}

/** The file's real type from its first bytes, not its name: PDF, JPEG, PNG, DOC or ZIP-based. */
export function sniffType(bytes: Uint8Array): string | undefined {
  const starts = (...signature: number[]) => signature.every((byte, i) => bytes[i] === byte)
  if (starts(0x25, 0x50, 0x44, 0x46)) return 'application/pdf'
  if (starts(0xff, 0xd8, 0xff)) return 'image/jpeg'
  if (starts(0x89, 0x50, 0x4e, 0x47)) return 'image/png'
  if (starts(0xd0, 0xcf, 0x11, 0xe0)) return 'application/msword'
  // DOCX and ODT are ZIP archives; the declared type tells them apart.
  if (starts(0x50, 0x4b, 0x03, 0x04)) return 'application/zip'
  return undefined
}

/** Whether a file of `declared` type with these first bytes is accepted. */
export function acceptedFile(declared: string, bytes: Uint8Array): boolean {
  if (!(declared in uploadLimits.types)) return false
  const real = sniffType(bytes)
  if (real === 'application/zip') {
    return declared.includes('openxmlformats') || declared.includes('opendocument')
  }
  return real === declared
}

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** A phone number: digits with optional +, spaces, dashes, dots and brackets; 6–15 digits. */
export function validPhone(value: string): boolean {
  if (!/^\+?[\d\s\-().]+$/.test(value)) return false
  const digits = value.replace(/\D/g, '').length
  return digits >= 6 && digits <= 15
}

/** Spam signals: the hidden field filled in, or sent faster than a person could. */
export function looksLikeSpam(honeypot: string, startedAt: number, now = Date.now()): boolean {
  return honeypot.trim() !== '' || !Number.isFinite(startedAt) || now - startedAt < 3000
}

/** At most `limit` submissions per key in `windowMs` (per server instance). */
export function rateLimiter(limit = 5, windowMs = 10 * 60 * 1000) {
  const hits = new Map<string, number[]>()
  return (key: string, now = Date.now()): boolean => {
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs)
    if (recent.length >= limit) {
      hits.set(key, recent)
      return false
    }
    recent.push(now)
    hits.set(key, recent)
    return true
  }
}
