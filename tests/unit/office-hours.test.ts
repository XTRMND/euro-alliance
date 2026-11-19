import { describe, expect, it } from 'vitest'
import {
  activeHours,
  daysOf,
  formatLine,
  type HoursLabels,
  hoursLines,
  hoursSummary,
  inSeason,
  type OfficeHours,
  openingHoursSpecification,
  seasonDates,
  seasonOf,
} from '@/lib/office-hours'

// Fake hours of the same shape as an office's: a week with three kinds of day, and a season.
const hours: OfficeHours = {
  regular: [
    { from: 'mon', to: 'thu', opens: '9:00', closes: '18:00' },
    { from: 'fri', opens: '9:00', closes: '16:00' },
    { from: 'sat', opens: '10:00', closes: '12:00' },
  ],
  seasonal: {
    startDay: 15,
    startMonth: '6',
    endDay: 1,
    endMonth: '9',
    rows: [{ from: 'mon', to: 'fri', opens: '08:30', closes: '17:00' }],
  },
}
const labels: HoursLabels = {
  days: { mon: 'Mo', tue: 'Tu', wed: 'We', thu: 'Th', fri: 'Fr', sat: 'Sa', sun: 'Su' },
  and: '&',
  closedOne: 'day off',
  closedMany: 'days off',
}
const sofia = (day: string) => new Date(`${day}T09:00:00.000Z`)

describe('the days of a row', () => {
  it('runs from the first day to the last, or is one day', () => {
    expect(daysOf({ from: 'mon', to: 'thu' })).toEqual(['mon', 'tue', 'wed', 'thu'])
    expect(daysOf({ from: 'fri' })).toEqual(['fri'])
    expect(daysOf({ from: 'sat', to: 'mon' })).toEqual(['sat', 'sun', 'mon'])
  })
})

describe('the season', () => {
  const season = seasonOf(hours)!

  it('is read from the CMS’s values', () => {
    expect(season).toEqual({ startDay: 15, startMonth: 6, endDay: 1, endMonth: 9 })
    expect(seasonDates(season, 'en')).toEqual({ from: 'June 15', to: 'September 1' })
  })

  it('needs its four dates and a week', () => {
    expect(seasonOf({ ...hours, seasonal: { ...hours.seasonal, endMonth: null } })).toBeNull()
    expect(seasonOf({ ...hours, seasonal: { ...hours.seasonal, rows: [] } })).toBeNull()
    expect(seasonOf({ regular: hours.regular })).toBeNull()
  })

  it('includes its first and last day', () => {
    expect(inSeason(season, sofia('2026-06-14'))).toBe(false)
    expect(inSeason(season, sofia('2026-06-15'))).toBe(true)
    expect(inSeason(season, sofia('2026-09-01'))).toBe(true)
    expect(inSeason(season, sofia('2026-09-02'))).toBe(false)
  })

  it('may run over New Year', () => {
    const winter = { startDay: 20, startMonth: 12, endDay: 10, endMonth: 1 }
    expect(inSeason(winter, sofia('2026-12-25'))).toBe(true)
    expect(inSeason(winter, sofia('2027-01-05'))).toBe(true)
    expect(inSeason(winter, sofia('2027-02-01'))).toBe(false)
  })

  it('takes over between its dates by itself', () => {
    expect(activeHours(hours, sofia('2026-11-19')).rows).toHaveLength(3)
    expect(activeHours(hours, sofia('2026-11-19')).season).toBeNull()
    expect(activeHours(hours, sofia('2026-07-01')).rows).toHaveLength(1)
    expect(activeHours(hours, sofia('2026-07-01')).season).toEqual(season)
  })
})

describe('the week as lines', () => {
  it('lists the rows, then the days off', () => {
    expect(hoursLines(hours.regular!).map((line) => formatLine(line, labels))).toEqual([
      { days: 'Mo–Th', hours: '9:00–18:00' },
      { days: 'Fr', hours: '9:00–16:00' },
      { days: 'Sa', hours: '10:00–12:00' },
      { days: 'Su', hours: 'day off' },
    ])
  })

  it('puts neighbouring days off together and drops a leading zero', () => {
    expect(hoursSummary(hours.seasonal!.rows!, labels)).toBe('Mo–Fr 8:30–17:00 · Sa & Su days off')
  })

  it('is empty without rows, and skips a row that isn’t hours', () => {
    expect(hoursLines([])).toEqual([])
    expect(hoursSummary([{ from: 'mon', opens: 'morning', closes: '17:00' }], labels)).toBe('')
  })
})

describe('schema.org opening hours', () => {
  it('gives the regular week, and the season with its next dates', () => {
    const spec = openingHoursSpecification(hours, sofia('2026-11-19'))!
    expect(spec).toHaveLength(4)
    expect(spec[0]).toEqual({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].map(
        (day) => `https://schema.org/${day}`,
      ),
      opens: '09:00',
      closes: '18:00',
    })
    // In November the next season is next year's.
    expect(spec[3]).toMatchObject({ validFrom: '2027-06-15', validThrough: '2027-09-01' })
    expect(openingHoursSpecification(hours, sofia('2026-07-01'))![3]).toMatchObject({
      validFrom: '2026-06-15',
      validThrough: '2026-09-01',
    })
  })

  it('is left out for an office without hours', () => {
    expect(openingHoursSpecification(undefined)).toBeUndefined()
    expect(openingHoursSpecification({ regular: [] })).toBeUndefined()
  })
})
