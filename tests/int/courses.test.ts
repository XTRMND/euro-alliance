import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { emptyCourseFilters, type CourseFilters } from '@/lib/course-filters'
import { findCourseMonths, findCourses } from '@/lib/course-query'
import type { Course } from '@/payload-types'

// The course listing's queries against a real database, with obviously fake courses (year
// 2099) that this file removes again.

let payload: Payload
const created: number[] = []
const today = '2099-01-10T22:00:00.000Z'

const make = async (
  title: string,
  data: Partial<Course>,
  status: 'draft' | 'published' = 'published',
) => {
  const course = await payload.create({
    collection: 'courses',
    locale: 'bg',
    data: { title, category: 'languages', topic: 'english', _status: status, ...data },
  })
  created.push(course.id)
  return course
}

const titles = async (filters: Partial<CourseFilters>) =>
  (await findCourses(payload, { ...emptyCourseFilters, ...filters }, today)).docs.map(
    (course) => course.title,
  )

beforeAll(async () => {
  payload = await getPayload({ config })
  await make('Тест минал', { startDate: '2099-01-05T12:00:00.000Z' })
  await make('Тест A', {
    startDate: '2099-02-01T12:00:00.000Z',
    audience: 'adults',
    language: 'german',
    format: 'online',
    price: 300,
  })
  await make('Тест B', {
    startDate: '2099-01-20T12:00:00.000Z',
    audience: 'students',
    language: 'english',
    format: 'in-person',
    voucherEligible: true,
    price: 100,
  })
  await make('Тест C', { audience: 'adults', category: 'computer', topic: 'computer' })
  await make('Тест чернова', { startDate: '2099-01-25T12:00:00.000Z' }, 'draft')
  // 1 March at 00:30 in Sofia is still 28 February in UTC.
  await make('Тест D', { startDate: '2099-02-28T22:30:00.000Z', audience: 'adults' })
})

afterAll(async () => {
  await payload.delete({ collection: 'courses', where: { id: { in: created } } })
  await payload.destroy()
})

describe('course listing', () => {
  it('lists published courses from today on, soonest first, open enrolment last', async () => {
    expect(await titles({})).toEqual(['Тест B', 'Тест A', 'Тест D', 'Тест C'])
  })

  it('adds up options within a group and narrows across groups', async () => {
    expect(await titles({ audience: ['adults'] })).toEqual(['Тест A', 'Тест D', 'Тест C'])
    expect(await titles({ audience: ['adults', 'students'], format: ['online'] })).toEqual([
      'Тест A',
    ])
    expect(await titles({ language: ['english', 'german'] })).toEqual(['Тест B', 'Тест A'])
    expect(await titles({ category: ['computer'] })).toEqual(['Тест C'])
    expect(await titles({ voucher: true })).toEqual(['Тест B'])
  })

  it('filters by the month of the start date in Bulgarian time', async () => {
    expect(await titles({ start: '2099-02' })).toEqual(['Тест A'])
    expect(await titles({ start: '2099-03' })).toEqual(['Тест D'])
  })

  it('sorts by price, then by start date', async () => {
    expect(await titles({ sort: 'price' })).toEqual(['Тест B', 'Тест A', 'Тест D', 'Тест C'])
  })

  it('shows one page and counts them all', async () => {
    const page = await findCourses(payload, { ...emptyCourseFilters, shown: 2 }, today)
    expect([page.docs.length, page.totalDocs]).toEqual([2, 4])
  })

  it('offers the months in which listed courses start', async () => {
    expect(await findCourseMonths(payload, today)).toEqual(['2099-01', '2099-02', '2099-03'])
  })
})
