import type { Metadata } from 'next'
import { getSite } from '@/lib/cms'
import type { Media } from '@/payload-types'

// The <head> of a page (PR 22): its title and description, its canonical address, and the Open
// Graph and Twitter cards. A page's CMS `meta` fields win over its own title and lead; the image
// falls back to the site's default (the `site` global, then the layout's).

type Meta = {
  title?: string | null
  description?: string | null
  image?: number | Media | null
} | null

/** The site's public address, without a trailing slash. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3200').replace(/\/+$/, '')
}

/** A description of at most 160 characters, cut at a word. */
export function shortDescription(text: string | null | undefined): string | undefined {
  const value = text?.replace(/\s+/g, ' ').trim()
  if (!value) return undefined
  return value.length <= 160 ? value : `${value.slice(0, 159).replace(/\s+\S*$/, '')}…`
}

type PageMetadata = {
  /** The page's own title and lead. */
  title: string
  description?: string | null
  /** The canonical path, e.g. /kursove/test-course-a. */
  path: string
  /** The page's own photo for sharing, if it has one. */
  image?: number | Media | null
  /** The CMS `meta` group. */
  meta?: Meta
  type?: 'website' | 'article'
}

const imageOf = (image: number | Media | null | undefined) =>
  image && typeof image === 'object' && image.url
    ? [
        {
          url: image.url,
          width: image.width ?? undefined,
          height: image.height ?? undefined,
          alt: image.alt,
        },
      ]
    : undefined

/** The site's name and its default sharing image, from the `site` global. */
async function siteDefaults() {
  const site = await getSite()
  return { name: site.name || 'Евро Алианс', image: site.seoImage as number | Media | null }
}

export async function pageMetadata({
  title,
  description,
  path,
  image,
  meta,
  type = 'website',
}: PageMetadata): Promise<Metadata> {
  const site = await siteDefaults()
  const pageTitle = meta?.title?.trim() || title
  const pageDescription = shortDescription(meta?.description || description)
  const images = imageOf(meta?.image) ?? imageOf(image) ?? imageOf(site.image)
  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: site.name,
      locale: 'bg_BG',
      url: path,
      title: pageTitle,
      description: pageDescription,
      ...(images && { images }),
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      ...(images && { images: images.map((item) => item.url) }),
    },
  }
}
