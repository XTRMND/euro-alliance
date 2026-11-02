import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'
import {
  consentChoice,
  consentHeadScript,
  consentMode,
  makeConsent,
  parseConsent,
  serializeConsent,
} from '@/lib/consent'

const essential = { functional: false, statistics: false, marketing: false }

describe('the stored consent', () => {
  it('reads back what it stored', () => {
    const consent = makeConsent({ ...essential, statistics: true }, 1000)
    expect(parseConsent(serializeConsent(consent))).toEqual(consent)
  })

  it('is no choice when missing, unreadable or from an older version', () => {
    expect(parseConsent(undefined)).toBeNull()
    expect(parseConsent('%7Bnot json')).toBeNull()
    expect(parseConsent(encodeURIComponent(JSON.stringify({ v: 0, ts: 1 })))).toBeNull()
  })

  it('names the choice for the cookie_consent event', () => {
    expect(consentChoice(makeConsent(essential))).toBe('essential_only')
    expect(
      consentChoice(makeConsent({ functional: true, statistics: true, marketing: true })),
    ).toBe('all')
    expect(consentChoice(makeConsent({ ...essential, statistics: true }))).toBe('custom')
  })
})

describe('Consent Mode', () => {
  it('grants storage per category', () => {
    const mode = consentMode(makeConsent({ ...essential, statistics: true }))
    expect(mode.analytics_storage).toBe('granted')
    expect(mode.ad_storage).toBe('denied')
    expect(mode.functionality_storage).toBe('denied')
  })

  it('sets denied defaults in the head script before reading the cookie', () => {
    const script = consentHeadScript()
    expect(script).toContain("'consent','default'")
    expect(script).toContain('"analytics_storage":"denied"')
    expect(script).toContain('ea_consent')
  })

  it('runs once, however often the script is added (HeadScripts adds it again)', () => {
    // The page's global object, as in a browser: `window` is the global itself.
    const page: { window?: unknown; dataLayer?: unknown[][]; document: { cookie: string } } = {
      document: { cookie: '' },
    }
    page.window = page
    runInNewContext(consentHeadScript(), page)
    runInNewContext(consentHeadScript(), page)
    const defaults = page.dataLayer?.filter((entry) => entry[1] === 'default')
    expect(defaults).toHaveLength(1)
  })
})
