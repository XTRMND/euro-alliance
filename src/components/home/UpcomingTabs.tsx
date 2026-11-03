'use client'

import { Fragment, useState, type ReactNode } from 'react'
import { CourseGrid } from '@/components/patterns/CourseGrid'
import type { UpcomingFilter } from '@/lib/courses'
import styles from './UpcomingTabs.module.css'

// The tabs over the upcoming courses (48:231): in-page filters, so toggle buttons, not links
// (docs/motion.md § 8). The cards are rendered on the server; this only picks which to show.

type UpcomingTabsProps = {
  label: string
  tabs: { filter: UpcomingFilter; label: string }[]
  items: { id: number; filters: UpcomingFilter[]; card: ReactNode }[]
  perTab: number
}

export function UpcomingTabs({ label, tabs, items, perTab }: UpcomingTabsProps) {
  const [active, setActive] = useState<UpcomingFilter>('all')
  const shown = items.filter((item) => item.filters.includes(active)).slice(0, perTab)

  return (
    <>
      {tabs.length > 0 && (
        <div role="group" aria-label={label} className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.filter}
              type="button"
              aria-pressed={tab.filter === active}
              className={styles.tab}
              onClick={() => setActive(tab.filter)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      <CourseGrid>
        {shown.map((item) => (
          <Fragment key={item.id}>{item.card}</Fragment>
        ))}
      </CourseGrid>
    </>
  )
}
