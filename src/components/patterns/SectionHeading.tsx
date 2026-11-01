import { withHighlight } from './Highlight'
import styles from './SectionHeading.module.css'

// Section heading (259:2319): H2 at 52/36 px, an optional uppercase kicker and a lead up to 820px.

type SectionHeadingProps = {
  title: string
  /** The one phrase of the title to highlight. */
  highlight?: string | null
  kicker?: string | null
  lead?: string | null
  /** Heading level; h2 unless the page structure needs another. */
  as?: 'h2' | 'h3'
  id?: string
  className?: string
}

export function SectionHeading({
  title,
  highlight,
  kicker,
  lead,
  as: Heading = 'h2',
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div className={[styles.heading, className].filter(Boolean).join(' ')}>
      {kicker && <p className={styles.kicker}>{kicker}</p>}
      <Heading id={id} className={styles.title}>
        {withHighlight(title, highlight)}
      </Heading>
      {lead && <p className={styles.lead}>{lead}</p>}
    </div>
  )
}
