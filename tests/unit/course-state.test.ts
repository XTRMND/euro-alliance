import { describe, expect, it } from 'vitest'
import { courseState } from '@/lib/course-state'

const today = '2026-10-31T22:00:00.000Z' // 1 November 2026 in Sofia

describe('course states (126:1940)', () => {
  it('is open with a price and seats', () => {
    expect(
      courseState({ startDate: '2026-11-03T12:00:00.000Z', seats: 5, price: 520 }, today),
    ).toEqual({ enrolment: 'open', pricing: 'regular', seats: 5, fewSeats: false })
  })

  it('marks a promotion only when the regular price is higher', () => {
    expect(courseState({ price: 495, regularPrice: 560 }, today).pricing).toBe('promotion')
    expect(courseState({ price: 495, regularPrice: 495 }, today).pricing).toBe('regular')
  })

  it('prices a voucher course as the voucher value', () => {
    expect(
      courseState({ price: 460.16, regularPrice: 560, voucherEligible: true }, today).pricing,
    ).toBe('voucher')
  })

  it('highlights one or two free seats', () => {
    expect(courseState({ seats: 2 }, today).fewSeats).toBe(true)
    expect(courseState({ seats: 3 }, today).fewSeats).toBe(false)
  })

  it('closes enrolment when full or started', () => {
    expect(courseState({ seats: 0 }, today).enrolment).toBe('closed')
    expect(courseState({ startDate: '2026-10-30T12:00:00.000Z', seats: 2 }, today)).toMatchObject({
      enrolment: 'closed',
      fewSeats: false,
    })
    expect(courseState({ startDate: '2026-11-01T12:00:00.000Z' }, today).enrolment).toBe('open')
  })

  it('shows no price and no seats when the CMS has none', () => {
    expect(courseState({}, today)).toEqual({
      enrolment: 'open',
      pricing: 'none',
      seats: undefined,
      fewSeats: false,
    })
  })
})
