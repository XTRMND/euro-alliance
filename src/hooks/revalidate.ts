import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

// Content changes mark the cached reads in src/lib/cms.ts stale (docs/cms-schema.md § 9). Outside
// a Next.js server (seed script, tests) there is no cache to mark, so a failure is ignored.

export const tags = {
  global: (slug: string) => `global:${slug}`,
  collection: (slug: string) => `collection:${slug}`,
}

function revalidate(tag: string) {
  try {
    revalidateTag(tag, 'max')
  } catch {
    // Not running inside Next.js.
  }
}

export const revalidateGlobal: GlobalAfterChangeHook = ({ global }) => {
  revalidate(tags.global(global.slug))
}

export const revalidateCollection: CollectionAfterChangeHook & CollectionAfterDeleteHook = ({
  collection,
}) => {
  revalidate(tags.collection(collection.slug))
}

/** A course's groups (and, from PR 2, prices) are part of every course read: mark those stale. */
export const revalidateCourses: CollectionAfterChangeHook & CollectionAfterDeleteHook = () => {
  revalidate(tags.collection('courses'))
}
