'use client'

import { Link, useLocale, useStepNav } from '@payloadcms/ui'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import styles from './shell.module.css'

// «Admin / Top bar» (354:83) and the hairline sub-nav under it («Admin / Sub-nav tab», 354:58):
// where you are in the menu, the content language (БГ / EN), a link to the site and the account.

type Crumb = { label: string; href?: string }

type TopBarProps = {
  trail: Crumb[]
  onDocument: boolean
  siblings: { key: string; label: string; href?: string }[]
  activeKey?: string
  siteUrl: string
  accountUrl: string
  logoutUrl: string
  userName: string
  locales: string[]
}

const localeLabels: Record<string, string> = { bg: 'БГ', en: 'EN' }
const localeNames: Record<string, string> = { bg: 'Български', en: 'English' }

/** «ЕА» from «Евро Алианс», «SH» from «shots@…». */
const initials = (name: string) => {
  const words = name
    .split('@')[0]
    .split(/[\s._-]+/)
    .filter(Boolean)
  const letters = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? '').slice(0, 2)
  return letters.toUpperCase()
}

export function TopBar({
  trail,
  onDocument,
  siblings,
  activeKey,
  siteUrl,
  accountUrl,
  logoutUrl,
  userName,
  locales,
}: TopBarProps) {
  const { stepNav } = useStepNav()
  const locale = useLocale()
  // Right after signing in the content language isn't set yet: Bulgarian, the default.
  const code = locale?.code ?? 'bg'
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // The breadcrumb: the menu's path to this screen («Съдържание» before a first-level item), and
  // on a document's screen the document's own title last (Payload's step nav knows it).
  const last = stepNav.at(-1)?.label
  const title = onDocument && typeof last === 'string' ? last : undefined
  // «Съдържание / Цени» for a first-level screen; «Новини / Ден на …» for its documents.
  const path: Crumb[] = trail.length === 1 && !title ? [{ label: 'Съдържание' }, ...trail] : trail
  const crumbs = title ? [...path, { label: title }] : path
  const current = crumbs.at(-1)

  const localeHref = (code: string) => {
    const query = new URLSearchParams(searchParams.toString())
    query.set('locale', code)
    return `${pathname}?${query.toString()}`
  }

  return (
    <div className={styles.top} data-admin="top">
      {/* How tall the bar is with its sub-nav (for the screens that fill the height under it), and
          the content language's badge beside localized fields («БГ»). */}
      <style>{`:root{--admin-top:${siblings.length > 1 ? 108 : 64}px;--admin-locale:"${
        localeLabels[code] ?? code.toUpperCase()
      }"}`}</style>
      {/* Not a <header>: a list's own header is the screen's banner. */}
      <div className={styles.bar}>
        <nav className={styles.crumbs} aria-label="Път">
          {crumbs.slice(0, -1).map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className={styles.crumb}>
              {crumb.href && title && index === crumbs.length - 2 ? (
                <Link href={crumb.href}>{crumb.label}</Link>
              ) : (
                crumb.label
              )}
              <span aria-hidden="true">/</span>
            </span>
          ))}
          {current && (
            <span className={styles.current} aria-current="page">
              {current.label}
            </span>
          )}
        </nav>

        {locales.length > 1 && (
          <div className={styles.locales} role="group" aria-label="Език на съдържанието">
            {locales.map((option) => (
              <Link
                key={option}
                href={localeHref(option)}
                className={styles.locale}
                aria-current={code === option ? 'true' : undefined}
              >
                <span aria-hidden="true">{localeLabels[option] ?? option.toUpperCase()}</span>
                <span className={styles.srOnly}>{localeNames[option] ?? option}</span>
              </Link>
            ))}
          </div>
        )}

        <a href={siteUrl} target="_blank" rel="noopener" className={styles.site}>
          Виж сайта
          <span className={styles.srOnly}> (в нов прозорец)</span>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path
              d="M5.5 2.5h-3v9h9v-3M8 2.5h3.5V6M11.5 2.5 6.5 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>

        <AccountMenu
          initials={initials(userName)}
          name={userName}
          accountUrl={accountUrl}
          logoutUrl={logoutUrl}
        />
      </div>

      {siblings.length > 1 && (
        <nav className={styles.subnav} aria-label="Раздел">
          {siblings.map((item) => (
            <Link
              key={item.key}
              href={item.href ?? '#'}
              className={styles.tab}
              aria-current={item.key === activeKey ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}

/** The avatar with the account's menu: the profile and «Изход». */
function AccountMenu({
  initials,
  name,
  accountUrl,
  logoutUrl,
}: {
  initials: string
  name: string
  accountUrl: string
  logoutUrl: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (event: Event) => {
      if (
        event instanceof KeyboardEvent
          ? event.key === 'Escape'
          : !ref.current?.contains(event.target as Node)
      )
        setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <div className={styles.account} ref={ref}>
      <button
        type="button"
        className={styles.avatar}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{initials}</span>
        <span className={styles.srOnly}>Профил: {name}</span>
      </button>
      {open && (
        <div className={styles.menu}>
          <p className={styles.menuName}>{name}</p>
          <Link href={accountUrl} className={styles.menuItem} onClick={() => setOpen(false)}>
            Профил
          </Link>
          <Link href={logoutUrl} className={styles.menuItem}>
            Изход
          </Link>
        </div>
      )}
    </div>
  )
}
