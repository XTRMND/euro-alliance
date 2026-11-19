import { describe, expect, it } from 'vitest'
import {
  acceptedFile,
  byUrgency,
  defaultRouting,
  inquiryTopics,
  looksLikeSpam,
  rateLimiter,
  routeInquiry,
  topicFromQuery,
  urgencyOf,
  validNeededBy,
  validPhone,
} from '@/lib/inquiries'

describe('inquiry routing (docs/cms-schema.md § 5)', () => {
  it.each([
    [{ topic: 'course' as const }, 'office@euro-alliance.net'],
    [{ topic: 'translation' as const, office: 'plovdiv' as const }, 'prevod@euro-alliance.net'],
    [{ topic: 'translation' as const, office: 'sofia' as const }, 'trans@euro-alliance.net'],
    [{ topic: 'voucher' as const }, 'office@euro-alliance.net'],
    [{ topic: 'levelTest' as const }, 'office@euro-alliance.net'],
    [{ topic: 'corporate' as const }, 'office@euro-alliance.net'],
    [{ topic: 'other' as const }, 'office@euro-alliance.net'],
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
      rule.topic === 'corporate' ? { ...rule, email: 'corporate@example.com' } : rule,
    )
    expect(routeInquiry({ topic: 'corporate' }, table)).toBe('corporate@example.com')
  })
})

describe('the wizard link', () => {
  it('preselects the topic from ?tema=', () => {
    expect(topicFromQuery('prevodi')).toBe('translation')
    expect(topicFromQuery('kursove')).toBe('course')
    expect(topicFromQuery(['vaucheri'])).toBe('voucher')
    expect(topicFromQuery('test-za-nivo')).toBe('levelTest')
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

describe('the day a translation is needed by (Trello #7)', () => {
  // 19.11.2026, 10:00 in Sofia.
  const now = new Date('2026-11-19T08:00:00.000Z')
  const at = (day: string) => `${day}T12:00:00.000Z`

  it('accepts today and later, in Sofia’s day', () => {
    expect(validNeededBy('2026-11-19', now)).toBe(true)
    expect(validNeededBy('2027-01-05', now)).toBe(true)
    // 23:30 UTC on the 19th is already the 20th in Sofia.
    expect(validNeededBy('2026-11-19', new Date('2026-11-19T23:30:00.000Z'))).toBe(false)
  })

  it('rejects the past and what isn’t a day', () => {
    expect(validNeededBy('2026-11-18', now)).toBe(false)
    expect(validNeededBy('2026-02-30', now)).toBe(false)
    expect(validNeededBy('21.11.2026', now)).toBe(false)
    expect(validNeededBy('', now)).toBe(false)
  })

  it('says how soon an open inquiry is needed', () => {
    const label = (day: string, status = 'new') =>
      urgencyOf({ neededBy: at(day), status }, now)?.label
    expect(label('2026-11-18')).toBe('просрочено · 18.11')
    expect(label('2026-11-19')).toBe('днес')
    expect(label('2026-11-20')).toBe('утре')
    expect(label('2026-11-21')).toBe('до 21.11')
    expect(label('2027-01-05')).toBe('до 05.01.2027')
    expect(label('2026-11-18', 'closed')).toBeUndefined()
    expect(urgencyOf({ status: 'new' }, now)).toBeNull()
  })

  it('orders by urgency, then by the day received', () => {
    const inquiries = [
      { id: 'old', createdAt: '2026-11-01T09:00:00.000Z', status: 'new' },
      {
        id: 'later',
        createdAt: '2026-11-02T09:00:00.000Z',
        status: 'new',
        neededBy: at('2026-11-25'),
      },
      { id: 'new', createdAt: '2026-11-18T09:00:00.000Z', status: 'new' },
      {
        id: 'overdue',
        createdAt: '2026-11-03T09:00:00.000Z',
        status: 'in-progress',
        neededBy: at('2026-11-10'),
      },
      {
        id: 'closed',
        createdAt: '2026-11-10T09:00:00.000Z',
        status: 'closed',
        neededBy: at('2026-11-05'),
      },
    ]
    expect(byUrgency(inquiries).map((inquiry) => inquiry.id)).toEqual([
      'overdue',
      'later',
      'new',
      'closed',
      'old',
    ])
  })
})
