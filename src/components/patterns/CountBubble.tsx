import styles from './CountBubble.module.css'

// Count bubble (259:475): navy circle, sand number, small label (B2 · НИВО, 20 · ПРОФЕСИИ),
// tilted −8°. The label is stored in normal case and shown in capitals (docs/i18n.md § 1).
// Sand on brand/primary-strong is 5.5:1.

type CountBubbleProps = {
  number: string
  label: string
  className?: string
}

export function CountBubble({ number, label, className }: CountBubbleProps) {
  return (
    <p className={[styles.bubble, className].filter(Boolean).join(' ')}>
      <span className={styles.number}>{number}</span>
      <span className={styles.label}>{label}</span>
    </p>
  )
}
