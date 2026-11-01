import { Tape } from '@/components/visuals/Tape'
import { CountBubble } from './CountBubble'
import styles from './IndexCard.module.css'
import { List, type ListMarker } from './List'

// Index card (264:448): taped white card with a title, a count (a chip, or the navy bubble) and
// up to ten List rows from the CMS.

type IndexCardProps = {
  title: string
  marker: Exclude<ListMarker, 'box'>
  items: { text: string; no?: string | null }[]
  /** Shown as a chip after the title, or as a count bubble with `countLabel`. */
  count?: string | null
  countLabel?: string | null
  headingLevel?: 'h2' | 'h3'
  className?: string
}

export function IndexCard({
  title,
  marker,
  items,
  count,
  countLabel,
  headingLevel: Heading = 'h3',
  className,
}: IndexCardProps) {
  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      <Tape />
      <div className={styles.head}>
        <Heading className={styles.title}>{title}</Heading>
        {count && !countLabel && <span className={styles.chip}>{count}</span>}
      </div>
      {count && countLabel && (
        <CountBubble number={count} label={countLabel} className={styles.bubble} />
      )}
      <List marker={marker} items={items} />
    </article>
  )
}
