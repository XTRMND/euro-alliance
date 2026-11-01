import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import { routes } from '@/lib/routes'
import { siteUrl } from '@/lib/seo'

// sitemap.xml (PR 22): the fixed pages and every published page in the search index (programs,
// courses, news, legal pages, About), which lists exactly what's published. Not the search page,
// the dev pages or old addresses. Built on request: the build has no database.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'search',
    depth: 0,
    pagination: false,
    select: { url: true, updatedAt: true },
  })
  const fixed = [routes.home(), routes.courses(), routes.news(), routes.contact()]
  const seen = new Set<string>()
  return [
    ...fixed.map((path) => ({ url: `${base}${path}` })),
    ...docs.map((doc) => ({ url: `${base}${doc.url}`, lastModified: doc.updatedAt })),
  ].filter((entry) => !seen.has(entry.url) && seen.add(entry.url))
}
