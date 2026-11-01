import { describe, expect, it } from 'vitest'
import {
  acceptedFile,
  defaultRouting,
  inquiryTopics,
  looksLikeSpam,
  rateLimiter,
  routeInquiry,
  topicFromQuery,
  validPhone,
} from '@/lib/inquiries'

describe('inquiry routing (docs/cms-schema.md § 5)', () => {
  it.each([
    [{ topic: 'courses' as const }, 'office@euro-alliance.net'],
    [{ topic: 'translations' as const, office: 'plovdiv' as const }, 'prevod@euro-alliance.net'],
    [{ topic: 'translations' as const, office: 'sofia' as const }, 'trans@euro-alliance.net'],
    [{ topic: 'vouchers' as const }, 'office@euro-alliance.net'],
    [{ topic: 'professions' as const }, 'office@euro-alliance.net'],
    [{ topic: 'teachers' as const }, 'office@euro-alliance.net'],
    [{ topic: 'farmers' as const }, 'office@euro-alliance.net'],
    [{ topic: 'computer' as const }, 'office@euro-alliance.net'],
    [{}, 'office@euro-alliance.net'],
  ])('routes %o to %s', (inquiry, inbox) => {
    expect(routeInquiry(inquiry, defaultRouting)).toBe(inbox)
  })

  it('has a rule for every topic', () => {
    for (const topic of inquiryTopics) {
      expect(defaultRouting.some((rule) => rule.topic === topic)).toBe(true)
    }
  })

  it('follows a changed table', () => {
    const table = defaultRouting.map((rule) =>
      rule.topic === 'farmers' ? { ...rule, email: 'farm@example.com' } : rule,
    )
    expect(routeInquiry({ topic: 'farmers' }, table)).toBe('farm@example.com')
  })
})

describe('the wizard link', () => {
  it('preselects the topic from ?tema=', () => {
    expect(topicFromQuery('prevodi')).toBe('translations')
    expect(topicFromQuery('kursove')).toBe('courses')
    expect(topicFromQuery(['vaucheri'])).toBe('vouchers')
    expect(topicFromQuery('nyakakva')).toBeUndefined()
    expect(topicFromQuery(undefined)).toBeUndefined()
  })
})

describe('uploads', () => {
  const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])
  const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04])

  it('checks the type from the content, not the name', () => {
    expect(acceptedFile('application/pdf', pdf)).toBe(true)
    expect(acceptedFile('image/png', pdf)).toBe(false)
    expect(
      acceptedFile('application/vnd.openxmlformats-officedocument.wordprocessingml.document', zip),
    ).toBe(true)
    expect(acceptedFile('application/zip', zip)).toBe(false)
    expect(acceptedFile('text/html', new Uint8Array([0x3c]))).toBe(false)
  })
})

describe('validation and spam', () => {
  it('accepts phone numbers as people write them', () => {
    expect(validPhone('+359 886 601 108')).toBe(true)
    expect(validPhone('0886-601-108')).toBe(true)
    expect(validPhone('12')).toBe(false)
    expect(validPhone('call me')).toBe(false)
  })

  it('flags a filled honeypot or a too-fast submit', () => {
    expect(looksLikeSpam('', 0, 10_000)).toBe(false)
    expect(looksLikeSpam('http://spam', 0, 10_000)).toBe(true)
    expect(looksLikeSpam('', 9_000, 10_000)).toBe(true)
  })

  it('limits submissions per key and window', () => {
    const allow = rateLimiter(2, 1000)
    expect([allow('a', 0), allow('a', 10), allow('a', 20), allow('b', 20)]).toEqual([
      true,
      true,
      false,
      true,
    ])
    expect(allow('a', 2000)).toBe(true)
  })
})
