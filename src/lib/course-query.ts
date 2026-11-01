import type { Payload } from 'payload'
import { type CourseFilters, courseSort, courseWhere } from './course-filters'

// The course listing's reads, on a Payload instance so integration tests run them against a real
// database. The site calls them through the cached wrappers in src/lib/cms.ts.

/** One page of the listing (or several, after «Покажи още»), as an anonymous visitor. */
export async function findCourses(payload: Payload, filters: CourseFilters, today: string) {
  const { docs, totalDocs } = await payload.find({
    collection: 'courses',
    locale: 'bg',
    depth: 0,
    where: courseWhere(filters, today),
    sort: courseSort(filters),
    limit: filters.shown,
    overrideAccess: false,
  })
  return { docs, totalDocs }
}

const monthIn = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Sofia',
  year: 'numeric',
  month: '2-digit',
})

/** The months (YYYY-MM, in Bulgaria) in which listed courses start: the «Начало» options. */
export async function findCourseMonths(payload: Payload, today: string): Promise<string[]> {
  const { docs } = await payload.find({
    collection: 'courses',
    depth: 0,
    where: { startDate: { greater_than_equal: today } },
    select: { startDate: true },
    sort: 'startDate',
    pagination: false,
    overrideAccess: false,
  })
  const months = docs.flatMap((course) =>
    course.startDate ? [monthIn.format(new Date(course.startDate))] : [],
  )
  return [...new Set(months)]
}

/** A published course by its slug, as an anonymous visitor. */
export async function findCourse(payload: Payload, slug: string) {
  const { docs } = await payload.find({
    collection: 'courses',
    locale: 'bg',
    depth: 0,
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: false,
  })
  return docs[0] ?? null
}

/**
 * «Подобни курсове»: listed courses of the same category, the same language first, without the
 * course itself; up to six.
 */
export async function findRelatedCourses(
  payload: Payload,
  course: { id: number; category: string; language?: string | null },
  today: string,
) {
  const { docs } = await payload.find({
    collection: 'courses',
    locale: 'bg',
    depth: 0,
    where: {
      and: [
        { id: { not_equals: course.id } },
        { category: { equals: course.category } },
        { or: [{ startDate: { greater_than_equal: today } }, { startDate: { exists: false } }] },
      ],
    },
    sort: ['startDate', 'title'],
    limit: 24,
    overrideAccess: false,
  })
  const same = docs.filter((doc) => course.language && doc.language === course.language)
  const other = docs.filter((doc) => !same.includes(doc))
  return [...same, ...other].slice(0, 6)
}
