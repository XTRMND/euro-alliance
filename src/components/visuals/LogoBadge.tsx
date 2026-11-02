import type { CSSProperties } from 'react'
import logoMark from '@/assets/logo-mark-dark.svg'
import styles from './LogoBadge.module.css'

// The logo mark in a white ring (About hero 216:3278, the map pin in Location card 125:302): the
// one badge the site draws, always a circle. Its width and height are both set (WebKit adds a
// border to an aspect-ratio box's height), and the mark keeps its own square ratio. `pin` adds the
// pointer underneath; the pin's tip is the spot it marks. Decorative: the text around says what it is.

type LogoBadgeProps = {
  /** The badge's diameter, ring included, e.g. 72px or clamp(75px, 18vw, 104px). */
  size: string
  /** The white ring's width. */
  ring: string
  variant?: 'badge' | 'pin'
  className?: string
}

export function LogoBadge({ size, ring, variant = 'badge', className }: LogoBadgeProps) {
  return (
    <span
      aria-hidden="true"
      data-badge={variant}
      className={[styles.badge, variant === 'pin' && styles.pin, className]
        .filter(Boolean)
        .join(' ')}
      style={{ '--badge-size': size, '--badge-ring': ring } as CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- the 1 KB logo SVG, as it is */}
      <img src={logoMark.src} alt="" width={64} height={64} className={styles.mark} />
    </span>
  )
}
