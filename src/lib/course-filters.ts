import type { Where } from 'payload'
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
  type Language,
  languages,
  languageSegments,
  queryParams,
} from './routes'

// The course listing's filters, sort and «Покажи още», all in the URL query (docs/motion.md § 8):
// /kursove?auditoria=vazrastni&ezik=nemski&nachalo=2026-11&pokazani=18. Unknown values are
// ignored, so an old or mistyped link still shows a sensible list.

export const coursesPageSize = 9

export type CourseSort = 'soonest' | 'price'

export type CourseFilters = {
  audience: CourseAudience[]
  category: CourseCategoryValue[]
  language: Language[]
  format: CourseFormat[]
  voucher: boolean
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
  if (filters.start) query.append(queryParams.start, filters.start)
  if (filters.sort === 'price') query.append(queryParams.sort, courseFilterValues.sortPrice)
  if (filters.shown > coursesPageSize) query.append(queryParams.shown, String(filters.shown))
  const text = query.toString()
  return text ? `?${text}` : ''
}

/** How many filters are on (the count on the mobile «Филтри» button). Sort isn't a filter. */
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

/** Midnight in Bulgaria on the first of `month` (YYYY-MM), as an ISO string. */
export function monthStartInSofia(month: string): string {
  const [year, number] = month.split('-').map(Number)
  // Noon UTC on the 1st is the same day in Sofia; read the offset there, then step to midnight.
  const noon = new Date(Date.UTC(year, number - 1, 1, 12))
  const offset = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Sofia',
    timeZoneName: 'longOffset',
  })
    .formatToParts(noon)
    .find((part) => part.type === 'timeZoneName')
    ?.value.replace('GMT', '')
  return new Date(`${month}-01T00:00:00${offset || '+00:00'}`).toISOString()
}

function nextMonth(month: string): string {
  const [year, number] = month.split('-').map(Number)
  return number === 12 ? `${year + 1}-01` : `${year}-${String(number + 1).padStart(2, '0')}`
}

/**
 * The listing's Payload query: courses starting today or later, or with no start date (open
 * enrolment), narrowed by every filter that's on. Within a group the options add up (OR);
 * groups narrow each other (AND).
 */
export function courseWhere(filters: CourseFilters, today: string): Where {
  const and: Where[] = [
    { or: [{ startDate: { greater_than_equal: today } }, { startDate: { exists: false } }] },
  ]
  if (filters.audience.length) and.push({ audience: { in: filters.audience } })
  if (filters.category.length) and.push({ category: { in: filters.category } })
  if (filters.language.length) and.push({ language: { in: filters.language } })
  if (filters.format.length) and.push({ format: { in: filters.format } })
  if (filters.voucher) and.push({ voucherEligible: { equals: true } })
  if (filters.start) {
    and.push({
      startDate: {
        greater_than_equal: monthStartInSofia(filters.start),
        less_than: monthStartInSofia(nextMonth(filters.start)),
      },
    })
  }
  return { and }
}

/** Soonest first (courses without a date last); or the lowest price first, then soonest. */
export function courseSort(filters: CourseFilters): string[] {
  return filters.sort === 'price' ? ['price', 'startDate'] : ['startDate', 'title']
}
