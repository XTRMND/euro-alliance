import { describe, expect, it } from 'vitest'
import {
  coursesCount,
  dayAndMonth,
  inboxOf,
  initialsOf,
  timeAgo,
  todayLine,
} from '@/lib/admin-dashboard'

// The dashboard's helpers (Figma «Admin · 01 Табло», 359:969).

describe('the dashboard', () => {
  it('sorts an inquiry into the inbox it goes to', () => {
    expect(inboxOf({ topic: 'translation', office: 'sofia' })).toBe('sofia')
    expect(inboxOf({ topic: 'translation', office: 'plovdiv' })).toBe('plovdiv')
    expect(inboxOf({ topic: 'translation' })).toBe('plovdiv')
    expect(inboxOf({ topic: 'course' })).toBe('courses')
    expect(inboxOf({ topic: 'voucher', office: 'sofia' })).toBe('courses')
  })

  it('makes initials from a name', () => {
    expect(initialsOf('Тест Посетител')).toBe('ТП')
    expect(initialsOf('Тест А. Посетител')).toBe('ТП')
    expect(initialsOf('тест')).toBe('ТЕ')
    expect(initialsOf('')).toBe('')
  })

  it('says how long ago, in Bulgarian time', () => {
    const now = new Date('2026-11-12T10:00:00.000Z') // 12:00 in Sofia
    expect(timeAgo('2026-11-12T09:59:40.000Z', now)).toBe('току-що')
    expect(timeAgo('2026-11-12T09:55:00.000Z', now)).toBe('преди 5 мин.')
    expect(timeAgo('2026-11-12T08:00:00.000Z', now)).toBe('преди 2 ч.')
    // 23:30 the evening before in Sofia: yesterday, though under 24 hours ago.
    expect(timeAgo('2026-11-11T21:30:00.000Z', now)).toBe('вчера')
    expect(timeAgo('2026-11-09T10:00:00.000Z', now)).toBe('преди 3 дни')
    expect(timeAgo('2026-09-01T10:00:00.000Z', now)).toBe('1 септември 2026')
  })

  it('writes the date box and today’s line', () => {
    expect(dayAndMonth('2026-11-17T00:00:00.000Z')).toEqual({ day: '17', month: 'ное' })
    expect(dayAndMonth('2027-02-02T00:00:00.000Z')).toEqual({ day: '2', month: 'фев' })
    expect(todayLine(new Date('2026-11-11T10:00:00.000Z'))).toBe('Сряда, 11 ноември 2026')
  })

  it('counts courses in Bulgarian', () => {
    expect([coursesCount(1), coursesCount(4), coursesCount(0)]).toEqual(['курс', 'курса', 'курса'])
  })
})
