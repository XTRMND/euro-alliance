import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { emptyCourseFilters, type CourseFilters } from '@/lib/course-filters'
import { findCourse, findCourseMonths, findCourses, findRelatedCourses } from '@/lib/course-query'
import type { Course } from '@/payload-types'

// The course listing's queries against a real database, with obviously fake courses (year
// 2099) that this file removes again.

let payload: Payload
const created: number[] = []
const today = '2099-01-10T22:00:00.000Z'

// A course, with one group when a start is given (a group's price and format ride along).
const make = async (
  title: string,
  data: Partial<Course> = {},
  group?: { start: string } & Record<string, unknown>,
  status: 'draft' | 'published' = 'published',
) => {
  const course = await payload.create({
    collection: 'courses',
    locale: 'bg',
    data: { title, category: 'languages', topic: 'english', _status: status, ...data },
  })
  created.push(course.id)
  if (group)
    await payload.create({
      collection: 'groups',
      locale: 'bg',
      data: { course: course.id, ...group },
    })
  return course
}

const titles = async (filters: Partial<CourseFilters>) =>
  (await findCourses(payload, { ...emptyCourseFilters, ...filters }, today)).docs.map(
    (course) => course.title,
  )

beforeAll(async () => {
  payload = await getPayload({ config })
  // Started before «today», no end date: running.
  await make('Тест минал', {}, { start: '2099-01-05T12:00:00.000Z' })
  await make(
    'Тест A',
    { audience: 'adults', language: 'german', format: 'online' },
    { start: '2099-02-01T12:00:00.000Z', price: 300 },
  )
  await make(
    'Тест B',
    { audience: 'students', language: 'english', voucherEligible: true },
    { start: '2099-01-20T12:00:00.000Z', price: 100, format: 'in-person' },
  )
  await make('Тест C', { audience: 'adults', category: 'computer', topic: 'computer' })
  // Ended: no date any more.
  await make('Тест E', {}, { start: '2099-01-01T12:00:00.000Z', end: '2099-01-05T12:00:00.000Z' })
  await make('Тест чернова', {}, { start: '2099-01-25T12:00:00.000Z' }, 'draft')
  // 1 March at 00:30 in Sofia is still 28 February in UTC.
  await make('Тест D', { audience: 'adults' }, { start: '2099-02-28T22:30:00.000Z' })
})

afterAll(async () => {
  await payload.delete({ collection: 'courses', where: { id: { in: created } } })
  await payload.destroy()
})

describe('course listing', () => {
  it('lists every published course: upcoming (soonest), running, then without a date', async () => {
    expect(await titles({})).toEqual([
      'Тест B',
      'Тест A',
      'Тест D',
      'Тест минал',
      'Тест C',
      'Тест E',
    ])
  })

  it('filters by state', async () => {
    expect(await titles({ status: 'upcoming' })).toEqual(['Тест B', 'Тест A', 'Тест D'])
    expect(await titles({ status: 'running' })).toEqual(['Тест минал'])
    expect(await titles({ status: 'none' })).toEqual(['Тест C', 'Тест E'])
  })

  it('adds up options within a group and narrows across groups', async () => {
    expect(await titles({ audience: ['adults'] })).toEqual(['Тест A', 'Тест D', 'Тест C'])
    expect(await titles({ audience: ['adults', 'students'], format: ['online'] })).toEqual([
      'Тест A',
    ])
    expect(await titles({ format: ['in-person'] })).toEqual(['Тест B'])
    expect(await titles({ language: ['english', 'german'] })).toEqual(['Тест B', 'Тест A'])
    expect(await titles({ category: ['computer'] })).toEqual(['Тест C'])
    expect(await titles({ voucher: true })).toEqual(['Тест B'])
  })

  it('filters by the month an upcoming group starts in, in Bulgarian time', async () => {
    expect(await titles({ start: '2099-02' })).toEqual(['Тест A'])
    expect(await titles({ start: '2099-03' })).toEqual(['Тест D'])
  })

  it('sorts by price, then in the list order', async () => {
    expect(await titles({ sort: 'price' })).toEqual([
      'Тест B',
      'Тест A',
      'Тест D',
      'Тест минал',
      'Тест C',
      'Тест E',
    ])
  })

  it('shows one page and counts them all', async () => {
    const page = await findCourses(payload, { ...emptyCourseFilters, shown: 2 }, today)
    expect([page.docs.length, page.totalDocs]).toEqual([2, 6])
  })

  it('offers the months in which upcoming groups start', async () => {
    expect(await findCourseMonths(payload, today)).toEqual(['2099-01', '2099-02', '2099-03'])
  })
})

describe('course page', () => {
  it('finds a published course by its slug, and not a draft', async () => {
    expect((await findCourse(payload, 'test-a'))?.title).toBe('Тест A')
    expect(await findCourse(payload, 'test-chernova')).toBeNull()
  })

  it('keeps a draft course’s groups from visitors, and deletes a course’s groups with it', async () => {
    const draft = await payload.find({
      collection: 'courses',
      where: { slug: { equals: 'test-chernova' } },
      draft: true,
      depth: 0,
    })
    const ofDraft = { course: { equals: draft.docs[0].id } }
    const visible = await payload.find({
      collection: 'groups',
      where: ofDraft,
      overrideAccess: false,
    })
    expect(visible.totalDocs).toBe(0)
    expect((await payload.find({ collection: 'groups', where: ofDraft })).totalDocs).toBe(1)
    const gone = await make('Тест за триене', {}, { start: '2099-04-01T12:00:00.000Z' })
    await payload.delete({ collection: 'courses', id: gone.id })
    const left = await payload.find({
      collection: 'groups',
      where: { course: { equals: gone.id } },
    })
    expect(left.totalDocs).toBe(0)
  })

  it('suggests courses of the same category in the list order, the same language first', async () => {
    const course = (await findCourse(payload, 'test-b'))!
    const related = await findRelatedCourses(payload, course, today)
    expect(related.map((c) => c.title)).toEqual(['Тест A', 'Тест D', 'Тест минал', 'Тест E'])
  })
})
