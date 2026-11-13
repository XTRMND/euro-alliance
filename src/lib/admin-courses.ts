import { type CourseState, type SiteCourse, courseState } from './course-state'
import { type CourseCategoryValue, courseCategoryValues, courseTags } from './courses'
import { formatDateLong, formatPrice } from './format'
import { type Language, languages } from './routes'

// The admin's course list (Figma «Admin · 02 Езикови курсове · Курсове», 356:100): a course as a
// row, and the rows in groups. Without Payload, so it's unit-tested.

export const groupings = ['language', 'category', 'audience', 'none'] as const
export type Grouping = (typeof groupings)[number]

export const groupingLabels: Record<Grouping, string> = {
  language: 'Език',
  category: 'Програма',
  audience: 'Аудитория',
  none: 'Без групиране',
}

export const languageLabels: Record<Language, string> = {
  english: 'Английски',
  german: 'Немски',
  french: 'Френски',
  spanish: 'Испански',
  italian: 'Италиански',
  bulgarian: 'Български',
  russian: 'Руски',
}
export const categoryLabels: Record<CourseCategoryValue, string> = {
  languages: 'Езикови курсове',
  vocational: 'Професии (ЦПО)',
  teachers: 'Педагогически специалисти',
  farmers: 'Земеделски стопани',
  computer: 'Компютърни курсове',
}
export const audienceLabels = { students: 'Ученици', adults: 'Възрастни', companies: 'Фирми' }
const formatLabels = { 'in-person': 'Присъствено', online: 'Онлайн' }

/** The languages in the list's order (356:283). */
const languageOrder: Language[] = [
  'english',
  'german',
  'french',
  'bulgarian',
  'spanish',
  'italian',
  'russian',
]

export type CourseRow = {
  id: number
  title: string
  draft: boolean
  /** «Възрастни • Онлайн» */
  tags: string
  level?: string
  /** «3 ноември 2026», with «в ход» when the group has started. */
  start?: string
  running: boolean
  seats?: number
  /** «495 €», «Безплатно» or nothing: the price comes from «Цени». */
  price?: string
  priceLabel?: string
}

export function courseRow(
  course: SiteCourse & { _status?: string | null },
  today: string,
): CourseRow {
  const state: CourseState = courseState(course, today)
  return {
    id: course.id,
    title: course.title,
    draft: course._status !== 'published',
    tags: courseTags(course, {
      audience: audienceLabels,
      format: formatLabels,
      voucher: 'С ваучер',
      foreigners: 'За чужденци',
    }).join(' • '),
    level: course.level || undefined,
    start: state.group ? formatDateLong(state.group.start) : undefined,
    running: state.status === 'running',
    seats: state.seats,
    price: course.free
      ? 'Безплатно'
      : state.price
        ? formatPrice(state.price.price, state.price.currency)
        : undefined,
    priceLabel: course.free ? undefined : state.price?.label || undefined,
  }
}

export type CourseGroupRows = {
  key: string
  label: string
  /** A language's flag sticker. */
  language?: Language
  rows: CourseRow[]
}

type Groupable = Pick<SiteCourse, 'language' | 'category' | 'audience'>

/**
 * The rows in groups. By language, every language has its group, even an empty one («няма
 * курсове»); the other groupings list only the groups that have courses.
 */
export function groupCourses<C extends Groupable>(
  courses: C[],
  by: Grouping,
  row: (course: C) => CourseRow,
): CourseGroupRows[] {
  const rowsOf = (match: (course: C) => boolean) => courses.filter(match).map(row)
  switch (by) {
    case 'language': {
      const groups: CourseGroupRows[] = languageOrder
        .filter((language) => languages.includes(language))
        .map((language) => ({
          key: language,
          label: languageLabels[language],
          language,
          rows: rowsOf((course) => course.language === language),
        }))
      const other = rowsOf((course) => !course.language)
      return other.length ? [...groups, { key: 'other', label: 'Без език', rows: other }] : groups
    }
    case 'category':
      return courseCategoryValues
        .map((category) => ({
          key: category,
          label: categoryLabels[category],
          rows: rowsOf((course) => course.category === category),
        }))
        .filter((group) => group.rows.length)
    case 'audience': {
      const groups = (['adults', 'students', 'companies'] as const).map((audience) => ({
        key: audience,
        label: audienceLabels[audience],
        rows: rowsOf((course) => course.audience === audience),
      }))
      return [
        ...groups,
        { key: 'other', label: 'Без аудитория', rows: rowsOf((course) => !course.audience) },
      ].filter((group) => group.rows.length)
    }
    case 'none':
      return [{ key: 'all', label: '', rows: courses.map(row) }]
  }
}

/** «няма курсове», «1 курс», «3 курса». */
export const coursesLabel = (n: number) =>
  n === 0 ? 'няма курсове' : `${n} ${n === 1 ? 'курс' : 'курса'}`
