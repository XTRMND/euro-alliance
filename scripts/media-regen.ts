// `pnpm media:regen`: rebuilds every photo's tints, e.g. after a change in src/lib/media/tints.ts.
import config from '@payload-config'
import { getPayload } from 'payload'
import { createTints, deleteTints } from '@/hooks/tints'
import { readUpload } from '@/lib/media/storage'

const payload = await getPayload({ config })

let count = 0
for (let page = 1, hasNextPage = true; hasNextPage; page++) {
  const result = await payload.find({
    collection: 'media',
    where: { kind: { equals: 'photo' } },
    depth: 0,
    limit: 50,
    page,
  })
  for (const doc of result.docs) {
    if (!doc.filename) continue
    await deleteTints(payload, doc.id)
    await createTints(payload, doc, await readUpload('media', doc.filename))
    count++
  }
  hasNextPage = result.hasNextPage
}

payload.logger.info(`Regenerated the tints of ${count} photos.`)
process.exit(0)
