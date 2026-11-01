import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalPage } from '@/components/legal/LegalPage'
import { getLegalPage } from '@/lib/cms'
import { legalDescription } from '@/lib/legal'

// Cookies (224:3208 / 226:2775): the cookie policy, from its Legal pages document.

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage('cookies')
  if (!page) return {}
  return { title: page.title, description: legalDescription(page.sections ?? []) }
}

export default async function CookiesPage() {
  const page = await getLegalPage('cookies')
  if (!page) notFound()
  return <LegalPage page={page} />
}
