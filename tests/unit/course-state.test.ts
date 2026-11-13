import { describe, expect, it } from 'vitest'
import {
  type CourseGroup,
  courseState,
  currentGroups,
  groupStatus,
  withStates,
} from '@/lib/course-state'

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
  // Only the fields the states read; the ids are names, to tell the groups apart.
  groups: groups as unknown as CourseGroup[],
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
