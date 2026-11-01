import type { CSSProperties, ReactNode } from 'react'
import styles from './CardGrid.module.css'

// Cards in a row: equal heights (CLAUDE.md § 6) and the Figma card gap (--gap-cards). Columns
// collapse to one below 768px, two below 1024px.

export function CardGrid({
  columns = 2,
  children,
  className,
}: {
  columns?: 2 | 3 | 4
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={[styles.grid, className].filter(Boolean).join(' ')}
      style={{ '--columns': columns } as CSSProperties}
    >
      {children}
    </div>
  )
}
