import { Children, type CSSProperties, type ReactNode } from 'react'
import styles from './SwipeRow.module.css'

// A row of cards: a grid from 768px, a horizontal swipe row below («Cards (swipe)» on the mobile
// home, 115:457). The row runs to the screen edges and snaps each card to the page margin. It's a
// list, and every card holds a link, so keyboard focus scrolls the row too.

type SwipeRowProps = {
  children: ReactNode
  /** Columns from 1024px (two from 768px). */
  columns: 2 | 3 | 4
  /** Card width in the swipe row. */
  itemWidth: number
  /** Gaps of the grid (the swipe row uses the column gap); the card gap by default. */
  gap?: { row?: number; column?: number }
  className?: string
}

export function SwipeRow({ children, columns, itemWidth, gap = {}, className }: SwipeRowProps) {
  const style = {
    '--columns': columns,
    '--item-width': `${itemWidth}px`,
    ...(gap.row !== undefined && { '--row-gap': `${gap.row}px` }),
    ...(gap.column !== undefined && { '--column-gap': `${gap.column}px` }),
  } as CSSProperties

  return (
    <ul className={[styles.row, className].filter(Boolean).join(' ')} style={style}>
      {Children.map(children, (child) => child && <li className={styles.item}>{child}</li>)}
    </ul>
  )
}
