import { Children, type CSSProperties, type ReactNode } from 'react'
import styles from './SwipeRow.module.css'

// A row of cards: a grid from 768px, a horizontal swipe row below («Cards (swipe)» on the mobile
// home, 115:457). The row runs to the screen edges and snaps each card to the page margin. It's a
// list; when every card holds a link, keyboard focus scrolls the row too. Rows of cards without
// links (certificates) are `focusable`: the row itself takes focus, named by its heading, so the
// arrow keys scroll it.

type SwipeRowProps = {
  children: ReactNode
  /** Columns from 1024px (two from 768px). */
  columns: 2 | 3 | 4
  /** Columns from 1440px, where they differ (course cards: four only at Figma's 1440 width). */
  wideColumns?: 4
  /** Card width in the swipe row. */
  itemWidth: number
  /** Gaps of the grid (the swipe row uses the column gap); the card gap by default. */
  gap?: { row?: number; column?: number }
  /** For cards without links: the row takes focus itself. */
  focusable?: boolean
  /** The id of the heading that names a focusable row. */
  labelledBy?: string
  className?: string
}

export function SwipeRow({
  children,
  columns,
  wideColumns,
  itemWidth,
  gap = {},
  focusable,
  labelledBy,
  className,
}: SwipeRowProps) {
  const style = {
    '--columns': columns,
    ...(wideColumns && { '--wide-columns': wideColumns }),
    '--item-width': `${itemWidth}px`,
    ...(gap.row !== undefined && { '--row-gap': `${gap.row}px` }),
    ...(gap.column !== undefined && { '--column-gap': `${gap.column}px` }),
  } as CSSProperties

  return (
    <ul
      className={[styles.row, className].filter(Boolean).join(' ')}
      style={style}
      data-wide={wideColumns ? '' : undefined}
      tabIndex={focusable ? 0 : undefined}
      aria-labelledby={focusable ? labelledBy : undefined}
    >
      {Children.map(children, (child) => child && <li className={styles.item}>{child}</li>)}
    </ul>
  )
}
