import type { ComponentProps, ReactNode } from 'react'
import styles from './Toggle.module.css'

// Toggle (223:349): On, Off and Locked (always on, e.g. essential cookies). A native checkbox
// with role="switch", so keyboard and screen readers get a real switch.

type ToggleProps = Omit<ComponentProps<'input'>, 'type' | 'role' | 'className'> & {
  label: ReactNode
  /** Keeps the label for screen readers only, e.g. when the row already shows it. */
  hideLabel?: boolean
  /** Locked on: shown at half strength and not operable. */
  locked?: boolean
  className?: string
}

export function Toggle({ label, hideLabel, locked, className, ...input }: ToggleProps) {
  const lockedProps = locked ? { checked: true, disabled: true, readOnly: true } : {}
  return (
    <label className={[styles.toggle, className].filter(Boolean).join(' ')}>
      <input type="checkbox" role="switch" className={styles.input} {...input} {...lockedProps} />
      <span className={styles.track} aria-hidden="true" />
      <span className={hideLabel ? 'sr-only' : styles.label}>{label}</span>
    </label>
  )
}
