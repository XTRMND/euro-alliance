'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState, type FocusEvent } from 'react'
import styles from './NavDisclosure.module.css'
import { NavLink } from './NavLink'

// A nav item that opens a group of links («Професионално обучение»): a disclosure button with
// aria-expanded, not a link (CLAUDE.md § 12). A dropdown in the desktop header, an expandable
// group in the mobile menu. Esc closes it and returns focus to the button; so does clicking
// outside or tabbing away.

type NavDisclosureProps = {
  label: string
  links: { id?: string | null; label: string; href: string }[]
  variant: 'dropdown' | 'inline'
}

export function NavDisclosure({ label, links, variant }: NavDisclosureProps) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const current = links.some((link) => link.href === pathname)

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      // Inside the mobile menu, Esc should close this group, not the whole dialog.
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      button.current?.focus()
    }
    function onPointer(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (variant === 'dropdown' && !root.current?.contains(event.relatedTarget as Node)) {
      setOpen(false)
    }
  }

  return (
    <div ref={root} className={styles[variant]} onBlur={onBlur}>
      <button
        ref={button}
        type="button"
        className={styles.button}
        aria-expanded={open}
        aria-controls={id}
        data-current={current || undefined}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <span className={styles.caret} aria-hidden="true">
          ▾
        </span>
      </button>
      <ul id={id} className={styles.panel} hidden={!open}>
        {links.map((link) => (
          <li key={link.id ?? link.href}>
            <NavLink href={link.href} className={styles.link} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
