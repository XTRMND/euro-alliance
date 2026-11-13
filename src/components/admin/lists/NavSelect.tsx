'use client'

import { useRouter } from 'next/navigation'
import styles from './list.module.css'

// A select that reloads the list with its choice in the address: «Групирай по» (356:279) and the
// inquiries' «Всички пощи».

type NavSelectProps = {
  id: string
  label: string
  /** The label is for screen readers only (the select says what it is by its first option). */
  hideLabel?: boolean
  value: string
  options: { value: string; label: string }[]
  /** The list's address with `{value}` where the choice goes. */
  hrefTemplate: string
}

export function NavSelect({ id, label, hideLabel, value, options, hrefTemplate }: NavSelectProps) {
  const router = useRouter()
  return (
    <>
      <label htmlFor={id} className={hideLabel ? styles.srOnly : styles.selectLabel}>
        {label}
      </label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(event) =>
          router.push(hrefTemplate.replace('{value}', encodeURIComponent(event.target.value)))
        }
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  )
}
