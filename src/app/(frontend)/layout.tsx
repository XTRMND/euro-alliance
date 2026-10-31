import type { Metadata } from 'next'

// Temporary until PR 8 (homepage) and PR 22 (SEO) move these into the CMS.
export const metadata: Metadata = {
  title: 'Евро Алианс',
  description:
    'Езиков център, лицензиран център за професионално обучение и агенция за преводи в Пловдив и София от 1999 г.',
  // No favicon until PR 5 exports the Logo mark; this stops the browser requesting /favicon.ico.
  icons: { icon: 'data:,' },
}

export default function FrontendLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  )
}
