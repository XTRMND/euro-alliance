'use client'

import { useEffect } from 'react'
import { gtag } from '@/lib/analytics'
import { consentChangeEvent, readConsent } from '@/lib/consent'

// GA4 (docs/measurement.md § 1) with Consent Mode basic: gtag.js loads only once statistics is
// granted, now or later from the banner or the settings; withdrawn, GA stops (`ga-disable-<id>`)
// and its cookies go (CookieConsent). No cookie outlives 12 months: `cookie_expires`. Page views
// on client navigation come from GA4's enhanced measurement (browser history).

const cookieExpires = 31_536_000

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  useEffect(() => {
    const apply = () => {
      const disabled = `ga-disable-${measurementId}`
      const page = window as unknown as Record<string, unknown>
      if (!readConsent()?.statistics) {
        page[disabled] = true
        return
      }
      page[disabled] = false
      if (document.getElementById('ga4')) return
      gtag('js', new Date())
      gtag('config', measurementId, { cookie_expires: cookieExpires })
      const script = document.createElement('script')
      script.id = 'ga4'
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
      document.head.append(script)
    }
    apply()
    window.addEventListener(consentChangeEvent, apply)
    return () => window.removeEventListener(consentChangeEvent, apply)
  }, [measurementId])

  return null
}
