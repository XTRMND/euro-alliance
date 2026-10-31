import type { ComponentProps, ReactNode } from 'react'
import styles from './Checkbox.module.css'

// Checkbox (79:968): a native checkbox, drawn to match Figma, with its label.

type CheckboxProps = Omit<ComponentProps<'input'>, 'type' | 'className'> & {
  label: ReactNode
  className?: string
}

export function Checkbox({ label, className, ...input }: CheckboxProps) {
  return (
    <label className={[styles.checkbox, className].filter(Boolean).join(' ')}>
      <input type="checkbox" className={styles.input} {...input} />
      <span className={styles.box} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </label>
  )
}
