import { describe, expect, it } from 'vitest'
import {
  audienceFromSegment,
  groupByDirection,
  hasLanguagePage,
  languageFromSegment,
  otherAudience,
  programCtaHref,
  programCourseFilters,
} from '@/lib/programs'

describe('language program URLs', () => {
  it('read the language and the audience from their segments', () => {
    expect(languageFromSegment('angliyski')).toBe('english')
    expect(languageFromSegment('balgarski')).toBe('bulgarian')
    expect(languageFromSegment('nyama')).toBeUndefined()
    expect(audienceFromSegment('vazrastni')).toBe('adults')
    expect(audienceFromSegment('uchenitsi')).toBe('students')
  })

  it('have no Russian page for adults', () => {
    expect(hasLanguagePage('russian', 'adults')).toBe(false)
    expect(otherAudience('russian', 'students')).toBeUndefined()
    expect(otherAudience('english', 'adults')).toBe('students')
  })
})

describe('upcoming courses of a program page', () => {
  it('lists a language page its language and audience', () => {
    const filters = programCourseFilters({
      type: 'language',
      language: 'german',
      audience: 'students',
    })
    expect(filters.language).toEqual(['german'])
    expect(filters.audience).toEqual(['students'])
    expect(filters.category).toEqual([])
  })

  it('lists the vouchers page the courses payable with a voucher', () => {
    const filters = programCourseFilters({ type: 'vouchers' })
    expect(filters.voucher).toBe(true)
    expect(filters.category).toEqual([])
  })

  it('lists every other page its category', () => {
    expect(programCourseFilters({ type: 'farmers' }).category).toEqual(['farmers'])
    expect(programCourseFilters({ type: 'vocational' }).category).toEqual(['vocational'])
  })
})

describe('hero buttons of a program page', () => {
  const listing = '/kursove?ezik=angliyski'

  it('go to a section of the page by its anchor', () => {
    expect(programCtaHref({ anchor: 'kak-da-kandidatstvate' }, { shown: false, listing })).toBe(
      '#kak-da-kandidatstvate',
    )
  })

  it('go to the upcoming courses when they show, else to the listing', () => {
    const cta = { destination: 'languageCourses' }
    expect(programCtaHref(cta, { shown: true, listing })).toBe('#predstoyashti-kursove')
    expect(programCtaHref(cta, { shown: false, listing })).toBe(listing)
  })

  it('go to a fixed destination, and nowhere for an unknown one', () => {
    expect(programCtaHref({ destination: 'levelTest' }, { shown: false, listing })).toBe(
      '/kontakti?tema=test-za-nivo',
    )
    expect(programCtaHref({ destination: 'nowhere' }, { shown: false, listing })).toBeUndefined()
  })
})

describe('groupByDirection', () => {
  it('groups professions into directions in the order of their first profession', () => {
    const row = (directionCode: string, code: string) => ({
      directionCode,
      directionName: `Direction ${directionCode}`,
      code,
    })
    const groups = groupByDirection([
      row('041', '041101'),
      row('041', '041102'),
      row('103', '103201'),
      row('101', '101103'),
      row('041', '041603'),
    ])
    expect(groups.map((group) => group.code)).toEqual(['041', '103', '101'])
    expect(groups[0].professions.map((p) => p.code)).toEqual(['041101', '041102', '041603'])
    expect(groups[1].name).toBe('Direction 103')
  })
})
