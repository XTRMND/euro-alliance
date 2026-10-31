import { readFile } from 'node:fs/promises'
import path from 'node:path'
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { uploadDirs } from '@/lib/media/storage'
import { tintNames } from '@/lib/media/tints'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
})

afterAll(() => payload.destroy())

async function image(width: number, height: number, format: 'jpeg' | 'png') {
  const data = await sharp({ create: { width, height, channels: 3, background: '#7a8899' } })
    .toFormat(format)
    .toBuffer()
  return { data, mimetype: `image/${format}`, name: `test-${width}.${format}`, size: data.length }
}

const tintsOf = async (source: number) =>
  (await payload.find({ collection: 'media-tints', where: { source: { equals: source } } })).docs

describe('media', () => {
  it('requires alt text', async () => {
    await expect(
      payload.create({
        collection: 'media',
        data: { kind: 'photo' } as never,
        file: await image(40, 30, 'jpeg'),
      }),
    ).rejects.toThrow()
  })

  it('stores four tints for every photo', async () => {
    const photo = await payload.create({
      collection: 'media',
      data: { alt: 'Test photo', kind: 'photo' },
      file: await image(3000, 2000, 'jpeg'),
    })

    const tints = await tintsOf(photo.id)

    expect(tints.map((t) => t.tint).sort()).toEqual([...tintNames].sort())
    for (const tint of tints) {
      expect([tint.mimeType, tint.width, tint.height]).toEqual(['image/jpeg', 2880, 1920])
      expect(tint.url).toMatch(/^\/api\/media-tints\/file\//)
    }
  })

  it('keeps logos byte for byte, without tints', async () => {
    const file = await image(200, 80, 'png')
    const logo = await payload.create({
      collection: 'media',
      data: { alt: 'Test logo', kind: 'logo' },
      file,
    })

    const stored = await readFile(path.join(uploadDirs.media, logo.filename!))

    expect(stored.equals(file.data)).toBe(true)
    expect(await tintsOf(logo.id)).toEqual([])
  })

  it('drops the tints when a photo becomes another kind, and adds them back', async () => {
    const media = await payload.create({
      collection: 'media',
      data: { alt: 'Test scan', kind: 'photo' },
      file: await image(60, 40, 'jpeg'),
    })

    await payload.update({ collection: 'media', id: media.id, data: { kind: 'scan' } })
    expect(await tintsOf(media.id)).toEqual([])

    await payload.update({ collection: 'media', id: media.id, data: { kind: 'photo' } })
    expect(await tintsOf(media.id)).toHaveLength(tintNames.length)
  })

  it('deletes the tints with the photo', async () => {
    const photo = await payload.create({
      collection: 'media',
      data: { alt: 'Test photo', kind: 'photo' },
      file: await image(60, 40, 'jpeg'),
    })

    await payload.delete({ collection: 'media', id: photo.id })

    expect(await tintsOf(photo.id)).toEqual([])
  })
})
