import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import styles from './Button.module.css'

// Button (18:30): Primary, Secondary, Accent (only on navy) and Link. With `href` it is a link,
// otherwise a <button>: in-page actions are always buttons (docs/motion.md § 8).

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'link'

type Common = { variant?: ButtonVariant; className?: string; children: ReactNode }

type AsLink = Common &
  Omit<ComponentProps<typeof Link>, 'className' | 'children'> & { href: string }

type AsButton = Common & Omit<ComponentProps<'button'>, 'className' | 'children'> & { href?: never }

export function Button({ variant = 'primary', className, children, ...rest }: AsLink | AsButton) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ')

  if (rest.href !== undefined) {
    // No prefetch by default: pages render on request (see NavLink).
    return (
      <Link className={classes} prefetch={false} {...(rest as Omit<AsLink, keyof Common>)}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...(rest as Omit<AsButton, keyof Common>)}>
      {children}
    </button>
  )
}
