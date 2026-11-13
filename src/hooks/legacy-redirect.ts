import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'
import { normalizePath } from '@/lib/redirects'
import { routes } from '@/lib/routes'

// An imported record's old address (legacyUrl, docs/content-import.md § 5) redirects to it while
// it's published: publishing writes the redirect, a new slug updates it, unpublishing or deleting
// removes it, so an old address never leads to a missing page. Used by News and Courses; a
// group's old address (several old entries can be one course's groups) redirects to its course,
// written when the group or its course changes.

type Doc = { id: number | string; _status?: string | null; legacyUrl?: string | null }

/** The old address as the redirects collection stores it, or null. */
export function legacyPath(legacyUrl: string | null | undefined): string | null {
  if (!legacyUrl) return null
  try {
    return normalizePath(new URL(legacyUrl, 'https://euro-alliance.net').pathname)
  } catch {
    return null
  }
}

async function save(req: PayloadRequest, from: string, to: string | null) {
  const { docs } = await req.payload.find({
    collection: 'redirects',
    where: { from: { equals: from } },
    limit: 1,
    depth: 0,
    req,
  })
  const existing = docs[0]
  if (!to) {
    if (existing?.source === 'import') {
      await req.payload.delete({ collection: 'redirects', id: existing.id, req })
    }
    return
  }
  if (existing?.to === to) return
  if (existing) {
    await req.payload.update({ collection: 'redirects', id: existing.id, data: { to }, req })
  } else {
    await req.payload.create({ collection: 'redirects', data: { from, to, source: 'import' }, req })
  }
}

type MoreUrls<T> = (
  doc: T,
  req: PayloadRequest,
) => (string | null | undefined)[] | Promise<(string | null | undefined)[]>

export function legacyRedirectHooks<T extends Doc>(
  collection: 'news' | 'courses',
  urlOf: (doc: T) => string | null,
  moreUrls: MoreUrls<T> = () => [],
) {
  const pathsOf = async (doc: T, req: PayloadRequest) => [
    ...new Set(
      [doc.legacyUrl, ...(await moreUrls(doc, req))]
        .map(legacyPath)
        .filter((path): path is string => !!path),
    ),
  ]
  const afterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
    const paths = await pathsOf(doc as T, req)
    if (!paths.length) return doc
    // A draft save leaves the published version live: redirect to that one.
    const live =
      (doc as T)._status === 'published'
        ? (doc as T)
        : ((await req.payload
            .findByID({ collection, id: doc.id, draft: false, depth: 0, req, disableErrors: true })
            .catch(() => null)) as T | null)
    const to = live && live._status === 'published' ? urlOf(live) : null
    for (const from of paths) await save(req, from, to)
    return doc
  }
  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    for (const from of await pathsOf(doc as T, req)) await save(req, from, null)
  }
  return { afterChange, afterDelete }
}

/** The old addresses of a course's groups. */
export async function groupLegacyUrls(courseId: number | string, req: PayloadRequest) {
  const { docs } = await req.payload.find({
    collection: 'groups',
    where: { course: { equals: courseId } },
    select: { legacyUrl: true },
    pagination: false,
    depth: 0,
    req,
  })
  return docs.map((group) => group.legacyUrl)
}

type GroupDoc = { id: number; legacyUrl?: string | null; course?: number | { id: number } | null }

/** A group's old address redirects to its course's page while the course is published. */
export const legacyGroupRedirect = {
  afterChange: (async ({ doc, req }) => {
    const from = legacyPath((doc as GroupDoc).legacyUrl)
    const courseId = (doc as GroupDoc).course
    if (!from || !courseId) return doc
    const course = await req.payload
      .findByID({
        collection: 'courses',
        id: typeof courseId === 'object' ? courseId.id : courseId,
        draft: false,
        depth: 0,
        req,
        disableErrors: true,
      })
      .catch(() => null)
    await save(
      req,
      from,
      course && course._status === 'published' && course.slug ? routes.course(course.slug) : null,
    )
    return doc
  }) satisfies CollectionAfterChangeHook,
  afterDelete: (async ({ doc, req }) => {
    const from = legacyPath((doc as GroupDoc).legacyUrl)
    if (from) await save(req, from, null)
  }) satisfies CollectionAfterDeleteHook,
}
