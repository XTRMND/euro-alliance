import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { CookieConsent } from '@/components/shell/CookieConsent'
import { Footer } from '@/components/shell/Footer'
import { Header } from '@/components/shell/Header'
import { SkipLink } from '@/components/shell/SkipLink'
import { getNavigation, getOffices, getSite } from '@/lib/cms'
import { consentHeadScript } from '@/lib/consent'
import { fontVariables } from '@/styles/fonts'
import '@/styles/tokens.css'
import '@/styles/globals.css'

// Rendered on request: pages read the CMS through cached reads (src/lib/cms.ts) that Payload
// hooks invalidate, so a build needs no database. CDN caching of whole pages comes with the CDN.
export const dynamic = 'force-dynamic'

// Temporary until PR 8 (homepage) and PR 22 (SEO) move these into the CMS.
export const metadata: Metadata = {
  title: 'Евро Алианс',
  description:
    'Езиков център, лицензиран център за професионално обучение и агенция за преводи в Пловдив и София от 1999 г.',
  // Favicon set from the Logo mark (127:312).
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default async function FrontendLayout({ children }: LayoutProps<'/'>) {
  const [navigation, site, offices, messages] = await Promise.all([
    getNavigation(),
    getSite(),
    getOffices(),
    getMessages(),
  ])
  const office = offices.find((o) => o.role === 'courses')

  return (
    // The consent script marks <html> with data-consent before React hydrates (one attribute, so
    // the warning is suppressed on this element only).
    <html lang="bg" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Consent Mode's defaults and the stored choice, before anything else (src/lib/consent). */}
        <script dangerouslySetInnerHTML={{ __html: consentHeadScript() }} />
      </head>
      <body>
        <SkipLink />
        <NextIntlClientProvider messages={{ consent: messages.consent }}>
          <CookieConsent />
        </NextIntlClientProvider>
        <Header navigation={navigation} office={office} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer navigation={navigation} site={site} />
      </body>
    </html>
  )
}
