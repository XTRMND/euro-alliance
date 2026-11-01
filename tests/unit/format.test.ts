import { describe, expect, it } from 'vitest'
import { currentYear, formatDateNumeric, telHref } from '@/lib/format'

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
