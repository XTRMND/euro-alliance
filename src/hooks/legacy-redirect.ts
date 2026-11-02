import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'
import { normalizePath } from '@/lib/redirects'

// An imported record's old address (legacyUrl, docs/content-import.md § 5) redirects to it while
// it's published: publishing writes the redirect, a new slug updates it, unpublishing or deleting
// removes it, so an old address never leads to a missing page. Used by News and Courses (a
// course also has its groups' old addresses: several old entries can be one course's groups).

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

export function legacyRedirectHooks<T extends Doc>(
  collection: 'news' | 'courses',
  urlOf: (doc: T) => string | null,
  moreUrls: (doc: T) => (string | null | undefined)[] = () => [],
) {
  const pathsOf = (doc: T) => [
    ...new Set(
      [doc.legacyUrl, ...moreUrls(doc)].map(legacyPath).filter((path): path is string => !!path),
    ),
  ]
  const afterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
    const paths = pathsOf(doc as T)
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
    for (const from of pathsOf(doc as T)) await save(req, from, null)
  }
  return { afterChange, afterDelete }
}
