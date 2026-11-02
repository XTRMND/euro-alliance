import type { Course } from '@/payload-types'
import {
  type CourseStatus,
  type CourseState,
  compareCourses,
  courseStatuses,
  currentGroups,
  withStates,
} from './course-state'
import {
  type CourseAudience,
  type CourseCategoryValue,
  type CourseFormat,
  courseAudiences,
  courseCategoryValues,
  courseFormats,
} from './courses'
import {
  courseAudienceSegments,
  courseCategories,
  courseFilterValues,
  courseFormatSegments,
  courseStatusSegments,
  type Language,
  languages,
  languageSegments,
  queryParams,
} from './routes'

// The course listing's filters, sort and «Покажи още», all in the URL query (docs/motion.md § 8):
// /kursove?auditoria=vazrastni&ezik=nemski&nachalo=2026-11&pokazani=18. Unknown values are
// ignored, so an old or mistyped link still shows a sensible list. The listing shows every
// published course with its state (src/lib/course-state.ts); the filters and the sort run on the
// whole list in code: the states come from the groups, which a database query can't order by.

export const coursesPageSize = 9

export type CourseSort = 'soonest' | 'price'

export type CourseFilters = {
  audience: CourseAudience[]
  category: CourseCategoryValue[]
  language: Language[]
  format: CourseFormat[]
  voucher: boolean
  /** Upcoming, running or without a date; every course when unset. */
  status?: CourseStatus
  /** A month, YYYY-MM. */
  start?: string
  sort: CourseSort
  /** How many courses are shown: a multiple of the page size. */
  shown: number
}

export const emptyCourseFilters: CourseFilters = {
  audience: [],
  category: [],
  language: [],
  format: [],
  voucher: false,
  sort: 'soonest',
  shown: coursesPageSize,
}

type SearchParams = Record<string, string | string[] | undefined>

const all = (params: SearchParams, name: string): string[] => {
  const value = params[name]
  return value === undefined ? [] : Array.isArray(value) ? value : [value]
}

/** The option keys whose URL values appear in the query, in the options' own order. */
function pick<K extends string>(
  options: readonly K[],
  segments: Record<K, string>,
  values: string[],
): K[] {
  return options.filter((option) => values.includes(segments[option]))
}

export function parseCourseFilters(params: SearchParams): CourseFilters {
  const start = all(params, queryParams.start)[0]
  const shown = Number.parseInt(all(params, queryParams.shown)[0] ?? '', 10)

  return {
    audience: pick(courseAudiences, courseAudienceSegments, all(params, queryParams.audience)),
    category: pick(courseCategoryValues, courseCategories, all(params, queryParams.category)),
    language: pick(languages, languageSegments, all(params, queryParams.language)),
    format: pick(courseFormats, courseFormatSegments, all(params, queryParams.format)),
    voucher: all(params, queryParams.funding).includes(courseFilterValues.voucher),
    status: pick(courseStatuses, courseStatusSegments, all(params, queryParams.status))[0],
    start: start && /^\d{4}-(0[1-9]|1[0-2])$/.test(start) ? start : undefined,
    sort: all(params, queryParams.sort)[0] === courseFilterValues.sortPrice ? 'price' : 'soonest',
    shown:
      Number.isFinite(shown) && shown > coursesPageSize
        ? Math.min(Math.ceil(shown / coursesPageSize) * coursesPageSize, 20 * coursesPageSize)
        : coursesPageSize,
  }
}

/** The query string for `filters`, defaults left out ('' when nothing is set). */
export function courseFiltersQuery(filters: CourseFilters): string {
  const query = new URLSearchParams()
  for (const value of filters.audience)
    query.append(queryParams.audience, courseAudienceSegments[value])
  for (const value of filters.category) query.append(queryParams.category, courseCategories[value])
  for (const value of filters.language) query.append(queryParams.language, languageSegments[value])
  for (const value of filters.format) query.append(queryParams.format, courseFormatSegments[value])
  if (filters.voucher) query.append(queryParams.funding, courseFilterValues.voucher)
  if (filters.status) query.append(queryParams.status, courseStatusSegments[filters.status])
  if (filters.start) query.append(queryParams.start, filters.start)
  if (filters.sort === 'price') query.append(queryParams.sort, courseFilterValues.sortPrice)
  if (filters.shown > coursesPageSize) query.append(queryParams.shown, String(filters.shown))
  const text = query.toString()
  return text ? `?${text}` : ''
}

/**
 * How many filters are on (the count on the mobile «Филтри» button). Sort isn't a filter, and the
 * state has its own pills above the list.
 */
export function activeFilterCount(filters: CourseFilters): number {
  return (
    filters.audience.length +
    filters.category.length +
    filters.language.length +
    filters.format.length +
    (filters.voucher ? 1 : 0) +
    (filters.start ? 1 : 0)
  )
}

const monthIn = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Sofia',
  year: 'numeric',
  month: '2-digit',
})

/** The month (YYYY-MM, in Bulgaria) of a date. */
export function monthOf(date: string): string {
  return monthIn.format(new Date(date))
}

/** The months in which upcoming groups start: the «Начало» options. */
export function courseMonths(courses: Pick<Course, 'groups' | 'voucherEligible'>[], today: string) {
  const months = courses.flatMap((course) =>
    currentGroups(course, today)
      .filter((item) => item.status === 'upcoming')
      .map((item) => monthOf(item.group.startDate)),
  )
  return [...new Set(months)].sort()
}

type Stated<C> = { course: C; state: CourseState }

const priceOf = ({ state }: Stated<unknown>) => state.group?.price ?? Number.POSITIVE_INFINITY

/**
 * The listing: every course with its state, narrowed by every filter that's on, in the list
 * order (upcoming, running, without a date) or the lowest price first. Within a group of options
 * they add up (OR); groups narrow each other (AND). A course matches a format through its own
 * format or one of its groups', and a month through an upcoming group starting in it.
 */
export function filterCourses<C extends Course>(
  courses: C[],
  filters: CourseFilters,
  today: string,
): Stated<C>[] {
  const listed = withStates(courses, today).filter(({ course, state }) => {
    if (filters.status && state.status !== filters.status) return false
    if (filters.audience.length && !filters.audience.some((value) => value === course.audience))
      return false
    if (filters.category.length && !filters.category.includes(course.category)) return false
    if (filters.language.length && !filters.language.some((value) => value === course.language))
      return false
    const groups = currentGroups(course, today)
    if (filters.format.length) {
      const formats = [course.format, ...groups.map(({ group }) => group.format)]
      if (!formats.some((format) => format && filters.format.includes(format))) return false
    }
    if (filters.voucher && !course.voucherEligible) return false
    if (filters.start) {
      const starts = groups.filter((item) => item.status === 'upcoming')
      if (!starts.some(({ group }) => monthOf(group.startDate) === filters.start)) return false
    }
    return true
  })
  return filters.sort === 'price'
    ? listed.sort((a, b) => priceOf(a) - priceOf(b) || compareCourses(a, b))
    : listed
}
