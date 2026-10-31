import path from 'node:path'
import type {
  CollectionAfterChangeHook,
  CollectionBeforeDeleteHook,
  Payload,
  PayloadRequest,
} from 'payload'
import { tintImage } from '@/lib/media/duotone'
import { readUpload } from '@/lib/media/storage'
import { tintNames } from '@/lib/media/tints'
import type { Media } from '@/payload-types'

export async function deleteTints(payload: Payload, source: number, req?: PayloadRequest) {
  await payload.delete({ collection: 'media-tints', where: { source: { equals: source } }, req })
}

/** Stores the four pre-composited tints of a photo (docs/cms-schema.md § 4). */
export async function createTints(
  payload: Payload,
  doc: Media,
  original: Buffer,
  req?: PayloadRequest,
) {
  const base = path.parse(doc.filename ?? `media-${doc.id}`).name
  // Creating an upload replaces req.file; put the photo's file back afterwards.
  const file = req?.file
  for (const tint of tintNames) {
    const data = await tintImage(original, tint)
    await payload.create({
      collection: 'media-tints',
      data: { source: doc.id, tint },
      file: { data, mimetype: 'image/jpeg', name: `${base}-${tint}.jpg`, size: data.length },
      req,
    })
  }
  if (req) req.file = file
}

export const regenerateTints: CollectionAfterChangeHook<Media> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const fileChanged = Boolean(req.file)
  const kindChanged = operation === 'update' && previousDoc?.kind !== doc.kind
  if (!fileChanged && !kindChanged) return doc

  await deleteTints(req.payload, doc.id, req)
  if (doc.kind === 'photo' && doc.filename) {
    const original = req.file?.data ?? (await readUpload('media', doc.filename))
    await createTints(req.payload, doc, original, req)
  }
  return doc
}

export const removeTints: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await deleteTints(req.payload, Number(id), req)
}
