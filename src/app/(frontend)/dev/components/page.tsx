import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Gallery } from './Gallery'

// Every component in every Figma variant, for side-by-side checks and the keyboard tests.
// Development only: served with DEV_PAGES=true and never indexed.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Компоненти',
  robots: { index: false, follow: false },
}

export default function ComponentsPage() {
  if (process.env.DEV_PAGES !== 'true') notFound()
  return <Gallery />
}
