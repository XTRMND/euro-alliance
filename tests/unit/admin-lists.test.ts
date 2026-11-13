import { describe, expect, it } from 'vitest'
import { listParams } from '@/components/admin/lists/shared'
import { type CourseRow, courseRow, coursesLabel, groupCourses } from '@/lib/admin-courses'
import type { CourseGroup, SiteCourse } from '@/lib/course-state'
import { formatPrice } from '@/lib/format'
import type { Price } from '@/payload-types'

// The admin's lists (docs/admin-redesign.md, PR 8; Figma 356:100).

const today = '2026-10-31T22:00:00.000Z' // 1 November 2026 in Sofia

const course = (fields: Partial<SiteCourse> & { _status?: string }): SiteCourse =>
  ({
    id: 1,
    title: 'Test course A',
    category: 'languages',
    topic: 'english',
    groups: [],
    prices: [],
    _status: 'published',
    ...fields,
  }) as SiteCourse
const group = (id: number, start: string, fields: Partial<CourseGroup> = {}) =>
  ({ id, course: 1, start, ...fields }) as CourseGroup
const price = (amount: number, groupId: number | null, label?: string) =>
  ({ id: 1, course: 1, group: groupId, price: amount, currency: 'EUR', label }) as Price

describe('a course as a row', () => {
  it('shows the group that starts next, its seats and its price from «Цени»', () => {
    const row = courseRow(
      course({
        audience: 'adults',
        format: 'online',
        level: 'B2',
        groups: [group(7, '2026-11-03T00:00:00.000Z', { seats: 5 })],
        prices: [price(495, 7, 'промоция')],
      }),
      today,
    )
    expect(row).toMatchObject({
      tags: 'Възрастни • Онлайн',
      level: 'B2',
      start: '3 ноември 2026',
      running: false,
      seats: 5,
      price: formatPrice(495),
      priceLabel: 'промоция',
      draft: false,
    })
  })

  it('falls back to the course’s base price, says «в ход», «Безплатно» and «Чернова»', () => {
    const running = courseRow(
      course({ groups: [group(7, '2026-10-04T00:00:00.000Z')], prices: [price(545, null)] }),
      today,
    )
    expect([running.running, running.price, running.seats]).toEqual([
      true,
      formatPrice(545),
      undefined,
    ])
    expect(courseRow(course({ free: true, prices: [price(10, null)] }), today).price).toBe(
      'Безплатно',
    )
    const empty = courseRow(course({ _status: 'draft' }), today)
    expect([empty.draft, empty.start, empty.price]).toEqual([true, undefined, undefined])
  })
})

describe('the rows in groups', () => {
  const row = (c: { id: number }) => ({ id: c.id }) as CourseRow
  const courses = [
    { id: 1, language: 'german', category: 'languages', audience: 'adults' },
    { id: 2, language: 'english', category: 'languages', audience: 'students' },
    { id: 3, language: 'english', category: 'languages', audience: 'adults' },
    { id: 4, language: null, category: 'computer', audience: null },
  ] as const

  it('by language: every language in the list’s order, empty ones too, then the rest', () => {
    const groups = groupCourses([...courses], 'language', row)
    expect(groups.map((g) => [g.label, g.rows.map((r) => r.id)])).toEqual([
      ['Английски', [2, 3]],
      ['Немски', [1]],
      ['Френски', []],
      ['Български', []],
      ['Испански', []],
      ['Италиански', []],
      ['Руски', []],
      ['Без език', [4]],
    ])
    expect(groups[0].language).toBe('english')
  })

  it('by programme and by audience: only the groups that have courses', () => {
    expect(groupCourses([...courses], 'category', row).map((g) => g.label)).toEqual([
      'Езикови курсове',
      'Компютърни курсове',
    ])
    expect(groupCourses([...courses], 'audience', row).map((g) => g.label)).toEqual([
      'Възрастни',
      'Ученици',
      'Без аудитория',
    ])
    expect(groupCourses([...courses], 'none', row)).toHaveLength(1)
  })

  it('counts courses in Bulgarian', () => {
    expect([0, 1, 3].map(coursesLabel)).toEqual(['няма курсове', '1 курс', '3 курса'])
  })
})

describe('a list’s address', () => {
  it('keeps the menu’s filter and the screen’s own parameters in every link', () => {
    const params = listParams({ 'where[category][equals]': 'languages', aud: 'adults', page: '2' })
    expect(params.where).toEqual({ category: 'languages' })
    expect(params.get('aud')).toBe('adults')
    expect(params.href({ group: 'audience' })).toBe(
      '?where[category][equals]=languages&aud=adults&group=audience',
    )
    expect(params.href({ aud: undefined })).toBe('?where[category][equals]=languages')
    // The placeholder a client select fills in stays as it is.
    expect(params.href({ group: '{value}', aud: undefined })).toBe(
      '?where[category][equals]=languages&group={value}',
    )
  })

  it('reads the filter as Payload parses it, too', () => {
    const params = listParams({ where: { voucherEligible: { equals: 'true' } }, q: 'тест' })
    expect(params.where).toEqual({ voucherEligible: 'true' })
    expect(params.href({})).toBe(
      `?where[voucherEligible][equals]=true&q=${encodeURIComponent('тест')}`,
    )
  })
})
