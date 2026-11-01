import styles from './CountBubble.module.css'

// Count bubble (259:475): navy circle, sand number, small label (B2 · НИВО, 20 · ПРОФЕСИИ),
// tilted −8°. The label is stored in normal case and shown in capitals (docs/i18n.md § 1).
// Sand on brand/primary-strong is 5.5:1. Sizes: `small` is the Course card's level bubble
// (132:420, 62px), `large` the Home hero's «7 ЕЗИКА» (57:324, 124px).

type CountBubbleProps = {
  number: string
  label: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function CountBubble({ number, label, size = 'medium', className }: CountBubbleProps) {
  return (
    <p className={[styles.bubble, styles[size], className].filter(Boolean).join(' ')}>
      <span className={styles.number}>{number}</span>
      <span className={styles.label}>{label}</span>
    </p>
  )
}
