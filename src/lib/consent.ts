// Cookie consent (docs/motion.md § 7, docs/measurement.md): the visitor's choice in the
// `ea_consent` cookie for 6 months, and Google's Consent Mode v2 (basic: every Google tag waits
// for statistics consent; GA4 arrives in PR 20). The cookie policy promises the full list of the
// site's cookies in the settings: `siteCookies` is that list, and never names a cookie the site
// doesn't set.

export const consentCookie = 'ea_consent'
/** Raise it when the categories change: everyone is asked again. */
export const consentVersion = 1
/** 180 days: «Избора ви за бисквитките помним 6 месеца». */
export const consentMaxAge = 15_552_000

export const consentCategories = ['functional', 'statistics', 'marketing'] as const
export type ConsentCategory = (typeof consentCategories)[number]

export type Consent = { v: number; ts: number } & Record<ConsentCategory, boolean>

export function makeConsent(choice: Record<ConsentCategory, boolean>, now = Date.now()): Consent {
  return { v: consentVersion, ts: now, ...choice }
}

/** The stored choice, or null when there's none, it's unreadable or from an older version. */
export function parseConsent(value: string | null | undefined): Consent | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<Consent>
    if (parsed.v !== consentVersion || typeof parsed.ts !== 'number') return null
    return {
      v: parsed.v,
      ts: parsed.ts,
      functional: parsed.functional === true,
      statistics: parsed.statistics === true,
      marketing: parsed.marketing === true,
    }
  } catch {
    return null
  }
}

export function serializeConsent(consent: Consent): string {
  return encodeURIComponent(JSON.stringify(consent))
}

/** The `cookie_consent` event's `choice`. */
export function consentChoice(consent: Consent): 'essential_only' | 'all' | 'custom' {
  const on = consentCategories.filter((category) => consent[category])
  return on.length === 0
    ? 'essential_only'
    : on.length === consentCategories.length
      ? 'all'
      : 'custom'
}

type ConsentState = 'granted' | 'denied'

/** Consent Mode v2 before any choice: everything denied but security. */
export const consentModeDefaults: Record<string, ConsentState> = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
}

/** Consent Mode v2 for a choice. */
export function consentMode(consent: Consent): Record<string, ConsentState> {
  const state = (on: boolean): ConsentState => (on ? 'granted' : 'denied')
  return {
    analytics_storage: state(consent.statistics),
    ad_storage: state(consent.marketing),
    ad_user_data: state(consent.marketing),
    ad_personalization: state(consent.marketing),
    functionality_storage: state(consent.functional),
    personalization_storage: state(consent.functional),
  }
}

/** Cookies of a category that are deleted when its consent is withdrawn (prefixes). */
export const withdrawnCookies: Record<ConsentCategory, string[]> = {
  functional: [],
  statistics: ['_ga'],
  marketing: ['_fbp', '_fbc'],
}

/** The cookies the site sets, by category: only `ea_consent` today. */
export const siteCookies: Record<'essential' | ConsentCategory, string[]> = {
  essential: [consentCookie],
  functional: [],
  statistics: [],
  marketing: [],
}

/**
 * The inline script that runs before anything else: Consent Mode's defaults, the stored choice
 * applied, and `data-consent` on <html> so the banner is hidden from the first paint.
 */
export function consentHeadScript(): string {
  return `(function(){window.dataLayer=window.dataLayer||[];function g(){dataLayer.push(arguments)}g('consent','default',${JSON.stringify({ ...consentModeDefaults, wait_for_update: 500 })});var m=document.cookie.match(/(?:^|; )${consentCookie}=([^;]*)/);if(!m)return;try{var c=JSON.parse(decodeURIComponent(m[1]));if(c.v!==${consentVersion})return;document.documentElement.setAttribute('data-consent','set');var s=function(o){return o?'granted':'denied'};g('consent','update',{analytics_storage:s(c.statistics),ad_storage:s(c.marketing),ad_user_data:s(c.marketing),ad_personalization:s(c.marketing),functionality_storage:s(c.functional),personalization_storage:s(c.functional)})}catch(e){}})()`
}
