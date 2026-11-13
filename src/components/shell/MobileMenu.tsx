'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState, type MouseEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { inboxOf, track } from '@/lib/analytics'
import { telHref } from '@/lib/format'
import { routes } from '@/lib/routes'
import type { SiteMenuItem } from '@/lib/nav-links'
import { LogoLink } from './LogoLink'
import styles from './MobileMenu.module.css'
import { NavDisclosure } from './NavDisclosure'
import { NavLink } from './NavLink'

// Mobile menu (121:1399): a modal <dialog>, so focus stays inside, Esc closes it and the page
// behind is inert. Closing returns focus to the menu button. Labels come from the server, so no
// translation runtime ships to the browser.

type MobileMenuProps = {
  links: SiteMenuItem[]
  labels: { open: string; close: string; nav: string; logo: string; cta: string }
  phone?: string
  email?: string
  className?: string
}

export function MobileMenu({ links, labels, phone, email, className }: MobileMenuProps) {
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // A link to another page closes the menu once the page changes.
  useEffect(() => {
    dialog.current?.close()
  }, [pathname])

  function show() {
    dialog.current?.showModal()
    setOpen(true)
  }

  // A link within the same page (an anchor) doesn't change the path, so close on any link click.
  function closeOnLink(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('a')) dialog.current?.close()
  }

  return (
    <div className={className}>
      <button
        ref={opener}
        type="button"
        className={styles.open}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={show}
      >
        <span className={styles.bars} aria-hidden="true" />
        <span className="sr-only">{labels.open}</span>
      </button>

      <dialog
        ref={dialog}
        id={id}
        className={styles.dialog}
        aria-label={labels.open}
        onClose={() => {
          setOpen(false)
          opener.current?.focus()
        }}
        onClick={closeOnLink}
      >
        <div className={styles.top}>
          <button type="button" className={styles.close} onClick={() => dialog.current?.close()}>
            <span aria-hidden="true">✕</span>
            <span className="sr-only">{labels.close}</span>
          </button>
          <LogoLink theme="dark" label={labels.logo} className={styles.logo} />
          <span className={styles.spacer} />
        </div>

        <nav aria-label={labels.nav} className={styles.nav}>
          <ul>
            {links.map((link) => (
              <li key={link.id}>
                {link.children.length ? (
                  <NavDisclosure label={link.label} links={link.children} variant="inline" />
                ) : (
                  link.href && (
                    <NavLink href={link.href} className={styles.link}>
                      {link.label}
                    </NavLink>
                  )
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.bottom}>
          <Button variant="accent" href={routes.contact()} className={styles.cta}>
            {labels.cta}
          </Button>
          {(phone || email) && (
            <p className={styles.contact}>
              {phone && (
                <a
                  href={telHref(phone)}
                  onClick={() => track('tel_click', { office: 'courses', placement: 'header' })}
                >
                  {phone}
                </a>
              )}
              {phone && email && <span aria-hidden="true"> · </span>}
              {email && (
                <a
                  href={`mailto:${email}`}
                  onClick={() => {
                    const inbox = inboxOf(email)
                    if (inbox) track('mailto_click', { inbox, placement: 'header' })
                  }}
                >
                  {email}
                </a>
              )}
            </p>
          )}
        </div>
      </dialog>
    </div>
  )
}
