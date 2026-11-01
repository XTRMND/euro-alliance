import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { tags } from '@/hooks/revalidate'
import { startOfTodayInSofia } from '@/lib/format'
import type { Media } from '@/payload-types'

// Payload reads for the public site. They run as an anonymous visitor (overrideAccess: false), so
// only published content comes back, and are cached in Next's data cache until a Payload hook
// marks them stale (src/hooks/revalidate.ts).

const payload = () => getPayload({ config })

export const getNavigation = unstable_cache(
  async () =>
    (await payload()).findGlobal({
      slug: 'navigation',
      locale: 'bg',
      depth: 0,
      overrideAccess: false,
    }),
  ['navigation'],
  { tags: [tags.global('navigation')] },
)

export const getSite = unstable_cache(
  async () =>
    (await payload()).findGlobal({ slug: 'site', locale: 'bg', depth: 1, overrideAccess: false }),
  ['site'],
  { tags: [tags.global('site')] },
)

export const getOffices = unstable_cache(
  async () =>
    (
      await (
        await payload()
      ).find({
        collection: 'offices',
        locale: 'bg',
        depth: 0,
        sort: 'id',
        limit: 20,
        overrideAccess: false,
      })
    ).docs,
  ['offices'],
  { tags: [tags.collection('offices')] },
)

/**
 * Fills in the tints of photos reached through a relationship: Payload populates the `tints`
 * join only on media queried directly, so related media get theirs with one more query.
 */
async function attachTints(values: unknown[]) {
  const media = values.filter((value): value is Media => typeof value === 'object' && !!value)
  if (media.length === 0) return
  const { docs } = await (
    await payload()
  ).find({
    collection: 'media-tints',
    where: { source: { in: media.map((m) => m.id) } },
    depth: 0,
    limit: media.length * 4,
    pagination: false,
    overrideAccess: false,
  })
  for (const m of media) {
    m.tints = { docs: docs.filter((tint) => tint.source === m.id) }
  }
}

/** The homepage global with its photos (and their tints) and the partner logos. */
export const getHome = unstable_cache(
  async () => {
    const home = await (
      await payload()
    ).findGlobal({ slug: 'home', locale: 'bg', depth: 1, overrideAccess: false })
    await attachTints([home.hero.photo, home.hero.photoSecondary])
    return home
  },
  ['home'],
  { tags: [tags.global('home'), tags.collection('media')] },
)

/** The languages of the translation agency, in the client's order. */
export const getTranslationLanguages = unstable_cache(
  async () => {
    const translation = await (
      await payload()
    ).findGlobal({ slug: 'translation', locale: 'bg', depth: 0, overrideAccess: false })
    return (translation.languages ?? []).map((language) => language.name)
  },
  ['translation-languages'],
  { tags: [tags.global('translation')] },
)

const upcomingCourses = unstable_cache(
  async (from: string, limit: number) =>
    (
      await (
        await payload()
      ).find({
        collection: 'courses',
        locale: 'bg',
        depth: 0,
        where: { startDate: { greater_than_equal: from } },
        sort: 'startDate',
        limit,
        overrideAccess: false,
      })
    ).docs,
  ['upcoming-courses'],
  { tags: [tags.collection('courses')] },
)

/** Published courses starting today or later, soonest first. The day is part of the cache key. */
export function getUpcomingCourses(limit = 24) {
  return upcomingCourses(startOfTodayInSofia(), limit)
}

/** The latest published news with their covers' tints. */
export const getLatestNews = unstable_cache(
  async (limit: number) => {
    const { docs } = await (
      await payload()
    ).find({
      collection: 'news',
      locale: 'bg',
      depth: 1,
      select: { title: true, slug: true, date: true, cover: true },
      sort: '-date',
      limit,
      overrideAccess: false,
    })
    await attachTints(docs.map((news) => news.cover))
    return docs
  },
  ['latest-news'],
  { tags: [tags.collection('news'), tags.collection('media')] },
)
