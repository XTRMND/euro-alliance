import { readConsent } from './consent'

// Analytics events (docs/measurement.md § 1), sent to GA4 through gtag.js only with statistics
// consent (Consent Mode basic). Event names and their params are typed, so a typo fails the
// build. Never put personal data in an event: no names, emails, phone numbers, file names or
// message text.

type Placement = 'header' | 'footer' | 'page' | 'contact'

export type AnalyticsEvents = {
  wizard_start: { topic: string; source_page: string }
  wizard_step: { step: 1 | 2 | 3; topic: string }
  wizard_submit: { topic: string; office: 'plovdiv' | 'sofia' | 'none'; has_upload: boolean }
  document_upload: { file_count: number }
  enrol_click: { course: string; language?: string; audience?: string; level?: string }
  tel_click: { office: string; placement: Placement }
  mailto_click: { inbox: 'office' | 'prevod' | 'trans'; placement: Placement }
  course_view: { course: string; language?: string; audience?: string; level?: string }
  search: { search_term: string; results_count: number; tab: string }
  voucher_apply_click: { destination: string }
  cookie_consent: {
    choice: 'essential_only' | 'all' | 'custom'
    functional: boolean
    statistics: boolean
    marketing: boolean
  }
}

export type AnalyticsEvent = keyof AnalyticsEvents

const inboxes = ['office', 'prevod', 'trans'] as const

/** The `inbox` param of a mailto link: the address's local part, if it's one of the three. */
export function inboxOf(email: string): AnalyticsEvents['mailto_click']['inbox'] | undefined {
  const local = email.split('@')[0]?.toLowerCase()
  return inboxes.find((inbox) => inbox === local)
}

/**
 * The `search_term` param: the query without anything that could identify someone (an email
 * address, a phone number, a long run of digits), at most 100 characters.
 */
export function cleanSearchTerm(query: string): string {
  return query
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[redacted]')
    .replace(/\+?\d[\d\s().-]{5,}\d/g, '[redacted]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
}

type Gtag = (...args: unknown[]) => void

/** The page's `gtag`, defined by the consent head script (src/lib/consent.ts). */
export function gtag(...args: unknown[]): void {
  ;(window as unknown as { gtag?: Gtag }).gtag?.(...args)
}

/** A GA4 measurement ID, or undefined for a missing or placeholder one (G-XXXXXXXXXX). */
export function measurementIdOf(value: string | undefined): string | undefined {
  return value && /^G-[A-Z0-9]{4,}$/.test(value) && !/^G-X+$/.test(value) ? value : undefined
}

/**
 * Sends an event to GA4, only with statistics consent. Queued in `dataLayer` until gtag.js has
 * loaded (src/components/shell/GoogleAnalytics.tsx); nothing reaches Google before consent.
 */
export function track<E extends AnalyticsEvent>(event: E, params: AnalyticsEvents[E]): void {
  if (typeof window === 'undefined' || !readConsent()?.statistics) return
  gtag('event', event, params)
}
