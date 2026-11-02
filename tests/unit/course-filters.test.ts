import { describe, expect, it } from 'vitest'
import {
  activeFilterCount,
  courseFiltersQuery,
  emptyCourseFilters,
  monthOf,
  parseCourseFilters,
} from '@/lib/course-filters'

describe('course filters in the URL', () => {
  it('read the transliterated values and ignore unknown ones', () => {
    const filters = parseCourseFilters({
      auditoria: ['vazrastni', 'nyakoy'],
      kategoria: 'ezitsi',
      ezik: ['nemski', 'angliyski'],
      format: 'onlayn',
      finansirane: 'vaucher',
      nachalo: '2026-11',
      sortirane: 'tsena',
      pokazani: '18',
    })

    expect(filters).toEqual({
      audience: ['adults'],
      category: ['languages'],
      language: ['english', 'german'],
      format: ['online'],
      voucher: true,
      start: '2026-11',
      sort: 'price',
      shown: 18,
    })
    expect(activeFilterCount(filters)).toBe(7)
  })

  it('round-trip, leaving the defaults out', () => {
    expect(courseFiltersQuery(emptyCourseFilters)).toBe('')
    const query = '?auditoria=vazrastni&ezik=angliyski&ezik=nemski&nachalo=2026-11&pokazani=18'
    const filters = parseCourseFilters(
      Object.fromEntries(
        [...new URLSearchParams(query).keys()].map((key) => [
          key,
          new URLSearchParams(query).getAll(key),
        ]),
      ),
    )
    expect(courseFiltersQuery(filters)).toBe(query)
  })

  it('keep «Покажи още» to whole pages within limits', () => {
    expect(parseCourseFilters({ pokazani: '10' }).shown).toBe(18)
    expect(parseCourseFilters({ pokazani: '-5' }).shown).toBe(9)
    expect(parseCourseFilters({ pokazani: '100000' }).shown).toBe(180)
    expect(parseCourseFilters({ nachalo: '2026-13' }).start).toBeUndefined()
  })

  it('read the month of a date in Bulgaria', () => {
    expect(monthOf('2026-10-31T22:00:00.000Z')).toBe('2026-11')
    expect(monthOf('2026-06-30T21:00:00.000Z')).toBe('2026-07')
  })

  it('read and write the state filter', () => {
    expect(parseCourseFilters({ sastoyanie: 'v-hod' }).status).toBe('running')
    expect(parseCourseFilters({ sastoyanie: 'nyakakvo' }).status).toBeUndefined()
    expect(courseFiltersQuery({ ...emptyCourseFilters, status: 'none' })).toBe(
      '?sastoyanie=bez-data',
    )
  })
})
