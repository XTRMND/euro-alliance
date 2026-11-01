import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Payload } from 'payload'
import type { Media } from '@/payload-types'
import { company, fundingLogo, home, homePhoto, navigation, offices, partners } from './data'

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') {
    return Object.entries(value).every(([key, v]) => key === 'id' || isEmpty(v))
  }
  return false
}

/**
 * Fills in what's missing and never overwrites, so it's safe on every start: the client's edits
 * always win. Runs from onInit in production and from `pnpm seed` in development.
 */
export async function seed(payload: Payload) {
  const site = await payload.findGlobal({ slug: 'site', locale: 'bg', depth: 0 })
  const missing = Object.fromEntries(
    Object.entries(company).filter(([key]) => isEmpty(site[key as keyof typeof site])),
  )
  if (Object.keys(missing).length > 0) {
    await payload.updateGlobal({ slug: 'site', locale: 'bg', data: missing })
    payload.logger.info(`Seeded company facts: ${Object.keys(missing).join(', ')}.`)
  }

  await seedFundingLogo(payload)
  await seedHome(payload)

  const nav = await payload.findGlobal({ slug: 'navigation', locale: 'bg', depth: 0 })
  if (isEmpty(nav.header) && isEmpty(nav.menu) && isEmpty(nav.footer)) {
    await payload.updateGlobal({ slug: 'navigation', locale: 'bg', data: navigation })
    payload.logger.info('Seeded the navigation.')
  }

  for (const office of offices) {
    const { totalDocs } = await payload.count({
      collection: 'offices',
      where: { role: { equals: office.role } },
    })
    if (totalDocs === 0) {
      await payload.create({
        collection: 'offices',
        locale: 'bg',
        data: {
          ...office,
          phones: [...office.phones],
          emails: [...office.emails],
          _status: 'published',
        },
      })
      payload.logger.info(`Seeded the office «${office.name}».`)
    }
  }
}

/** Uploads the EU logo strip as a `logo` (stored as is) and links it from the footer notice. */
async function seedFundingLogo(payload: Payload) {
  const site = await payload.findGlobal({ slug: 'site', locale: 'bg', depth: 0 })
  if (site.funding?.logos) return

  const media = await uploadOnce(payload, { ...fundingLogo, kind: 'logo' })
  await payload.updateGlobal({
    slug: 'site',
    locale: 'bg',
    data: { funding: { statement: site.funding?.statement, logos: media.id } },
  })
  payload.logger.info('Seeded the EU logo strip.')
}

/**
 * The homepage copy from Figma, its classroom photo and the partner logos. Each part is filled in
 * only while it's empty, so the client's edits always win.
 */
async function seedHome(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'home', locale: 'bg', depth: 0 })
  const data: Record<string, unknown> = {}

  if (isEmpty(current.hero?.heading)) {
    const photo = await uploadOnce(payload, { ...homePhoto, kind: 'photo', altReviewed: false })
    data.hero = { ...home.hero, photo: photo.id }
  }
  for (const key of ['upcoming', 'programs', 'translations', 'news'] as const) {
    if (isEmpty(current[key]?.title)) data[key] = home[key]
  }
  if (isEmpty(current.partners?.logos)) {
    const logos = []
    for (const partner of partners) {
      const media = await uploadOnce(payload, {
        file: `src/seed/partners/${partner.file}`,
        mimetype: 'image/png',
        alt: partner.name,
        kind: 'logo',
      })
      logos.push({ name: partner.name, logo: media.id })
    }
    data.partners = { title: current.partners?.title || home.partners.title, logos }
  }

  if (Object.keys(data).length === 0) return
  await payload.updateGlobal({ slug: 'home', locale: 'bg', data })
  payload.logger.info(`Seeded the homepage: ${Object.keys(data).join(', ')}.`)
}

type SeedFile = {
  file: string
  mimetype: string
  alt: string
  kind: Media['kind']
  altReviewed?: boolean
}

/** The media document for a seed file: the one uploaded before, or a new upload. */
async function uploadOnce(payload: Payload, { file, mimetype, ...fields }: SeedFile) {
  const name = path.basename(file)
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: name } },
    depth: 0,
    limit: 1,
  })
  if (existing.docs[0]) return existing.docs[0]

  // The build copies these files next to the standalone server (scripts/prepare-standalone.mjs),
  // so the production seed finds them too.
  const data = await readFile(path.resolve(/* turbopackIgnore: true */ process.cwd(), file))
  return payload.create({
    collection: 'media',
    locale: 'bg',
    data: fields,
    file: { data, mimetype, name, size: data.length },
  })
}
