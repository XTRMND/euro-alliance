import type { ReactNode } from 'react'
import styles from './List.module.css'

// List row (259:2318): numbered (programmes, standards), checked (conditions), or a box on navy
// (documents to bring). The marker stays at the top while the text wraps.
//
// Numbers are navy, not Figma's sand: sand text on light backgrounds fails WCAG (CLAUDE.md § 5,
// open item in § 12).

export type ListMarker = 'number' | 'check' | 'box'

type ListProps = {
  marker: ListMarker
  items: { text: ReactNode; no?: string | null }[]
  className?: string
}

export function List({ marker, items, className }: ListProps) {
  const Tag = marker === 'number' ? 'ol' : 'ul'
  return (
    <Tag className={[styles.list, styles[marker], className].filter(Boolean).join(' ')}>
      {items.map(({ text, no }, i) => (
        <li key={i} className={styles.row}>
          {marker === 'number' && (
            <span className={styles.no}>{no ?? String(i + 1).padStart(2, '0')}</span>
          )}
          {marker !== 'number' && <span className={styles.mark} aria-hidden="true" />}
          <span className={styles.text}>{text}</span>
        </li>
      ))}
    </Tag>
  )
}
