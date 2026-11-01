import { describe, expect, it } from 'vitest'
import {
  currentYear,
  formatDateLong,
  formatDateNumeric,
  formatPrice,
  startOfTodayInSofia,
  telHref,
} from '@/lib/format'

describe('formatDateNumeric', () => {
  it('writes dd.mm.yyyy without « г.»', () => {
    expect(formatDateNumeric('2003-11-15T12:00:00.000Z')).toBe('15.11.2003')
  })

  it('uses Bulgarian time', () => {
    // 22:30 UTC on 31 December is already 1 January in Sofia.
    expect(formatDateNumeric('2025-12-31T22:30:00.000Z')).toBe('01.01.2026')
  })
})

describe('currentYear', () => {
  it('turns over at midnight in Sofia', () => {
    expect(currentYear(new Date('2026-12-31T22:30:00.000Z'))).toBe(2027)
  })
})

describe('telHref', () => {
  it('keeps the digits and the plus sign', () => {
    expect(telHref('+359 886 601 108')).toBe('tel:+359886601108')
  })
})

describe('formatDateLong', () => {
  it('writes the day, the month name and the year, as the cards do', () => {
    expect(formatDateLong('2026-11-03T12:00:00.000Z')).toBe('3 ноември 2026')
    expect(formatDateLong('2025-12-31T22:30:00.000Z')).toBe('1 януари 2026')
  })
})

describe('formatPrice', () => {
  it('shows cents only when there are any', () => {
    expect(formatPrice(495)).toBe('495\u00a0€')
    expect(formatPrice(460.16)).toBe('460,16\u00a0€')
  })

  it('keeps the currency it is given', () => {
    expect(formatPrice(1200, 'BGN')).toBe('1200\u00a0лв.')
  })
})

describe('startOfTodayInSofia', () => {
  it('is midnight in Bulgaria, summer and winter', () => {
    expect(startOfTodayInSofia(new Date('2026-07-01T21:30:00.000Z'))).toBe(
      '2026-07-01T21:00:00.000Z',
    )
    expect(startOfTodayInSofia(new Date('2026-11-01T10:00:00.000Z'))).toBe(
      '2026-10-31T22:00:00.000Z',
    )
  })
})
