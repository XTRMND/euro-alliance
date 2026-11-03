import { Children, type ReactNode, type Ref } from 'react'
import styles from './CourseGrid.module.css'

// Course card grids: the listing, the homepage, the language and program pages and the search
// (the user, 03.11.2026). As many columns as fit at 280px, 32px apart (the count
// `repeat(auto-fill, minmax(280px, 1fr))` gives), but a card is never wider than 380px: with room
// to spare the cards keep that width and the room goes between them. One column on a phone. The
// count comes from the grid's own width, so it holds beside the listing's sidebar too.

type CourseGridProps = {
  children: ReactNode
  /** The list, for moving focus into it (the listing's «Покажи още»). */
  ref?: Ref<HTMLUListElement>
  /** Each card's position on its list item (`data-index`). */
  indexed?: boolean
  className?: string
}

export function CourseGrid({ children, ref, indexed = false, className }: CourseGridProps) {
  return (
    <div className={[styles.frame, className].filter(Boolean).join(' ')}>
      <ul ref={ref} className={styles.grid}>
        {Children.map(
          children,
          (child, i) =>
            child && (
              <li className={styles.item} data-index={indexed ? i : undefined}>
                {child}
              </li>
            ),
        )}
      </ul>
    </div>
  )
}
