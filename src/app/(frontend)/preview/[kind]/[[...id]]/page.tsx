import config from '@payload-config'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { LivePreviewBridge } from '@/components/preview/LivePreviewBridge'
import { previewDoc } from '@/lib/cms-preview'
import { isPreviewKind, setPreview } from '@/lib/preview'
import { storedPreview } from '@/lib/preview-store'
import { audienceSegments, languageSegments } from '@/lib/routes'
import type { Course, News, Program } from '@/payload-types'
import HomePage from '../../../page'
import LanguageProgramPage from '../../../ezitsi/[language]/[audience]/page'
import ComputerCoursesPage from '../../../kompyutarni-kursove/page'
import ContactPage from '../../../kontakti/page'
import CoursePage from '../../../kursove/[slug]/page'
import NewsArticlePage from '../../../novini/[slug]/page'
import TranslationsPage from '../../../prevodi/page'
import TeachersPage from '../../../profesionalno-obuchenie/pedagogicheski-spetsialisti/page'
import ProfessionsPage from '../../../profesionalno-obuchenie/profesii/page'
import FarmersPage from '../../../profesionalno-obuchenie/zemedeltsi/page'
import VouchersPage from '../../../vaucheri/page'
import AboutPage from '../../../za-nas/page'

// The admin's live preview frame (docs/admin-redesign.md, decision 11): the page's own template,
// rendered from the form's unsaved data, or from the stored draft until the frame has sent some.
// Staff only (anyone else gets the 404 page), never indexed, never cached.

export const metadata: Metadata = { robots: { index: false, follow: false } }

type Props = {
  params: Promise<{ kind: string; id?: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)
const resolved = <T,>(value: T) => Promise.resolve(value)
const noQuery = resolved({})

const programPages = {
  vouchers: VouchersPage,
  vocational: ProfessionsPage,
  teachers: TeachersPage,
  farmers: FarmersPage,
  computer: ComputerCoursesPage,
  translations: TranslationsPage,
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const [{ kind, id: idSegments }, query] = await Promise.all([params, searchParams])
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || !isPreviewKind(kind)) notFound()

  const collection = kind === 'courses' || kind === 'programs' || kind === 'news'
  const id = idSegments?.[0]
  if (collection ? !id || !/^\d+$/.test(id) || idSegments!.length > 1 : idSegments) notFound()

  const locale = one(query.locale) === 'en' ? 'en' : 'bg'
  const data = storedPreview(one(query.live), { user: user.id, kind, id })
  const doc = await previewDoc(kind, id, data, locale)
  if (!doc) notFound()
  setPreview(kind, doc)

  return (
    <>
      <LivePreviewBridge kind={kind} id={id} locale={locale} />
      {page()}
    </>
  )

  function page() {
    switch (kind) {
      case 'courses':
        return (
          <CoursePage
            params={resolved({ slug: (doc as Course).slug || 'preview' })}
            searchParams={noQuery}
          />
        )
      case 'news':
        return (
          <NewsArticlePage
            params={resolved({ slug: (doc as News).slug || 'preview' })}
            searchParams={noQuery}
          />
        )
      case 'programs': {
        const program = doc as Program
        if (program.type !== 'language') {
          const Page = programPages[program.type]
          return <Page />
        }
        // A language programme without its language or audience yet has no page to show.
        if (!program.language || !program.audience) notFound()
        return (
          <LanguageProgramPage
            params={resolved({
              language: languageSegments[program.language],
              audience: audienceSegments[program.audience],
            })}
            searchParams={noQuery}
          />
        )
      }
      case 'home':
        return <HomePage />
      case 'about':
        return <AboutPage />
      case 'contact':
        return <ContactPage params={resolved({})} searchParams={noQuery} />
    }
  }
}
