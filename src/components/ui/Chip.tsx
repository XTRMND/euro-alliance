import type { ComponentProps } from 'react'
import styles from './Chip.module.css'

// Chip (135:328): Outline and Filled. `Chip` is a static label; `ChipButton` is a filter pill
// that toggles (Filled when pressed). Pills always have a visible label above them.

export function Chip({
  filled = false,
  className,
  ...rest
}: ComponentProps<'span'> & { filled?: boolean }) {
  return (
    <span
      className={[styles.chip, filled && styles.filled, className].filter(Boolean).join(' ')}
      {...rest}
    />
  )
}

export function ChipButton({
  pressed,
  className,
  ...rest
}: Omit<ComponentProps<'button'>, 'aria-pressed'> & { pressed: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={[styles.chip, styles.button, pressed && styles.filled, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  )
}
