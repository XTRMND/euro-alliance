'use client'

import { useRowLabel } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import { childLinksLabel, describeLink } from '@/lib/nav-links'
import styles from './row-label.module.css'

// Row labels for the admin's lists (docs/admin-redesign.md, decision 12): a row is named by what
// it holds, never «Item 01».

/** A row named by its `name` field («Немски»); its number until it has one. */
export function NameRowLabel() {
  const { data, rowNumber } = useRowLabel<{ name?: string | null }>()
  return <span>{data?.name || numbered(rowNumber)}</span>
}

const numbered = (rowNumber?: number) => String((rowNumber ?? 0) + 1).padStart(2, '0')

type Titles = { programs: Record<number, string>; courses: Record<number, string> }
let titles: Promise<Titles> | undefined

/** The programmes' and courses' titles, read once for all the rows of the screen. */
function loadTitles(): Promise<Titles> {
  const list = async (collection: 'programs' | 'courses') => {
    const response = await fetch(
      `/api/${collection}?depth=0&limit=500&draft=true&locale=bg&select[title]=true`,
      { credentials: 'include' },
    )
    if (!response.ok) return {}
    const { docs } = (await response.json()) as { docs: { id: number; title?: string }[] }
    return Object.fromEntries(docs.map((doc) => [doc.id, doc.title ?? '']))
  }
  titles ??= Promise.all([list('programs'), list('courses')])
    .then(([programs, courses]) => ({ programs, courses }))
    .catch(() => ({ programs: {}, courses: {} }))
  return titles
}

type LinkRow = Parameters<typeof describeLink>[0] & { label?: string | null }

/**
 * A navigation link («Admin · 12 Навигация», 377:2711): its text, where it goes («Страница ·
 * Всички курсове») and how many sub-links it opens.
 */
export function LabelRowLabel() {
  const { data, rowNumber } = useRowLabel<LinkRow>()
  const [known, setKnown] = useState<Titles>()
  const needsTitles = data?.type === 'program' || data?.type === 'course'
  useEffect(() => {
    if (!needsTitles) return
    let stale = false
    loadTitles().then((loaded) => {
      if (!stale) setKnown(loaded)
    })
    return () => {
      stale = true
    }
  }, [needsTitles])
  const children = data?.children?.length ?? 0

  return (
    <span className={styles.link}>
      <span className={styles.text}>
        <span className={styles.name}>{data?.label || numbered(rowNumber)}</span>
        <span className={styles.target}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path
              d="M5 7a2.5 2.5 0 0 0 3.5 0l1.75-1.75a2.5 2.5 0 0 0-3.5-3.5L6 2.5M7 5a2.5 2.5 0 0 0-3.5 0L1.75 6.75a2.5 2.5 0 0 0 3.5 3.5L6 9.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          {describeLink(data ?? {}, known)}
        </span>
      </span>
      {children > 0 && <span className={styles.pill}>{childLinksLabel(children)}</span>}
    </span>
  )
}

/** A row named by its `heading` field: a footer column («Обучение»). */
export function HeadingRowLabel() {
  const { data, rowNumber } = useRowLabel<{ heading?: string | null; links?: unknown[] | null }>()
  const links = data?.links?.length ?? 0
  return (
    <span className={styles.link}>
      <span className={styles.name}>{data?.heading || numbered(rowNumber)}</span>
      {links > 0 && (
        <span className={styles.pill}>
          {links} {links === 1 ? 'връзка' : 'връзки'}
        </span>
      )}
    </span>
  )
}
