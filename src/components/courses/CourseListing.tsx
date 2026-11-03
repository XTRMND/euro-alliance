'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useOptimistic, useRef, useTransition, type ReactNode } from 'react'
import { CourseGrid } from '@/components/patterns/CourseGrid'
import { Button } from '@/components/ui/Button'
import { ChipButton } from '@/components/ui/Chip'
import { type CourseStatus, courseStatuses } from '@/lib/course-state'
import {
  activeFilterCount,
  type CourseFilters,
  type CourseSort,
  courseFiltersQuery,
  coursesPageSize,
  emptyCourseFilters,
} from '@/lib/course-filters'
import type { CourseAudience, CourseCategoryValue, CourseFormat } from '@/lib/courses'
import type { Language } from '@/lib/routes'
import styles from './CourseListing.module.css'
import { FilterGroups } from './FilterGroups'

// The course listing (80:908 / 116:579–587): filters in a sidebar from 1024px and in a sheet
// below (116:1190), sort, the results and «Покажи още». Every change goes into the URL
// (shareable, the back button works) and the server renders the new list; the cards come from
// the server too. «Покажи още» moves focus to the first new course.

type Option<V> = { value: V; label: string }

export type ListingOptions = {
  audience: Option<CourseAudience>[]
  category: Option<CourseCategoryValue>[]
  language: Option<Language>[]
  format: Option<CourseFormat>[]
  months: Option<string>[]
}

export type ListingLabels = {
  filtersTitle: string
  filtersOpen: string
  filtersSelected: string
  audience: string
  category: string
  language: string
  format: string
  funding: string
  voucher: string
  start: string
  anyMonth: string
  reset: string
  resetShort: string
  apply: string
  sortLabel: string
  sort: Record<CourseSort, string>
  /** «Състояние» and its pills: Всички, Предстоящи, В ход, Без дата. */
  status: string
  statuses: Record<'all' | CourseStatus, string>
  count: string
  showMore: string
  shown: string
  empty: string
}

type CourseListingProps = {
  filters: CourseFilters
  total: number
  options: ListingOptions
  labels: ListingLabels
  /** The server-rendered cards, in order. */
  cards: ReactNode[]
}

export function CourseListing({ filters, total, options, labels, cards }: CourseListingProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const sheet = useRef<HTMLDialogElement>(null)
  const results = useRef<HTMLUListElement>(null)
  const focusFrom = useRef<number | null>(null)

  // The controls show a change at once; the list follows when the server has rendered it.
  const [shownFilters, setShownFilters] = useOptimistic(filters)

  const go = (next: CourseFilters) =>
    startTransition(() => {
      setShownFilters(next)
      router.push(`${pathname}${courseFiltersQuery(next)}`, { scroll: false })
    })

  // A new filter or sort starts again from the first page.
  const apply = (next: CourseFilters) => go({ ...next, shown: coursesPageSize })
  const reset = () => apply({ ...emptyCourseFilters, sort: shownFilters.sort })

  const showMore = () => {
    focusFrom.current = cards.length
    go({ ...filters, shown: filters.shown + coursesPageSize })
  }

  useEffect(() => {
    if (focusFrom.current === null || cards.length <= focusFrom.current) return
    results.current
      ?.querySelector<HTMLAnchorElement>(`[data-index="${focusFrom.current}"] a`)
      ?.focus()
    focusFrom.current = null
  }, [cards.length])

  const active = activeFilterCount(shownFilters)

  const sort = (className: string) => (
    <label className={className}>
      <span className={styles.sortLabel}>{labels.sortLabel}</span>
      <span className={styles.selectBox}>
        <select
          className={styles.select}
          value={shownFilters.sort}
          onChange={(event) => apply({ ...shownFilters, sort: event.target.value as CourseSort })}
        >
          <option value="soonest">{labels.sort.soonest}</option>
          <option value="price">{labels.sort.price}</option>
        </select>
      </span>
    </label>
  )

  return (
    <div className={styles.body}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.open} onClick={() => sheet.current?.showModal()}>
          {labels.filtersOpen}
          <span className={styles.badge} aria-hidden="true">
            {active}
          </span>
          <span className="sr-only">, {labels.filtersSelected}</span>
        </button>
        {sort(styles.sortMobile)}
      </div>

      <aside className={styles.sidebar} aria-label={labels.filtersTitle}>
        <FilterGroups filters={shownFilters} options={options} labels={labels} onChange={apply} />
        <Button variant="link" className={styles.reset} onClick={reset}>
          {labels.reset}
        </Button>
      </aside>

      <section className={styles.results} aria-labelledby="results-count" aria-busy={pending}>
        <div className={styles.status} role="group" aria-labelledby="status-label">
          <span id="status-label" className={styles.statusLabel}>
            {labels.status}
          </span>
          {(['all', ...courseStatuses] as const).map((value) => (
            <ChipButton
              key={value}
              pressed={(shownFilters.status ?? 'all') === value}
              onClick={() =>
                apply({ ...shownFilters, status: value === 'all' ? undefined : value })
              }
            >
              {labels.statuses[value]}
            </ChipButton>
          ))}
        </div>
        <div className={styles.head}>
          <h2 id="results-count" className={styles.count}>
            {labels.count}
          </h2>
          {sort(styles.sortDesktop)}
        </div>
        <p role="status" className="sr-only">
          {labels.count}
        </p>

        {cards.length > 0 ? (
          <CourseGrid ref={results} indexed>
            {cards}
          </CourseGrid>
        ) : (
          <div className={styles.empty}>
            <p>{labels.empty}</p>
            {active > 0 && (
              <Button variant="secondary" onClick={reset}>
                {labels.reset}
              </Button>
            )}
          </div>
        )}

        {cards.length < total && (
          <div className={styles.more}>
            <Button variant="secondary" onClick={showMore} className={styles.moreButton}>
              {labels.showMore}
            </Button>
            <p className={styles.shown}>{labels.shown}</p>
          </div>
        )}
      </section>

      <dialog
        ref={sheet}
        className={styles.sheet}
        aria-labelledby="filters-title"
        onClick={(event) => {
          // A click on the backdrop (the dialog itself, outside the panel) closes it.
          if (event.target === event.currentTarget) sheet.current?.close()
        }}
      >
        <div className={styles.panel}>
          <span className={styles.handle} aria-hidden="true" />
          <div className={styles.sheetHead}>
            <h2 id="filters-title" className={styles.sheetTitle}>
              {labels.filtersTitle}
            </h2>
            <Button variant="link" onClick={reset}>
              {labels.resetShort}
            </Button>
          </div>
          <div className={styles.sheetGroups}>
            <FilterGroups
              filters={shownFilters}
              options={options}
              labels={labels}
              onChange={apply}
            />
          </div>
          <div className={styles.sheetBar}>
            <Button className={styles.apply} onClick={() => sheet.current?.close()}>
              {labels.apply}
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
