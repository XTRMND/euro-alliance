'use client'

import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { cleanSearchTerm, track } from '@/lib/analytics'
import { routes, type SearchTab } from '@/lib/routes'
import styles from './SearchTabs.module.css'

// The results' tabs (219:2939): Subnav items (189:343) as a real tablist, each name with its
// count. «Всичко» shows every section, the others one; a tab without results isn't shown. The tab
// is kept in the address (replaced, so the back button goes to the previous search). Arrow keys,
// Home and End move between the tabs and select them.

type Tab = { key: SearchTab; label: string; count: number }

type SearchTabsProps = {
  tabs: Tab[]
  initial: SearchTab
  query: string
  /** The tablist's name. */
  label: string
  children: ReactNode
}

export function SearchTabs({ tabs, initial, query, label, children }: SearchTabsProps) {
  const id = useId()
  const shown = tabs.filter((tab) => tab.key === 'all' || tab.count > 0)
  const [selected, setSelected] = useState<SearchTab>(
    shown.some((tab) => tab.key === initial) ? initial : 'all',
  )
  const refs = useRef(new Map<SearchTab, HTMLButtonElement>())
  const total = tabs.find((tab) => tab.key === 'all')?.count ?? 0

  // `search` (docs/measurement.md): once per search, with the query cleaned of personal data.
  useEffect(() => {
    track('search', { search_term: cleanSearchTerm(query), results_count: total, tab: initial })
  }, [query, total, initial])

  const select = (key: SearchTab, focus = false) => {
    setSelected(key)
    window.history.replaceState(window.history.state, '', routes.search(query, key))
    if (focus) refs.current.get(key)?.focus()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const at = shown.findIndex((tab) => tab.key === selected)
    const next = {
      ArrowRight: shown[(at + 1) % shown.length],
      ArrowLeft: shown[(at - 1 + shown.length) % shown.length],
      Home: shown[0],
      End: shown[shown.length - 1],
    }[event.key]
    if (!next) return
    event.preventDefault()
    select(next.key, true)
  }

  return (
    <>
      <div role="tablist" aria-label={label} className={styles.tabs} onKeyDown={onKeyDown}>
        {shown.map((tab) => (
          <button
            key={tab.key}
            ref={(element) => {
              if (element) refs.current.set(tab.key, element)
            }}
            type="button"
            role="tab"
            id={`${id}-${tab.key}`}
            aria-selected={tab.key === selected}
            aria-controls={`${id}-panel`}
            tabIndex={tab.key === selected ? 0 : -1}
            className={styles.tab}
            data-label={`${tab.label} (${tab.count})`}
            onClick={() => select(tab.key)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${selected}`}
        data-show={selected}
        className={styles.panel}
      >
        {children}
      </div>
    </>
  )
}
