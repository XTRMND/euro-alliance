import { readFile } from 'node:fs/promises'
import path from 'node:path'
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { uploadDirs } from '@/lib/media/storage'
import type { Media } from '@/payload-types'
import { seed } from '@/seed'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
  await seed(payload)
})

afterAll(() => payload.destroy())

describe('seed', () => {
  it('fills in the company facts', async () => {
    const site = await payload.findGlobal({ slug: 'site', locale: 'bg' })

    expect(site.legalName).toBe('ЕВРО-АЛИАНС ООД')
    expect(site.companyId).toBe('115302753')
    expect(site.licence?.number).toBe('200312088')
    expect(site.bank?.iban).toBe('BG58 IORT 8129 1003 0255 00')
  })

  it('creates the three offices, published', async () => {
    const { docs } = await payload.find({ collection: 'offices', sort: 'id', locale: 'bg' })

    expect(docs.map((o) => [o.role, o.emails?.[0]?.email, o._status])).toEqual([
      ['courses', 'office@euro-alliance.net', 'published'],
      ['translations-plovdiv', 'prevod@euro-alliance.net', 'published'],
      ['translations-sofia', 'trans@euro-alliance.net', 'published'],
    ])
  })

  it('stores the EU logo strip byte for byte, without tints, and links it from the footer', async () => {
    const site = await payload.findGlobal({ slug: 'site', depth: 1 })
    const logos = site.funding?.logos as Media

    expect(logos.kind).toBe('logo')
    const stored = await readFile(path.join(uploadDirs.media, logos.filename!))
    const original = await readFile('public/logos/eu-pkip-logo-strip.jpg')
    expect(stored.equals(original)).toBe(true)
    expect(logos.tints?.docs ?? []).toEqual([])
  })

  it('seeds «Професионално обучение» as a group of three programmes', async () => {
    const nav = await payload.findGlobal({ slug: 'navigation', locale: 'bg' })
    const group = nav.header?.left?.find((link) => link.label === 'Професионално обучение')

    expect(group?.href ?? null).toBeNull()
    expect(group?.children?.map((link) => link.href)).toEqual([
      '/profesionalno-obuchenie/profesii',
      '/profesionalno-obuchenie/pedagogicheski-spetsialisti',
      '/profesionalno-obuchenie/zemedeltsi',
    ])
  })

  it('seeds the homepage from Figma, with the classroom photo and its tints', async () => {
    const home = await payload.findGlobal({ slug: 'home', locale: 'bg', depth: 2 })
    const photo = home.hero.photo as Media

    expect(home.hero.heading).toBe('Езиково и професионално обучение от 1999 г.')
    expect(home.hero.highlight).toBe('от 1999 г.')
    expect(photo.kind).toBe('photo')
    expect(photo.altReviewed).toBe(false)
    expect(home.hero.photoSecondary ?? null).toBeNull()
    const { docs: tints } = await payload.find({
      collection: 'media-tints',
      where: { source: { equals: photo.id } },
    })
    expect(tints.map((tint) => tint.tint).sort()).toEqual(['about', 'hero', 'homeNews', 'news'])
    expect(home.programs?.cards?.map((card) => card.destination)).toEqual([
      'languagesStudents',
      'languagesAdults',
      'certificates',
      'professions',
      'vouchers',
      'teachers',
      'farmers',
      'computerCourses',
    ])
  })

  it('seeds the partner logos byte for byte, with their names as alt text', async () => {
    const home = await payload.findGlobal({ slug: 'home', locale: 'bg', depth: 1 })
    const logos = home.partners?.logos ?? []

    expect(logos).toHaveLength(8)
    for (const { name, logo } of logos) {
      const media = logo as Media
      expect(media.kind).toBe('logo')
      expect(media.alt).toBe(name)
      const stored = await readFile(path.join(uploadDirs.media, media.filename!))
      const original = await readFile(path.join('src/seed/partners', media.filename!))
      expect(stored.equals(original)).toBe(true)
    }
  })

  it('never seeds courses or news', async () => {
    const count = async () => [
      (await payload.count({ collection: 'courses' })).totalDocs,
      (await payload.count({ collection: 'news' })).totalDocs,
    ]
    const before = await count()

    await seed(payload)

    expect(await count()).toEqual(before)
    // Figma's sample course cards are never seed data.
    const sample = await payload.count({
      collection: 'courses',
      where: { title: { equals: 'Английски език B2' } },
    })
    expect(sample.totalDocs).toBe(0)
  })

  it('never duplicates or overwrites', async () => {
    const { docs } = await payload.find({ collection: 'offices', sort: 'id', limit: 1 })
    await payload.update({ collection: 'offices', id: docs[0].id, data: { name: 'Edited' } })

    await seed(payload)

    const after = await payload.find({ collection: 'offices', sort: 'id' })
    expect(after.totalDocs).toBe(3)
    expect(after.docs[0].name).toBe('Edited')
    expect(
      (
        await payload.count({
          collection: 'media',
          where: { filename: { equals: 'classroom.jpg' } },
        })
      ).totalDocs,
    ).toBe(1)
  })
})
