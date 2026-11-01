import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { tags } from '@/hooks/revalidate'
import type { CourseFilters } from '@/lib/course-filters'
import { findCourse, findCourseMonths, findCourses, findRelatedCourses } from '@/lib/course-query'
import { startOfTodayInSofia } from '@/lib/format'
import type { Media, Program } from '@/payload-types'

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

const listedCourses = unstable_cache(
  async (filters: CourseFilters, today: string) => findCourses(await payload(), filters, today),
  ['listed-courses'],
  { tags: [tags.collection('courses')] },
)

/** The course listing for these filters. The filters and the day are part of the cache key. */
export function getListedCourses(filters: CourseFilters) {
  return listedCourses(filters, startOfTodayInSofia())
}

const courseMonths = unstable_cache(
  async (today: string) => findCourseMonths(await payload(), today),
  ['course-months'],
  { tags: [tags.collection('courses')] },
)

/** The months in which listed courses start, for the «Начало» filter. */
export function getCourseMonths() {
  return courseMonths(startOfTodayInSofia())
}

/** A published course by slug, or null. */
export const getCourse = unstable_cache(
  async (slug: string) => findCourse(await payload(), slug),
  ['course'],
  { tags: [tags.collection('courses')] },
)

const relatedCourses = unstable_cache(
  async (course: { id: number; category: string; language?: string | null }, today: string) =>
    findRelatedCourses(await payload(), course, today),
  ['related-courses'],
  { tags: [tags.collection('courses')] },
)

/** «Подобни курсове» for a course page. */
export function getRelatedCourses(course: {
  id: number
  category: string
  language?: string | null
}) {
  return relatedCourses(
    { id: course.id, category: course.category, language: course.language },
    startOfTodayInSofia(),
  )
}

/** The contact page global with its location maps. */
export const getContact = unstable_cache(
  async () =>
    (await payload()).findGlobal({
      slug: 'contact',
      locale: 'bg',
      depth: 1,
      overrideAccess: false,
    }),
  ['contact'],
  { tags: [tags.global('contact'), tags.collection('media')] },
)

/** The published language program for a language and audience, with its related cards. */
export const getLanguageProgram = unstable_cache(
  async (language: string, audience: string) =>
    (
      await (
        await payload()
      ).find({
        collection: 'programs',
        locale: 'bg',
        depth: 2,
        where: {
          and: [
            { type: { equals: 'language' } },
            { language: { equals: language } },
            { audience: { equals: audience } },
          ],
        },
        limit: 1,
        overrideAccess: false,
      })
    ).docs[0] ?? null,
  ['language-program'],
  {
    tags: [
      tags.collection('programs'),
      tags.collection('certificates'),
      tags.collection('textbook-systems'),
    ],
  },
)

/** The published program of a type that has one page (vouchers, professions, teachers …). */
export const getProgram = unstable_cache(
  async (type: Exclude<Program['type'], 'language'>) =>
    (
      await (
        await payload()
      ).find({
        collection: 'programs',
        locale: 'bg',
        depth: 2,
        where: { type: { equals: type } },
        limit: 1,
        overrideAccess: false,
      })
    ).docs[0] ?? null,
  ['program'],
  {
    tags: [
      tags.collection('programs'),
      tags.collection('certificates'),
      tags.collection('textbook-systems'),
    ],
  },
)
