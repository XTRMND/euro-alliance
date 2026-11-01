import type { ReactNode } from 'react'
import styles from './EnrolBar.module.css'

// Sticky enrol bar (117:1535), below 1024px: the price and the enrol button stay at the bottom of
// the screen while the course page scrolls. Hidden when there's neither.

export function EnrolBar({
  price,
  note,
  action,
}: {
  price?: string
  note?: string | null
  action: ReactNode
}) {
  return (
    <div className={styles.bar}>
      {price && (
        <p className={styles.price}>
          <span className={styles.amount}>{price}</span>
          {note && <span className={styles.note}>{note}</span>}
        </p>
      )}
      <span className={styles.action}>{action}</span>
    </div>
  )
}
