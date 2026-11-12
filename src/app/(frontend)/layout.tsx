import type { Metadata } from 'next'
import lazy from 'next/dynamic'
import { getMessages, getTranslations } from 'next-intl/server'
import { CookieConsent } from '@/components/shell/CookieConsent'
import { GoogleAnalytics } from '@/components/shell/GoogleAnalytics'
import { Footer } from '@/components/shell/Footer'
import { HeadScripts } from '@/components/shell/HeadScripts'
import { Header } from '@/components/shell/Header'
import { SkipLink } from '@/components/shell/SkipLink'
import { previewRequest } from '@/lib/preview-request'
import { getNavigation, getOffices, getSite } from '@/lib/cms'
import { measurementIdOf } from '@/lib/analytics'
import { requestNonce } from '@/lib/nonce'
import { consentHeadScript } from '@/lib/consent'
import { siteUrl } from '@/lib/seo'
import { handFontScript } from '@/styles/font-hand'
import { fontVariables } from '@/styles/fonts'
import '@/styles/tokens.css'
import '@/styles/globals.css'

// The live preview's script, in a chunk of its own: only an editor's preview frame loads it, never
// a visitor's page.
const LivePreviewBridge = lazy(() =>
  import('@/components/preview/LivePreviewBridge').then((module) => module.LivePreviewBridge),
)

// Rendered on request: pages read the CMS through cached reads (src/lib/cms.ts) that Payload
// hooks invalidate, so a build needs no database. CDN caching of whole pages comes with the CDN.
export const dynamic = 'force-dynamic'

// The site-wide <head> (PR 22): the address every relative URL resolves against, «… | Евро
// Алианс» titles, the default description and sharing card (pages add theirs through
// src/lib/seo.ts), and indexing only where ALLOW_INDEXING=true: production, never staging.
export async function generateMetadata(): Promise<Metadata> {
  const [t, site] = await Promise.all([getTranslations('seo'), getSite()])
  const name = site.name || t('name')
  const indexing = process.env.ALLOW_INDEXING === 'true'
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: name, template: `%s | ${name}` },
    description: t('description'),
    applicationName: name,
    robots: indexing ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { type: 'website', siteName: name, locale: 'bg_BG' },
    twitter: { card: 'summary_large_image' },
    // Favicon set from the Logo mark (127:312).
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
  }
}

export default async function FrontendLayout({ children }: LayoutProps<'/'>) {
  // Read when the page is served, so the ID can change without a new build.
  const measurementId = measurementIdOf(process.env.GA4_MEASUREMENT_ID)
  const [navigation, site, offices, messages, nonce] = await Promise.all([
    getNavigation(),
    getSite(),
    getOffices(),
    getMessages(),
    requestNonce(),
  ])
  const office = offices.find((o) => o.role === 'courses')
  // The admin's live preview frame (an editor, `?preview=` in the address): its link to the form.
  const preview = await previewRequest()

  return (
    // The consent script marks <html> with data-consent before React hydrates (one attribute, so
    // the warning is suppressed on this element only).
    <html lang="bg" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Consent Mode's defaults and the stored choice, before anything else (src/lib/consent). */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: consentHeadScript() }} />
        {/* The handwriting (Caveat) once the page has loaded, after the LCP. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: handFontScript }} />
      </head>
      <body>
        <HeadScripts />
        {preview && (
          <LivePreviewBridge kind={preview.kind} id={preview.id} locale={preview.locale} />
        )}
        <SkipLink />
        <CookieConsent labels={messages.consent} />
        {measurementId && <GoogleAnalytics measurementId={measurementId} />}
        <Header navigation={navigation} office={office} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer navigation={navigation} site={site} />
      </body>
    </html>
  )
}
