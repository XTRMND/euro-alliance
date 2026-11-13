import config from '@payload-config'
import { getPayload } from 'payload'
import { attachTints } from '@/lib/cms'
import { withGroups } from '@/lib/course-query'
import type { PreviewKind } from '@/lib/preview'
import type { Course } from '@/payload-types'

// The document a preview shows, read as the site reads it (the same depth, tints and groups as
// src/lib/cms.ts) but as staff, so drafts come back: from the form's unsaved data when the frame
// has sent it, or else from the stored draft.

type Locale = 'bg' | 'en'

export async function previewDoc(
  kind: PreviewKind,
  id: string | undefined,
  data: Record<string, unknown> | undefined,
  locale: Locale,
): Promise<unknown> {
  const payload = await getPayload({ config })
  // Unsaved data is as the form holds it: one language, and never swapped for the stored draft.
  const from = data
    ? { data: { ...data, ...(id ? { id: Number(id) } : {}) }, flattenLocales: false, draft: false }
    : { draft: true }
  const shared = { locale, overrideAccess: true, ...from } as const

  switch (kind) {
    case 'courses': {
      const course = await payload.findByID({
        collection: 'courses',
        id: id!,
        depth: 1,
        joins: false,
        disableErrors: true,
        ...shared,
      })
      return course ? (await withGroups(payload, [course as Course], 1, true))[0] : null
    }
    case 'programs':
      return payload.findByID({
        collection: 'programs',
        id: id!,
        depth: 2,
        disableErrors: true,
        ...shared,
      })
    case 'news': {
      const article = await payload.findByID({
        collection: 'news',
        id: id!,
        depth: 1,
        disableErrors: true,
        ...shared,
      })
      if (article) await attachTints([article.cover])
      return article
    }
    case 'home': {
      const home = await payload.findGlobal({ slug: 'home', depth: 1, ...shared })
      await attachTints([home.hero?.photo, home.hero?.photoSecondary, home.about?.photo])
      return home
    }
    case 'about': {
      const about = await payload.findGlobal({ slug: 'about', depth: 2, ...shared })
      await attachTints([about.hero?.photo, ...(about.statement?.photos ?? []).map((p) => p.photo)])
      return about
    }
    case 'contact':
      return payload.findGlobal({ slug: 'contact', depth: 1, ...shared })
  }
}
