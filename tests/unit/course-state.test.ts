import { describe, expect, it } from 'vitest'
import {
  type CourseGroup,
  courseState,
  currentGroups,
  groupStatus,
  withStates,
} from '@/lib/course-state'
import { resolvePrice } from '@/lib/price'
import type { Price } from '@/payload-types'

const today = '2026-10-31T22:00:00.000Z' // 1 November 2026 in Sofia

type Group = {
  id: string
  start: string
  end?: string
  seats?: number
  price?: number
  regularPrice?: number
}
const course = (groups: Group[], fields: { voucherEligible?: boolean; free?: boolean } = {}) => ({
  // Only the fields the states read; the ids are names, to tell the groups apart. A group's
  // price here is its own price record.
  groups: groups as unknown as CourseGroup[],
  prices: groups
    .filter((group) => group.price !== undefined)
    .map((group) => ({
      group: group.id,
      price: group.price,
      currency: 'EUR',
      regularPrice: group.regularPrice,
    })) as unknown as Price[],
  ...fields,
})
const upcoming = { id: 'u', start: '2026-11-03T12:00:00.000Z' }
const running = { id: 'r', start: '2026-10-04T12:00:00.000Z' }

describe('course states (the groups model of 02.11.2026)', () => {
  it('counts a group as upcoming from its start day, running after it, over after its end', () => {
    expect(groupStatus({ start: '2026-11-01T12:00:00.000Z' }, today)).toBe('upcoming')
    expect(groupStatus(running, today)).toBe('running')
    expect(groupStatus({ ...running, end: '2026-10-20T12:00:00.000Z' }, today)).toBe('ended')
    expect(groupStatus({ ...running, end: '2026-12-20T12:00:00.000Z' }, today)).toBe('running')
  })

  it('keeps a started group without an end date running: end dates are never guessed', () => {
    expect(groupStatus({ start: '2022-06-27T12:00:00.000Z' }, today)).toBe('running')
  })

  it('shows the soonest upcoming group, else the latest running one, else no date', () => {
    const later = { id: 'l', start: '2026-12-01T12:00:00.000Z' }
    expect(courseState(course([later, running, upcoming]), today).group?.id).toBe('u')
    const older = { id: 'o', start: '2026-09-01T12:00:00.000Z' }
    expect(courseState(course([older, running]), today)).toMatchObject({
      status: 'running',
      group: { id: 'r' },
      enrolment: 'inquiry',
    })
    expect(courseState(course([]), today)).toMatchObject({ status: 'none', enrolment: 'inquiry' })
    const ended = { ...running, end: '2026-10-20T12:00:00.000Z' }
    expect(courseState(course([ended]), today).status).toBe('none')
  })

  it('opens enrolment only for an upcoming group with seats', () => {
    expect(courseState(course([{ ...upcoming, seats: 5 }]), today).enrolment).toBe('open')
    expect(courseState(course([{ ...upcoming, seats: 0 }]), today).enrolment).toBe('inquiry')
    expect(courseState(course([upcoming]), today).enrolment).toBe('open')
  })

  it('prices from the shown group: promotion, voucher, none', () => {
    const priced = { ...upcoming, price: 495, regularPrice: 560 }
    expect(courseState(course([priced]), today).pricing).toBe('promotion')
    expect(courseState(course([{ ...priced, regularPrice: 495 }]), today).pricing).toBe('regular')
    expect(courseState(course([priced], { voucherEligible: true }), today).pricing).toBe('voucher')
    expect(courseState(course([upcoming]), today).pricing).toBe('none')
  })

  it('shows a free course as free, with an inquiry, with or without a group', () => {
    expect(courseState(course([], { free: true }), today)).toMatchObject({
      status: 'none',
      pricing: 'free',
      enrolment: 'inquiry',
    })
    expect(courseState(course([{ ...upcoming, seats: 5 }], { free: true }), today)).toMatchObject({
      status: 'upcoming',
      pricing: 'free',
      enrolment: 'inquiry',
    })
  })

  it('highlights one or two free seats of an upcoming group', () => {
    expect(courseState(course([{ ...upcoming, seats: 2 }]), today).fewSeats).toBe(true)
    expect(courseState(course([{ ...upcoming, seats: 3 }]), today).fewSeats).toBe(false)
    expect(courseState(course([{ ...running, seats: 2 }]), today).fewSeats).toBe(false)
  })

  it('lists the groups that aren’t over, upcoming first', () => {
    const ended = {
      id: 'e',
      start: '2026-01-01T12:00:00.000Z',
      end: '2026-02-01T12:00:00.000Z',
    }
    expect(currentGroups(course([running, ended, upcoming]), today).map((g) => g.group.id)).toEqual(
      ['u', 'r'],
    )
  })

  it('orders lists: upcoming (soonest), running (latest start), then without a date (by title)', () => {
    const courses = [
      { title: 'В', ...course([]) },
      { title: 'Б', ...course([running]) },
      { title: 'А', ...course([]) },
      { title: 'Г', ...course([{ id: 'x', start: '2026-12-01T12:00:00.000Z' }]) },
      { title: 'Д', ...course([upcoming]) },
      { title: 'Е', ...course([{ id: 'y', start: '2026-10-20T12:00:00.000Z' }]) },
    ]
    expect(withStates(courses, today).map(({ course }) => course.title)).toEqual([
      'Д',
      'Г',
      'Е',
      'Б',
      'А',
      'В',
    ])
  })
})

describe('the price resolver (docs/admin-redesign.md, decision 6)', () => {
  const price = (id: number, group: number | null, amount: number) =>
    ({ id, course: 1, group, price: amount, currency: 'EUR' }) as unknown as Price
  const base = price(1, null, 500)
  const own = price(2, 7, 450)

  it('shows the group’s own price, or else the course’s base price', () => {
    expect(resolvePrice([base, own], { id: 7 })).toBe(own)
    expect(resolvePrice([base, own], { id: 8 })).toBe(base)
    expect(resolvePrice([own], { id: 8 })).toBeUndefined()
  })

  it('shows the base price for a course without a group, and nothing without prices', () => {
    expect(resolvePrice([base, own])).toBe(base)
    expect(resolvePrice([own])).toBeUndefined()
    expect(resolvePrice(undefined, { id: 7 })).toBeUndefined()
  })

  it('prices a course from its base price when the shown group has none of its own', () => {
    const upcomingGroup = { id: 9, start: '2026-11-03T12:00:00.000Z' } as unknown as CourseGroup
    const state = courseState({ groups: [upcomingGroup], prices: [base] }, today)
    expect([state.pricing, state.price]).toEqual(['regular', base])
    expect(courseState({ groups: [], prices: [base] }, today).price).toBe(base)
  })
})
