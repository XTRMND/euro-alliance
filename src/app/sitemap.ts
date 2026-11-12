import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import { routes } from '@/lib/routes'
import { getSearchRecords } from '@/lib/search-records'
import { siteUrl } from '@/lib/seo'

// sitemap.xml (PR 22): the fixed pages and every published page the search looks through
// (programs, courses, news, legal pages, About), which is exactly what's published. Not the search page,
// the dev pages or old addresses. Built on request: the build has no database.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const payload = await getPayload({ config })
  const docs = await getSearchRecords(payload)
  const fixed = [routes.home(), routes.courses(), routes.news(), routes.contact()]
  const seen = new Set<string>()
  return [
    ...fixed.map((path) => ({ url: `${base}${path}` })),
    ...docs.map((doc) => ({ url: `${base}${doc.url}`, lastModified: doc.updatedAt ?? undefined })),
  ].filter((entry) => !seen.has(entry.url) && seen.add(entry.url))
}
