import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { tags } from '@/hooks/revalidate'

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
