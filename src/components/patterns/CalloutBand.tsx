import { Button } from '@/components/ui/Button'
import styles from './CalloutBand.module.css'
import { LinkifiedText } from './LinkifiedText'

// Callout band (259:449): navy rounded band with a title, a line of text and an accent button, for
// the one important next step. Layout=Row stacks below 768px; Layout=Stack always stacks. Phone
// numbers and email addresses in the text are links.

type CalloutBandProps = {
  title: string
  text?: string | null
  cta?: { label: string; href: string } | null
  /** A button of the caller's own in place of `cta` (one that reports its click). */
  action?: React.ReactNode
  layout?: 'row' | 'stack'
  headingLevel?: 'h2' | 'h3'
  className?: string
}

export function CalloutBand({
  title,
  text,
  cta,
  action,
  layout = 'row',
  headingLevel: Heading = 'h2',
  className,
}: CalloutBandProps) {
  return (
    <section className={[styles.band, styles[layout], className].filter(Boolean).join(' ')}>
      <div className={styles.copy}>
        <Heading className={styles.title}>{title}</Heading>
        {text && (
          <p className={styles.text}>
            <LinkifiedText text={text} />
          </p>
        )}
      </div>
      {action ? (
        <div className={styles.cta}>{action}</div>
      ) : (
        cta && (
          <Button variant="accent" href={cta.href} className={styles.cta}>
            {cta.label}
          </Button>
        )
      )}
    </section>
  )
}
