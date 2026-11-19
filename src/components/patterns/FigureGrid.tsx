import type { CSSProperties, ReactNode } from 'react'
import styles from './FigureGrid.module.css'

// A row of Figure cards («в цифри», 194:2839): two columns on a phone; from 768px up to five in
// a row, as in Figma. More than five are split into rows of about the same length (7 → 4 + 3),
// and a row wraps before its cards get narrower than 160px.

export function FigureGrid({ count, children }: { count: number; children: ReactNode }) {
  return (
    <div className={styles.grid} style={{ '--columns': figureColumns(count) } as CSSProperties}>
      {children}
    </div>
  )
}

/** The most cards in a row: all of them up to five, then the rows evened out. */
export function figureColumns(count: number): number {
  if (count <= 5) return Math.max(count, 1)
  return Math.ceil(count / Math.ceil(count / 5))
}
