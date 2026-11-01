import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Payload } from 'payload'
import type { Media } from '@/payload-types'
import { defaultRouting } from '@/lib/inquiries'
import { about, aboutDocuments, aboutPhotos, pkipProject } from './about'
import {
  company,
  contact,
  fundingLogo,
  home,
  homePhoto,
  navigation,
  offices,
  partners,
} from './data'
import { reindexSearch } from '@/lib/search-index'
import { legalBody, legalPages } from './legal'
import {
  certificates,
  englishPrograms,
  farmersLogoStrip,
  farmersProject,
  professions,
  singlePrograms,
  systemsBlock,
  teacherProgrammes,
  textbookSystems,
} from './programs'

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

  await seedContact(payload)
  await seedPrograms(payload)
  await seedAbout(payload)
  await seedLegal(payload)

  const routing = await payload.findGlobal({ slug: 'inquiry-routing', depth: 0 })
  if (isEmpty(routing.rules)) {
    await payload.updateGlobal({ slug: 'inquiry-routing', data: { rules: defaultRouting } })
    payload.logger.info('Seeded the inquiry routing.')
  }

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

  // The search index is derived from what's published, so it's rebuilt rather than filled in.
  await reindexSearch(payload)
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

/**
 * Textbook systems and certificates by name, then the English programs that use them and the
 * programs with one page each.
 */
async function seedPrograms(payload: Payload) {
  const systemIds = new Map<string, number>()
  for (const { levels, ...system } of textbookSystems) {
    const found = await payload.find({
      collection: 'textbook-systems',
      where: { name: { equals: system.name } },
      depth: 0,
      limit: 1,
      draft: true,
    })
    const doc =
      found.docs[0] ??
      (await payload.create({
        collection: 'textbook-systems',
        locale: 'bg',
        data: { ...system, levels: levels.map((level) => ({ level })), _status: 'published' },
      }))
    systemIds.set(system.name, doc.id)
  }

  const certificateIds: number[] = []
  for (const certificate of certificates) {
    const found = await payload.find({
      collection: 'certificates',
      where: { code: { equals: certificate.code } },
      depth: 0,
      limit: 1,
      draft: true,
    })
    const doc =
      found.docs[0] ??
      (await payload.create({
        collection: 'certificates',
        locale: 'bg',
        data: { ...certificate, _status: 'published' },
      }))
    certificateIds.push(doc.id)
  }

  for (const { systems, sections, ...program } of englishPrograms) {
    const { totalDocs } = await payload.count({
      collection: 'programs',
      where: {
        and: [
          { type: { equals: program.type } },
          { language: { equals: program.language } },
          { audience: { equals: program.audience } },
        ],
      },
    })
    if (totalDocs > 0) continue
    await payload.create({
      collection: 'programs',
      locale: 'bg',
      data: {
        ...program,
        sections: sections.map((section) =>
          section === 'systems'
            ? {
                ...systemsBlock(systems.map((name) => systemIds.get(name)!) as never),
                systems: systems.map((name) => systemIds.get(name)!),
              }
            : section.blockType === 'certificates'
              ? { ...section, certificates: certificateIds }
              : section,
        ),
        _status: 'published',
      } as never,
    })
    payload.logger.info(`Seeded the program «${program.title}».`)
  }

  // The ЦПО list, in order, while it's empty (the client's edits always win).
  if ((await payload.count({ collection: 'professions' })).totalDocs === 0) {
    for (const profession of professions) {
      await payload.create({
        collection: 'professions',
        locale: 'bg',
        data: { ...profession, _status: 'published' },
      })
    }
    payload.logger.info(`Seeded ${professions.length} professions.`)
  }

  // The programmes for pedagogical specialists, in order, while there are none.
  if ((await payload.count({ collection: 'teacher-programmes' })).totalDocs === 0) {
    for (const programme of teacherProgrammes) {
      await payload.create({
        collection: 'teacher-programmes',
        locale: 'bg',
        data: { ...programme, _status: 'published' },
      })
    }
    payload.logger.info(`Seeded ${teacherProgrammes.length} programmes for teachers.`)
  }

  // The farmers' funded project and its EU logo strip (uploaded as is), by title.
  const found = await payload.find({
    collection: 'funded-projects',
    where: { title: { equals: farmersProject.title } },
    depth: 0,
    limit: 1,
    draft: true,
  })
  const project =
    found.docs[0] ??
    (await payload.create({
      collection: 'funded-projects',
      locale: 'bg',
      data: {
        ...farmersProject,
        logoStrip: (await uploadOnce(payload, { ...farmersLogoStrip, kind: 'logo' })).id,
        _status: 'published',
      },
    }))

  for (const program of singlePrograms) {
    const { totalDocs } = await payload.count({
      collection: 'programs',
      where: { type: { equals: program.type } },
    })
    if (totalDocs > 0) continue
    await payload.create({
      collection: 'programs',
      locale: 'bg',
      data: {
        ...program,
        sections: program.sections.map((section) =>
          section.blockType === 'projects' ? { ...section, projects: [project.id] } : section,
        ),
        _status: 'published',
      } as never,
    })
    payload.logger.info(`Seeded the program «${program.title}».`)
  }
}

/**
 * The About page: its copy, photos, the client's documents and both funded projects, while the
 * page is empty. Documents and projects are found by title first, so nothing is duplicated.
 */
async function seedAbout(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'about', locale: 'bg', depth: 0 })
  if (!isEmpty(current.hero?.title)) return

  const documentIds: number[] = []
  for (const { scan, ...document } of aboutDocuments) {
    const found = await payload.find({
      collection: 'documents',
      where: { title: { equals: document.title } },
      depth: 0,
      limit: 1,
      draft: true,
    })
    const doc =
      found.docs[0] ??
      (await payload.create({
        collection: 'documents',
        locale: 'bg',
        data: { ...document, scan: (await uploadOnce(payload, scan)).id, _status: 'published' },
      }))
    documentIds.push(doc.id)
  }

  const projectIds: number[] = []
  for (const title of [farmersProject.title, pkipProject.title]) {
    const found = await payload.find({
      collection: 'funded-projects',
      where: { title: { equals: title } },
      depth: 0,
      limit: 1,
      draft: true,
    })
    const project =
      found.docs[0] ??
      (title === pkipProject.title
        ? await payload.create({
            collection: 'funded-projects',
            locale: 'bg',
            data: {
              ...pkipProject,
              logoStrip: (await uploadOnce(payload, { ...fundingLogo, kind: 'logo' })).id,
              _status: 'published',
            },
          })
        : null)
    if (project) projectIds.push(project.id)
  }

  const photos = []
  for (const [i, file] of [
    aboutPhotos.barcelona,
    aboutPhotos.internships,
    aboutPhotos.graz,
  ].entries()) {
    photos.push({
      photo: (await uploadOnce(payload, file)).id,
      caption: about.statement.captions[i],
    })
  }

  await payload.updateGlobal({
    slug: 'about',
    locale: 'bg',
    data: {
      ...about,
      hero: { ...about.hero, photo: (await uploadOnce(payload, aboutPhotos.hero)).id },
      statement: {
        before: about.statement.before,
        highlight: about.statement.highlight,
        after: about.statement.after,
        audiences: about.statement.audiences,
        note: about.statement.note,
        photos,
      },
      licences: { ...about.licences, documents: documentIds.slice(0, 4) },
      documents: { ...about.documents, samples: documentIds.slice(4) },
      projects: { ...about.projects, projects: projectIds },
    } as never,
  })
  payload.logger.info('Seeded the About page.')
}

/** The contact page's copy and location cards, with their map snapshots. */
async function seedContact(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'contact', locale: 'bg', depth: 0 })
  const data: Record<string, unknown> = {}
  if (isEmpty(current.hero?.title)) data.hero = contact.hero
  if (isEmpty(current.locations)) {
    const locations = []
    for (const { map, ...location } of contact.locations) {
      const media = await uploadOnce(payload, { ...map, mimetype: 'image/png', kind: 'art' })
      locations.push({ ...location, map: media.id })
    }
    data.locations = locations
  }
  if (Object.keys(data).length === 0) return
  await payload.updateGlobal({ slug: 'contact', locale: 'bg', data })
  payload.logger.info(`Seeded the contact page: ${Object.keys(data).join(', ')}.`)
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

/** The privacy and cookie policies, each when its page has no document yet. */
async function seedLegal(payload: Payload) {
  for (const { sections, ...page } of legalPages) {
    const { totalDocs } = await payload.count({
      collection: 'legal-pages',
      where: { page: { equals: page.page } },
    })
    if (totalDocs > 0) continue
    await payload.create({
      collection: 'legal-pages',
      locale: 'bg',
      data: {
        ...page,
        sections: sections.map(({ body, ...section }) => ({ ...section, body: legalBody(body) })),
        _status: 'published',
      },
    })
    payload.logger.info(`Seeded the legal page «${page.title}».`)
  }
}
