'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Tape } from '@/components/visuals/Tape'
import type bg from '@/messages/bg.json'
import { gtag, track } from '@/lib/analytics'
import {
  type Consent,
  type ConsentCategory,
  consentCategories,
  consentChangeEvent,
  consentChoice,
  consentCookie,
  consentMaxAge,
  consentMode,
  makeConsent,
  readConsent,
  serializeConsent,
  siteCookies,
  withdrawnCookies,
} from '@/lib/consent'
import { openCookieSettingsEvent } from './CookieSettingsButton'
import styles from './CookieConsent.module.css'

// Cookie consent (223:398): on a first visit the banner floats at the bottom (not a modal: the
// page stays usable), with «Само задължителни» and «Приеми всички» of the same size and
// «Настройки». The settings are a dialog: the four categories with their toggles (essential
// locked on) and the cookies each one sets. The footer's «Настройки на бисквитките» reopens it.
// The banner is in the server's HTML; the head script hides it when a choice is stored.

/** The `consent` messages, passed as they are: no next-intl runtime on every page for them. */
type ConsentLabels = typeof bg.consent

const all = { functional: true, statistics: true, marketing: true }
const none = { functional: false, statistics: false, marketing: false }

function store(consent: Consent) {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${consentCookie}=${serializeConsent(consent)}; Max-Age=${consentMaxAge}; Path=/; SameSite=Lax${secure}`
  document.documentElement.setAttribute('data-consent', 'set')
  gtag('consent', 'update', consentMode(consent))
  // A withdrawn category's cookies go with it.
  for (const category of consentCategories) {
    if (consent[category]) continue
    for (const prefix of withdrawnCookies[category]) {
      for (const cookie of document.cookie.split('; ')) {
        const name = cookie.split('=')[0]
        if (name.startsWith(prefix)) {
          document.cookie = `${name}=; Max-Age=0; Path=/`
          document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${location.hostname}`
        }
      }
    }
  }
  // GA4 loads or stops first (GoogleAnalytics), so its config is queued before this event.
  window.dispatchEvent(new Event(consentChangeEvent))
  track('cookie_consent', {
    choice: consentChoice(consent),
    functional: consent.functional,
    statistics: consent.statistics,
    marketing: consent.marketing,
  })
}

export function CookieConsent({ labels }: { labels: ConsentLabels }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const [stored, setStored] = useState<Consent | null | undefined>(undefined)
  const [choice, setChoice] = useState<Record<ConsentCategory, boolean>>(none)

  useEffect(() => {
    // The cookie is only readable after hydration; until then the head script has decided.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the browser's cookie once
    setStored(readConsent())
    const open = () => {
      opener.current = document.activeElement as HTMLElement | null
      const current = readConsent()
      setChoice(current ? { ...current } : none)
      dialog.current?.showModal()
    }
    window.addEventListener(openCookieSettingsEvent, open)
    return () => window.removeEventListener(openCookieSettingsEvent, open)
  }, [])

  const decide = (value: Record<ConsentCategory, boolean>) => {
    const consent = makeConsent(value)
    store(consent)
    setStored(consent)
    dialog.current?.close()
  }

  return (
    <>
      {!stored && (
        <section className={styles.banner} aria-labelledby="consent-title">
          <Tape className={styles.tape} />
          <div className={styles.text}>
            <h2 id="consent-title" className={styles.title}>
              {labels.title}
            </h2>
            <p className={styles.lead}>{labels.text}</p>
          </div>
          <div className={styles.actions}>
            <Button
              variant="link"
              className={styles.settings}
              onClick={() => window.dispatchEvent(new Event(openCookieSettingsEvent))}
            >
              {labels.settings}
            </Button>
            <Button variant="secondary" onClick={() => decide(none)}>
              {labels.essentialOnly}
            </Button>
            <Button onClick={() => decide(all)}>{labels.acceptAll}</Button>
          </div>
        </section>
      )}
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="consent-settings-title"
        onClose={() => opener.current?.focus()}
      >
        <Tape className={styles.tape} />
        <div className={styles.dialogHead}>
          <h2 id="consent-settings-title" className={styles.dialogTitle}>
            {labels.settingsTitle}
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label={labels.close}
            onClick={() => dialog.current?.close()}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <p className={styles.lead}>{labels.settingsText}</p>
        <ul className={styles.categories}>
          {(['essential', ...consentCategories] as const).map((category) => (
            <li key={category} className={styles.category}>
              <div className={styles.categoryText}>
                <span className={styles.categoryName}>{labels.category[category].name}</span>
                <span id={`consent-${category}`} className={styles.categoryDescription}>
                  {labels.category[category].description}
                </span>
                {siteCookies[category].length > 0 && (
                  <ul className={styles.cookies} aria-label={labels.cookies}>
                    {siteCookies[category].map((name) => (
                      <li key={name}>
                        <code>{name}</code> · {labels.cookie[name as 'ea_consent'].provider} ·{' '}
                        {labels.cookie[name as 'ea_consent'].duration}:{' '}
                        {labels.cookie[name as 'ea_consent'].purpose}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {category === 'essential' ? (
                <Toggle
                  label={`${labels.category[category].name}: ${labels.alwaysOn}`}
                  hideLabel
                  locked
                  aria-describedby={`consent-${category}`}
                />
              ) : (
                <Toggle
                  label={labels.category[category].name}
                  hideLabel
                  checked={choice[category]}
                  onChange={(event) => setChoice({ ...choice, [category]: event.target.checked })}
                  aria-describedby={`consent-${category}`}
                />
              )}
            </li>
          ))}
        </ul>
        <div className={styles.dialogActions}>
          <Button variant="secondary" onClick={() => decide(choice)}>
            {labels.save}
          </Button>
          <Button onClick={() => decide(all)}>{labels.acceptAll}</Button>
        </div>
      </dialog>
    </>
  )
}
