'use client'

import { Checkbox } from '@/components/ui/Checkbox'
import type { CourseFilters } from '@/lib/course-filters'
import styles from './CourseListing.module.css'
import type { ListingLabels, ListingOptions } from './CourseListing'

// The filter groups (80:909 / 116:1199): each group has its visible label (a legend), then its
// options. Shown in the sidebar from 1024px and in the filters sheet below.

type Key = 'audience' | 'category' | 'language' | 'format'

type FilterGroupsProps = {
  filters: CourseFilters
  options: ListingOptions
  labels: ListingLabels
  onChange: (next: CourseFilters) => void
}

export function FilterGroups({ filters, options, labels, onChange }: FilterGroupsProps) {
  const toggle = <K extends Key>(key: K, value: CourseFilters[K][number], on: boolean) => {
    const current = filters[key] as string[]
    onChange({
      ...filters,
      [key]: on ? [...current, value] : current.filter((item) => item !== value),
    })
  }

  const group = <K extends Key>(
    key: K,
    legend: string,
    items: { value: CourseFilters[K][number]; label: string }[],
  ) => (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      {items.map((item) => (
        <Checkbox
          key={item.value}
          label={item.label}
          checked={(filters[key] as string[]).includes(item.value)}
          onChange={(event) => toggle(key, item.value, event.target.checked)}
        />
      ))}
    </fieldset>
  )

  return (
    <>
      {group('audience', labels.audience, options.audience)}
      {group('category', labels.category, options.category)}
      {group('language', labels.language, options.language)}
      {group('format', labels.format, options.format)}
      <fieldset className={styles.group}>
        <legend className={styles.legend}>{labels.funding}</legend>
        <Checkbox
          label={labels.voucher}
          checked={filters.voucher}
          onChange={(event) => onChange({ ...filters, voucher: event.target.checked })}
        />
      </fieldset>
      {options.months.length > 0 && (
        <label className={styles.group}>
          <span className={styles.legend}>{labels.start}</span>
          <span className={styles.selectBox}>
            <select
              className={styles.select}
              value={filters.start ?? ''}
              onChange={(event) => onChange({ ...filters, start: event.target.value || undefined })}
            >
              <option value="">{labels.anyMonth}</option>
              {options.months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </span>
        </label>
      )}
    </>
  )
}
