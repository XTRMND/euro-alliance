import type { Metadata } from 'next'
import { Footer } from '@/components/shell/Footer'
import { Header } from '@/components/shell/Header'
import { SkipLink } from '@/components/shell/SkipLink'
import { getNavigation, getOffices, getSite } from '@/lib/cms'
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
  const [navigation, site, offices] = await Promise.all([getNavigation(), getSite(), getOffices()])
  const office = offices.find((o) => o.role === 'courses')

  return (
    <html lang="bg" className={fontVariables}>
      <body>
        <SkipLink />
        <Header navigation={navigation} office={office} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer navigation={navigation} site={site} />
      </body>
    </html>
  )
}
