import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

// robots.txt (PR 22): crawlers welcome only where ALLOW_INDEXING=true (production); anywhere else,
// staging included, nothing is crawled. Read on request, so the same build serves both.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  if (process.env.ALLOW_INDEXING !== 'true') return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/tarsene'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
