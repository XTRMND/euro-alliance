import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalPage } from '@/components/legal/LegalPage'
import { getLegalPage } from '@/lib/cms'
import { legalDescription } from '@/lib/legal'

// Privacy (218:2842 / 226:2581): the privacy policy, from its Legal pages document.

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage('privacy')
  if (!page) return {}
  return { title: page.title, description: legalDescription(page.sections ?? []) }
}

export default async function PrivacyPage() {
  const page = await getLegalPage('privacy')
  if (!page) notFound()
  return <LegalPage page={page} />
}
