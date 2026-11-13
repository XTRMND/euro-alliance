import type { Payload } from 'payload'
import type { Course, Price } from '@/payload-types'
import { type CourseFilters, courseMonths, filterCourses } from './course-filters'
import { type CourseGroup, type SiteCourse, withStates } from './course-state'
import { listingCategory } from './courses'

type RelatedTo = Pick<SiteCourse, 'id' | 'category' | 'language' | 'voucherEligible' | 'examPrep'>

// The course reads, on a Payload instance so integration tests run them against a real database.
// The site calls them through the cached wrappers in src/lib/cms.ts. Every list starts from all
// published courses (a few dozen): their states come from their groups, so the filters and the
// order run in code (src/lib/course-filters.ts, src/lib/course-state.ts). A course's groups are
// records of the groups collection and its prices of the prices collection, each read in one query
// and attached as a list (SiteCourse).

/** The courses with their groups and prices (published courses' only, as an anonymous visitor). */
export async function withGroups(
  payload: Payload,
  courses: Course[],
  depth = 0,
  /** The live preview reads as staff: a draft course's groups and prices too. */
  overrideAccess = false,
): Promise<SiteCourse[]> {
  const ids = courses.map((course) => course.id)
  const of = { course: { in: ids } }
  const shared = { locale: 'bg', pagination: false, overrideAccess } as const
  const [groups, prices] = ids.length
    ? await Promise.all([
        payload.find({ collection: 'groups', depth, where: of, sort: 'start', ...shared }),
        payload.find({ collection: 'prices', depth: 0, where: of, sort: 'id', ...shared }),
      ])
    : [{ docs: [] as CourseGroup[] }, { docs: [] as Price[] }]
  const courseOf = (doc: CourseGroup | Price) =>
    typeof doc.course === 'object' ? doc.course.id : doc.course
  return courses.map((course) => ({
    ...course,
    groups: groups.docs.filter((group) => courseOf(group) === course.id),
    prices: prices.docs.filter((price) => courseOf(price) === course.id),
  }))
}

/** Every published course, as an anonymous visitor. */
export async function findAllCourses(payload: Payload): Promise<SiteCourse[]> {
  const { docs } = await payload.find({
    collection: 'courses',
    locale: 'bg',
    depth: 0,
    joins: false,
    pagination: false,
    overrideAccess: false,
  })
  return withGroups(payload, docs)
}

/** One page of the listing (or several, after «Покажи още»). */
export function listCourses(courses: SiteCourse[], filters: CourseFilters, today: string) {
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
export async function findCourse(payload: Payload, slug: string): Promise<SiteCourse | null> {
  const { docs } = await payload.find({
    collection: 'courses',
    locale: 'bg',
    depth: 1,
    joins: false,
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: false,
  })
  return docs[0] ? ((await withGroups(payload, docs, 1))[0] ?? null) : null
}

/**
 * «Подобни курсове»: courses of the same listing category in the list order, the same language first,
 * without the course itself; up to six.
 */
export function relatedCourses(
  courses: SiteCourse[],
  course: RelatedTo,
  today: string,
): SiteCourse[] {
  const category = listingCategory(course)
  const listed = withStates(
    courses.filter((doc) => doc.id !== course.id && listingCategory(doc) === category),
    today,
  ).map((item) => item.course)
  const same = listed.filter((doc) => course.language && doc.language === course.language)
  const other = listed.filter((doc) => !same.includes(doc))
  return [...same, ...other].slice(0, 6)
}

export async function findRelatedCourses(payload: Payload, course: RelatedTo, today: string) {
  return relatedCourses(await findAllCourses(payload), course, today)
}
