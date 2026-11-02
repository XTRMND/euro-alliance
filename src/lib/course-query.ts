import type { Payload } from 'payload'
import type { Course } from '@/payload-types'
import { type CourseFilters, courseMonths, filterCourses } from './course-filters'
import { withStates } from './course-state'

// The course reads, on a Payload instance so integration tests run them against a real database.
// The site calls them through the cached wrappers in src/lib/cms.ts. Every list starts from all
// published courses (a few dozen): their states come from their groups, so the filters and the
// order run in code (src/lib/course-filters.ts, src/lib/course-state.ts).

/** Every published course, as an anonymous visitor. */
export async function findAllCourses(payload: Payload): Promise<Course[]> {
  const { docs } = await payload.find({
    collection: 'courses',
    locale: 'bg',
    depth: 0,
    pagination: false,
    overrideAccess: false,
  })
  return docs
}

/** One page of the listing (or several, after «Покажи още»). */
export function listCourses(courses: Course[], filters: CourseFilters, today: string) {
  const listed = filterCourses(courses, filters, today)
  return {
    docs: listed.slice(0, filters.shown).map(({ course }) => course),
    totalDocs: listed.length,
  }
}

export async function findCourses(payload: Payload, filters: CourseFilters, today: string) {
  return listCourses(await findAllCourses(payload), filters, today)
}

/** The months (YYYY-MM, in Bulgaria) in which upcoming groups start: the «Начало» options. */
export async function findCourseMonths(payload: Payload, today: string): Promise<string[]> {
  return courseMonths(await findAllCourses(payload), today)
}

/** A published course by its slug, with its groups' offices, as an anonymous visitor. */
export async function findCourse(payload: Payload, slug: string) {
  const { docs } = await payload.find({
    collection: 'courses',
    locale: 'bg',
    depth: 1,
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: false,
  })
  return docs[0] ?? null
}

/**
 * «Подобни курсове»: courses of the same category in the list order, the same language first,
 * without the course itself; up to six.
 */
export function relatedCourses(
  courses: Course[],
  course: { id: number; category: string; language?: string | null },
  today: string,
): Course[] {
  const listed = withStates(
    courses.filter((doc) => doc.id !== course.id && doc.category === course.category),
    today,
  ).map((item) => item.course)
  const same = listed.filter((doc) => course.language && doc.language === course.language)
  const other = listed.filter((doc) => !same.includes(doc))
  return [...same, ...other].slice(0, 6)
}

export async function findRelatedCourses(
  payload: Payload,
  course: { id: number; category: string; language?: string | null },
  today: string,
) {
  return relatedCourses(await findAllCourses(payload), course, today)
}
