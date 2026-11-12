import { categoryLabels } from './admin-courses'
import { type CourseCategoryValue, courseCategoryValues } from './courses'
import { formatDateNumeric } from './format'

// The «Цени» screen (Figma «Admin · 04 Цени», 370:1186): every place a price can be set is a row,
// the course's base price («Целия курс») and each of its groups' own, grouped by programme.
// Without Payload, so it's unit-tested: the rows, the filters, what was typed and what to save.

type Id = number | { id: number } | null | undefined
const idOf = (value: Id) => (typeof value === 'object' && value ? value.id : (value ?? null))

export type PriceCourse = {
  id: number
  title: string
  category: CourseCategoryValue
  voucherEligible?: boolean | null
  free?: boolean | null
}
export type PriceGroup = { id: number; course: Id; start: string; name?: string | null }
export type StoredPrice = {
  id: number
  course: Id
  group?: Id
  price: number
  currency: 'EUR' | 'BGN'
  regularPrice?: number | null
  label?: string | null
  note?: string | null
}

/** What the row's four inputs hold, as typed. */
export type PriceValues = { price: string; regularPrice: string; label: string; note: string }

export type PriceRow = {
  /** «c12» for a course's base price, «g7» for a group's. */
  key: string
  course: number
  group?: number
  title: string
  /** «Целия курс» or «Група · 03.11.2026», with the group's name if it has one. */
  scope: string
  category: CourseCategoryValue
  voucher: boolean
  /** A free course: «Безплатно» on the site, whatever is stored. No inputs. */
  free: boolean
  /** The stored price record, when there is one. */
  priceId?: number
  currency: 'EUR' | 'BGN'
  values: PriceValues
}

/** «460,16» for 460.16: the number as it's typed here, with a decimal comma. */
export const numberText = (value: number | null | undefined) =>
  typeof value === 'number' ? String(value).replace('.', ',') : ''

/** The typed number: «460,16» or «460.16»; undefined when it isn't a number from 0 up. */
export function parseAmount(text: string): number | undefined {
  const clean = text.trim().replace(/\s/g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return undefined
  return Number(clean)
}

const valuesOf = (price?: StoredPrice): PriceValues => ({
  price: numberText(price?.price),
  regularPrice: numberText(price?.regularPrice),
  label: price?.label ?? '',
  note: price?.note ?? '',
})

/**
 * The rows: for each course (by title) its base price, then its groups' (by start). A free course
 * has its one row.
 */
export function priceRows(
  courses: readonly PriceCourse[],
  groups: readonly PriceGroup[],
  prices: readonly StoredPrice[],
): PriceRow[] {
  return courses.flatMap((course) => {
    const own = prices.filter((price) => idOf(price.course) === course.id)
    const row = (group?: PriceGroup): PriceRow => {
      const price = own.find((p) => idOf(p.group) === (group?.id ?? null))
      return {
        key: group ? `g${group.id}` : `c${course.id}`,
        course: course.id,
        group: group?.id,
        title: course.title,
        scope: group
          ? ['Група', formatDateNumeric(group.start), group.name].filter(Boolean).join(' · ')
          : 'Целия курс',
        category: course.category,
        voucher: Boolean(course.voucherEligible),
        free: Boolean(course.free),
        priceId: price?.id,
        currency: price?.currency ?? 'EUR',
        values: valuesOf(price),
      }
    }
    if (course.free) return [row()]
    const ofCourse = groups
      .filter((group) => idOf(group.course) === course.id)
      .sort((a, b) => a.start.localeCompare(b.start))
    return [row(), ...ofCourse.map(row)]
  })
}

export const priceFilters = [
  'all',
  'languages',
  'vocational',
  'computer',
  'farmers',
  'vouchers',
  'promotions',
] as const
export type PriceFilter = (typeof priceFilters)[number]

export const priceFilterLabels: Record<PriceFilter, string> = {
  all: 'Всички',
  languages: 'Езикови',
  vocational: 'ЦПО',
  computer: 'Компютърни',
  farmers: 'Земеделски',
  vouchers: 'Ваучери',
  promotions: 'Промоции',
}

/** Does the row belong under this chip? A promotion is a price with a regular price beside it. */
export function matchesFilter(row: PriceRow, values: PriceValues, filter: PriceFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'vouchers':
      return row.voucher
    case 'promotions':
      return !row.free && values.price.trim() !== '' && values.regularPrice.trim() !== ''
    default:
      return row.category === filter
  }
}

export type PriceSection = { key: CourseCategoryValue; label: string; rows: PriceRow[] }

/** The rows under their programme, in the menu's order; a programme without rows isn't listed. */
export const priceSections = (rows: readonly PriceRow[]): PriceSection[] =>
  courseCategoryValues
    .map((key) => ({
      key,
      label: categoryLabels[key],
      rows: rows.filter((row) => row.category === key),
    }))
    .filter((section) => section.rows.length)

/** «7 цени», «1 цена»; a programme without a price says how many courses it has: «2 курса». */
export function sectionCount(rows: readonly PriceRow[], valuesOf: (row: PriceRow) => PriceValues) {
  const priced = rows.filter((row) => !row.free && valuesOf(row).price.trim() !== '').length
  if (priced) return `${priced} ${priced === 1 ? 'цена' : 'цени'}`
  const courses = new Set(rows.map((row) => row.course)).size
  return `${courses} ${courses === 1 ? 'курс' : 'курса'}`
}

export const isDirty = (row: PriceRow, values: PriceValues) =>
  (Object.keys(row.values) as (keyof PriceValues)[]).some(
    (field) => row.values[field].trim() !== values[field].trim(),
  )

/** «1 незаписана промяна», «3 незаписани промени». */
export const unsavedLabel = (n: number) =>
  n === 1 ? '1 незаписана промяна' : `${n} незаписани промени`

export type PriceChange =
  | { kind: 'error'; field: keyof PriceValues; message: string }
  | { kind: 'delete'; id: number }
  | {
      kind: 'save'
      id?: number
      data: {
        course: number
        group: number | null
        price: number
        currency: 'EUR' | 'BGN'
        regularPrice: number | null
        label: string | null
        note: string | null
      }
    }

/**
 * What saving a changed row does. An emptied row deletes its price (the group falls back to the
 * course's, the course to «Попитайте»); a label or a note without a price isn't saved.
 */
export function priceChange(row: PriceRow, values: PriceValues): PriceChange {
  const text = (field: keyof PriceValues) => values[field].trim()
  if (text('price') === '') {
    if (text('regularPrice') || text('label') || text('note'))
      return { kind: 'error', field: 'price', message: 'Въведете цена или изчистете целия ред.' }
    return row.priceId
      ? { kind: 'delete', id: row.priceId }
      : { kind: 'error', field: 'price', message: 'Въведете цена.' }
  }
  const price = parseAmount(values.price)
  if (price === undefined)
    return { kind: 'error', field: 'price', message: 'Цената е число, например 495 или 460,16.' }
  const regularPrice = text('regularPrice') ? parseAmount(values.regularPrice) : null
  if (regularPrice === undefined)
    return {
      kind: 'error',
      field: 'regularPrice',
      message: 'Редовната цена е число, например 580.',
    }
  if (regularPrice !== null && regularPrice <= price)
    return {
      kind: 'error',
      field: 'regularPrice',
      message: 'Редовната цена е по-високата: показва се зачертана до новата.',
    }
  return {
    kind: 'save',
    id: row.priceId,
    data: {
      course: row.course,
      group: row.group ?? null,
      price,
      currency: row.currency,
      regularPrice,
      label: text('label') || null,
      note: text('note') || null,
    },
  }
}
