import type { ComponentProps, ReactNode } from 'react'
import styles from './RadioCard.module.css'

// Radio card (98:270): a native radio button inside a card-sized label. Group the cards in a
// <fieldset> with a visible <legend>; arrow keys move between them.

type RadioCardProps = Omit<ComponentProps<'input'>, 'type' | 'className'> & {
  label: ReactNode
  className?: string
}

export function RadioCard({ label, className, ...input }: RadioCardProps) {
  return (
    <label className={[styles.card, className].filter(Boolean).join(' ')}>
      <input type="radio" className={styles.input} {...input} />
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </label>
  )
}
