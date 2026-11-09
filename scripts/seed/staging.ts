// `pnpm seed:staging` (docs/seeding.md): fills the staging database from the fixtures in seed/
// through Payload's Local API, so the upload hooks make the photo tints. Safe to run again: every
// record is matched on a natural key (legacyUrl, slug, code, filename) and updated only when the
// fixture differs; nothing is duplicated. Admin users aren't touched.
//   1. The base seed (src/seed): company facts, offices, programme pages, the ЦПО and teachers'
//      lists, funded projects, documents and licence scans, the privacy and cookie policies (the
//      approved Figma texts). Fill-in only, as on every start: what's there stays.
//   2. The old site (seed/, from `pnpm seed:scrape`): the news with their documents and the seven
//      covers from Figma, the approved courses and their groups, the language pages and the
//      translation languages. Published (the client approved all content, 02.11.2026).
// Prints the counts per collection and the missing-fields report at the end.
//   SEED_TARGET=staging pnpm seed:staging --dry-run   what it would write; writes nothing
//   SEED_TARGET=staging pnpm seed:staging             writes
import { readFile } from 'node:fs/promises'
import config from '@payload-config'
import { getPayload, type Payload, type Where } from 'payload'
import { type Destination, destinations } from '@/lib/destinations'
import { routes } from '@/lib/routes'
import { reindexSearch } from '@/lib/search-index'
import { seed } from '@/seed'
import { professions as seededProfessions, richText, teacherProgrammes } from '@/seed/programs'
import { recording, Tally } from '@/seed/tally'
import {
  type Fixtures,
  type LanguagePageFixture,
  mediaLinkPattern,
  readFixtures,
  seedMediaDir,
} from './fixtures'
import { isEmpty, same } from './compare'

// ── Guards ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const unknown = args.filter((arg) => arg !== '--dry-run')
const refuse = (reason: string) => {
  console.error(`seed:staging refused: ${reason}`)
  process.exit(1)
}
if (unknown.length) refuse(`unknown argument ${unknown.join(' ')} (only --dry-run).`)
if (process.env.SEED_TARGET !== 'staging')
  refuse('set SEED_TARGET=staging. This seed is for the staging database only.')
if (process.env.ALLOW_INDEXING === 'true')
  refuse('ALLOW_INDEXING=true marks production. This seed is for staging only.')
// In production the app seeds itself when Payload starts (onInit), outside the dry run's guard.
if (process.env.NODE_ENV === 'production') refuse('unset NODE_ENV (it is "production").')
if (!process.env.DATABASE_URL) refuse('DATABASE_URL is not set.')

const target = new URL(process.env.DATABASE_URL!)
console.log(
  `seed:staging${dryRun ? ' --dry-run (nothing is written)' : ''}: database ${target.hostname}:${target.port || 5432}${target.pathname}, media in ${process.env.MEDIA_DIR ?? './media'}`,
)

const fixtures = await readFixtures()
console.log(
  `Fixtures scraped ${fixtures.manifest.scrapedAt.slice(0, 10)} from ${fixtures.manifest.origin} (crawl of ${fixtures.manifest.crawledAt.slice(0, 10)}).`,
)

const tally = new Tally(dryRun)
const payload = recording(await getPayload({ config }), tally)
const report = {
  live: [] as string[],
  covers: [] as string[],
  courses: [] as string[],
  pages: [] as string[],
  translation: [] as string[],
}

// ── Helpers ─────────────────────────────────────────────────────────────────
type Doc = Record<string, unknown> & { id: number }

type Collection = Parameters<Payload['find']>[0]['collection']

type Data = Record<string, unknown>

/**
 * Creates the record, or updates it when a field differs, or leaves it (skipped). `where` is the
 * natural key; `data` may depend on the stored record. Returns the record (in a dry run, what it
 * would be).
 */
async function upsert(collection: Collection, where: Where, values: Data | ((doc?: Doc) => Data)) {
  const found = await payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
    draft: true,
    locale: 'bg',
  })
  const doc = found.docs[0] as unknown as Doc | undefined
  const data = typeof values === 'function' ? values(doc) : values
  if (!doc)
    return (await payload.create({ collection, locale: 'bg', data } as never)) as unknown as Doc
  const changed = Object.keys(data).filter((key) => !same(data[key], doc[key]))
  if (!changed.length) {
    tally.add(collection, 'skipped')
    return doc
  }
  tally.detail = changed.join(', ')
  return (await payload.update({
    collection,
    id: doc.id,
    locale: 'bg',
    data,
  } as never)) as unknown as Doc
}

/** A file in media, matched by its filename: uploaded once. */
async function uploadFile(
  file: { path: URL; name: string; mimetype: string },
  fields: Record<string, unknown>,
): Promise<Doc> {
  const found = await payload.find({
    collection: 'media',
    where: { filename: { equals: file.name } },
    limit: 1,
    depth: 0,
  })
  if (found.docs[0]) {
    tally.add('media', 'skipped')
    return found.docs[0] as unknown as Doc
  }
  const data = await readFile(file.path)
  return (await payload.create({
    collection: 'media',
    locale: 'bg',
    data: fields as never,
    file: { data, mimetype: file.mimetype, name: file.name, size: data.length },
  })) as unknown as Doc
}

/** Replaces links to seed/media/ files in a Lexical tree with the uploaded files' addresses. */
function resolveLinks(node: unknown, urls: Map<string, string>): unknown {
  if (Array.isArray(node)) return node.map((child) => resolveLinks(child, urls))
  if (!node || typeof node !== 'object') return node
  const out = Object.fromEntries(
    Object.entries(node).map(([key, value]) => [key, resolveLinks(value, urls)]),
  ) as Doc
  const fields = out.fields as { url?: string } | undefined
  const match = out.type === 'link' && fields?.url?.match(mediaLinkPattern)
  if (match) out.fields = { ...fields, url: urls.get(match[1]) ?? fields!.url }
  return out
}

// ── 1. The base seed ────────────────────────────────────────────────────────
console.log('1/7 The base seed (fills in what is missing)…')
await seed(payload)

// ── 2. The ЦПО and teachers' lists against the old site ─────────────────────
// The lists come from the approved Figma copy (the base seed); the old site's lists are checked
// against them by code. A code only the old site has is added; wording that differs is reported,
// not overwritten (Figma's copy is approved, and the client's edits win).
console.log("2/7 The ЦПО and teachers' lists against the old site…")
{
  const stored = await payload.find({
    collection: 'professions',
    depth: 0,
    pagination: false,
    draft: true,
  })
  // In a dry run on an empty database the base seed's list stands in for what it would create.
  const current = stored.docs.length ? stored.docs : seededProfessions
  const direction = new Map(current.map((p) => [p.directionCode, p.directionName]))
  for (const live of fixtures.professions) {
    const have = current.find((p) => p.code === live.code)
    if (!have) {
      if (!direction.has(live.directionCode)) {
        report.live.push(
          `ЦПО: «${live.name}» (${live.code}) is on the old site in a direction the CMS doesn't have (${live.directionCode}); not added.`,
        )
        continue
      }
      await payload.create({
        collection: 'professions',
        locale: 'bg',
        data: {
          ...live,
          directionName: direction.get(live.directionCode)!,
          _status: 'published',
        },
      })
      report.live.push(`ЦПО: «${live.name}» (${live.code}) added from the old site.`)
      continue
    }
    if (have.name !== live.name)
      report.live.push(
        `ЦПО ${live.code}: the CMS says «${have.name}», the old site «${live.name}»; kept.`,
      )
    if ([...have.degrees].sort().join() !== [...live.degrees].sort().join())
      report.live.push(
        `ЦПО ${live.code}: degrees ${have.degrees.join(', ')} in the CMS, ${live.degrees.join(', ')} on the old site; kept.`,
      )
  }
  for (const have of current)
    if (!fixtures.professions.some((live) => live.code === have.code))
      report.live.push(`ЦПО ${have.code} «${have.name}» isn't on the old site any more; kept.`)

  const storedProgrammes = await payload.find({
    collection: 'teacher-programmes',
    depth: 0,
    pagination: false,
    draft: true,
  })
  const programmes = storedProgrammes.docs.length ? storedProgrammes.docs : teacherProgrammes
  let wording = 0
  for (const live of fixtures.teacherProgrammes) {
    const have = programmes.find((p) => p.number === live.number)
    if (!have) {
      // Its theme (the page's grouping) isn't on the old site, and isn't made up.
      report.live.push(
        `Teachers: programme ${live.code} «${live.title}» is on the old site, not in the CMS; not added (it needs a theme).`,
      )
      continue
    }
    if (have.title !== live.title) wording++
  }
  if (wording)
    report.live.push(
      `Teachers: ${wording} of ${fixtures.teacherProgrammes.length} programme titles are Figma's shorter wording of the old site's (codes 38010001–38010029 match); Figma's kept.`,
    )
}

// ── 3. Documents linked from the news ───────────────────────────────────────
console.log('3/7 Documents linked from the news…')
const documentUrls = new Map<string, string>()
for (const document of fixtures.documents) {
  const doc = await uploadFile(
    {
      path: new URL(document.filename, seedMediaDir),
      name: document.filename,
      mimetype: document.mimetype,
    },
    { alt: document.alt, kind: 'scan', altReviewed: false },
  )
  documentUrls.set(document.filename, String(doc.url ?? `/api/media/file/${document.filename}`))
}

// ── 4. News, with the covers from Figma ─────────────────────────────────────
console.log(`4/7 News (${fixtures.news.length}) with the covers from Figma…`)
const figmaCovers = new Map<number, number>()
for (const cover of fixtures.covers) {
  const media = await uploadFile(
    {
      path: new URL(`../../${cover.file}`, import.meta.url),
      name: `figma-news-${cover.legacyId}.jpg`,
      mimetype: 'image/jpeg',
    },
    // The alt texts are drafts (figma-covers.json), for an editor to review.
    { alt: cover.alt, kind: 'photo', textInImage: cover.textInImage, altReviewed: false },
  )
  figmaCovers.set(cover.legacyId, media.id)
  if (!fixtures.news.some((article) => article.legacyId === cover.legacyId))
    report.covers.push(`No article /News/${cover.legacyId} for its Figma cover.`)
}
let covered = 0
for (const article of fixtures.news) {
  if (!article.date) continue // The date is required, and never made up: in the report.
  const figma = figmaCovers.get(article.legacyId)
  await upsert(
    'news',
    { or: [{ legacyUrl: { equals: article.legacyUrl } }, { slug: { equals: article.slug } }] },
    (doc) => {
      // A cover chosen since stays; Figma's goes only where there's none.
      const current = doc?.cover
      if (current) covered++
      else if (figma) covered++
      if (current && figma && current !== figma)
        report.covers.push(`«${article.title}» keeps the cover chosen since, not Figma's.`)
      return {
        title: article.title,
        slug: article.slug,
        date: article.date,
        excerpt: article.excerpt,
        body: resolveLinks(article.body, documentUrls),
        ...(figma && !current ? { cover: figma } : {}),
        legacyId: article.legacyId,
        legacyUrl: article.legacyUrl,
        _status: 'published',
      }
    },
  )
}

// ── 5. Courses ──────────────────────────────────────────────────────────────
console.log(`5/7 Courses (${fixtures.courses.length})…`)
{
  const offices = await payload.find({ collection: 'offices', depth: 0, pagination: false })
  const coursesOffice = offices.docs.find((office) => office.role === 'courses')?.id
  for (const course of fixtures.courses) {
    const matches = await payload.find({
      collection: 'courses',
      where: {
        or: [
          { slug: { equals: course.slug } },
          ...(course.legacyUrls.length ? [{ legacyUrl: { in: course.legacyUrls } }] : []),
        ],
      },
      pagination: false,
      depth: 0,
      draft: true,
    })
    // An earlier import made a course of each old dated entry; the approved course takes them in
    // as groups, so those go (their old addresses come to this course).
    const keep = matches.docs.find((doc) => doc.slug === course.slug) ?? matches.docs[0]
    for (const doc of matches.docs.filter((doc) => doc.id !== keep?.id)) {
      await payload.delete({ collection: 'courses', id: doc.id })
      report.courses.push(`«${doc.title}» became a group of «${course.title}».`)
    }
    await upsert(
      'courses',
      keep ? { id: { equals: keep.id } } : { slug: { equals: course.slug } },
      {
        ...course.data,
        slug: course.slug,
        groups: course.groups.map(({ office, ...group }) => ({
          ...group,
          ...(office === 'courses' && coursesOffice ? { office: coursesOffice } : {}),
        })),
        legacyUrl: null,
        _status: 'published',
      },
    )
  }
}

// ── 6. Language pages ───────────────────────────────────────────────────────
// One per language and audience on the English template (the user, 02.11.2026). Pages from the
// approved Figma copy (English, Bulgarian: no old address) stay as they are.
console.log(`6/7 Language pages (${fixtures.languagePages.length})…`)

// A textbook system or certificate is one record that several pages share, so it's written
// once, with the last page's values (as the import always did); pages that word it differently
// are reported.
const shared = {
  'textbook-systems': new Map<string, Data>(),
  certificates: new Map<string, Data>(),
}
for (const page of fixtures.languagePages) {
  const entries = [
    ...(page.systems ?? []).map(({ levels, strip, ...system }) => ({
      collection: 'textbook-systems' as const,
      data: { ...system, levels: levels.map((level) => ({ level })), ...(strip ? { strip } : {}) },
    })),
    ...(page.certificates ?? []).map((certificate) => ({
      collection: 'certificates' as const,
      data: certificate as Data,
    })),
  ]
  for (const { collection, data } of entries) {
    const name = String(data.name)
    const before = shared[collection].get(name)
    if (before && !same(data, before))
      report.pages.push(
        `«${name}» is worded differently on ${page.language} ${page.audience}; one record, its values: ${JSON.stringify(
          Object.fromEntries(
            Object.entries(data).filter(([key, value]) => !same(value, before[key])),
          ),
        )}.`,
      )
    shared[collection].set(name, data)
  }
}
const sharedIds = new Map<string, number>()
for (const [collection, records] of Object.entries(shared))
  for (const [name, data] of records) {
    const doc = await upsert(
      collection as Collection,
      { name: { equals: name } },
      {
        ...data,
        _status: 'published',
      },
    )
    sharedIds.set(`${collection}:${name}`, doc.id)
  }

function languagePageData(page: LanguagePageFixture) {
  const systems = (page.systems ?? []).map(({ name }) => sharedIds.get(`textbook-systems:${name}`)!)
  const certificates = (page.certificates ?? []).map(({ name }) =>
    sharedIds.get(`certificates:${name}`)!,
  )
  const sections = [
    page.features?.length && {
      blockType: 'features',
      heading: 'Как можете да учите',
      items: page.features,
    },
    systems.length && {
      blockType: 'textbookSystems',
      heading: page.systemsBlock?.heading ?? 'Учебни системи и нива',
      lead: page.systemsBlock?.lead,
      systems,
      ...(page.systemsBlock?.linkLabel
        ? { link: { label: page.systemsBlock.linkLabel, destination: 'levelTest' } }
        : {}),
      columns: 'two',
    },
    certificates.length && {
      blockType: 'certificates',
      heading: page.certificatesBlock?.heading ?? 'Сертификати',
      lead: page.certificatesBlock?.lead,
      certificates,
    },
    page.faq?.length && {
      blockType: 'faq',
      heading: 'Често задавани въпроси',
      items: page.faq.map(({ question, answer }) => ({
        question,
        answer: richText(
          answer.map((part) =>
            typeof part === 'string'
              ? part
              : { text: part.text, url: destinations[part.destination as Destination].href },
          ),
        ),
      })),
    },
  ].filter(Boolean)
  return {
    title: `${page.hero.heading} за ${page.audience === 'adults' ? 'възрастни' : 'ученици'}`,
    type: 'language',
    language: page.language,
    audience: page.audience,
    hero: {
      heading: page.hero.heading,
      highlight: page.hero.highlight,
      lead: page.hero.lead,
      ctas: [
        { label: 'Виж предстоящите курсове', destination: 'languageCourses' },
        { label: 'Направи входния тест', destination: 'levelTest' },
      ],
    },
    upcoming: {
      heading: page.coursesHeading,
      linkLabel: `Всички к${page.coursesHeading.slice(1)}`,
    },
    sections,
    legacyUrl: page.oldUrl,
    _status: 'published',
  }
}

for (const page of fixtures.languagePages) {
  const key: Where = {
    and: [
      { type: { equals: 'language' } },
      { language: { equals: page.language } },
      { audience: { equals: page.audience } },
    ],
  }
  const existing = await payload.find({
    collection: 'programs',
    where: key,
    limit: 1,
    depth: 0,
    draft: true,
  })
  if (existing.docs[0] && !existing.docs[0].legacyUrl) {
    tally.add('programs', 'skipped')
    report.pages.push(`${page.language} ${page.audience}: the page from Figma stays.`)
    continue
  }
  await upsert('programs', key, languagePageData(page))
  if (page.hidden.length)
    report.pages.push(
      `${routes.languageProgram(page.language, page.audience as 'students')}: no content for ${page.hidden.join(', ')} (hidden).`,
    )
}

// ── 7. Translation languages ────────────────────────────────────────────────
// Only into an empty list, so the client's own edits stay.
console.log('7/7 Translation languages…')
{
  const translation = await payload.findGlobal({ slug: 'translation', depth: 0 })
  const names = fixtures.translation.languages
  const have = (translation.languages ?? []).map((language) => language.name)
  if (!have.length && names.length)
    await payload.updateGlobal({
      slug: 'translation',
      locale: 'bg',
      data: { languages: names.map((name) => ({ name })) } as never,
    })
  else {
    tally.add('global:translation', 'skipped')
    if (have.join() !== names.join())
      report.translation.push(
        `The CMS lists ${have.join(', ')}; the old site ${names.join(', ')}. The CMS's list stays.`,
      )
  }
}

await reindexSearch(payload)

// ── Counts ──────────────────────────────────────────────────────────────────
const rows = [...tally.counts].sort(([a], [b]) => a.localeCompare(b))
const width = Math.max(...rows.map(([name]) => name.length), 10)
const pad = (value: string | number, n = 9) => String(value).padStart(n)
console.log(`\n${dryRun ? 'Would write' : 'Written'} (${tally.planned.length}):`)
for (const line of tally.planned) console.log(`  ${line}`)
console.log(`\nCounts${dryRun ? ' (dry run: nothing was written)' : ''}:`)
console.log(
  `  ${'collection'.padEnd(width)} ${pad('created')} ${pad('updated')} ${pad('skipped')}${rows.some(([, c]) => c.deleted) ? pad('deleted') : ''}`,
)
for (const [name, c] of rows)
  console.log(
    `  ${name.padEnd(width)} ${pad(c.created)} ${pad(c.updated)} ${pad(c.skipped)}${rows.some(([, r]) => r.deleted) ? pad(c.deleted) : ''}`,
  )

// ── Missing fields ──────────────────────────────────────────────────────────
// What the sources don't give: left empty (hidden on the site) and listed for the client.
const notes = fixtures.notes
const lines: string[] = []
const section = (title: string, items: string[], empty = 'none') => {
  lines.push(`\n${title} (${items.length})${items.length ? ':' : `: ${empty}`}`)
  for (const item of items) lines.push(`  - ${item}`)
}

const free = (course: Fixtures['courses'][number]) => Boolean(course.data.free)
section('Courses without a level bubble (the old site gives none)', notes.noLevel)
section(
  'Courses without a date (shown as «Няма насрочена дата»)',
  fixtures.courses.filter((course) => !course.groups.length).map((course) => course.title),
)
section(
  'Groups without a price (shown as «Попитайте»)',
  fixtures.courses.flatMap((course) =>
    free(course)
      ? []
      : course.groups
          .filter((group) => isEmpty(group.price))
          .map((group) => `${course.title}${group.label ? `, ${group.label}` : ''}`),
  ),
)
section('Group end dates estimated (the old site gives none)', notes.ends)
section('Prices as written and as imported', notes.prices)
section(
  'News without a cover (the no-image state)',
  covered === fixtures.news.length
    ? []
    : [
        `${fixtures.news.length - covered} of ${fixtures.news.length}: Figma has covers for ${covered}`,
      ],
)
section('News without a date (not imported: the date is required)', notes.newsWithoutDate)
section('News with images inside the text (left out: no design for them)', notes.newsTextImages)
section(
  'Documents the old site no longer serves (their links were removed)',
  notes.documentsMissing,
)
section(
  "Documents with personal data, not in the repository (their links were removed; the client's call whether they go back)",
  notes.documentsWithheld,
)

const programmes = await payload.find({
  collection: 'teacher-programmes',
  depth: 0,
  pagination: false,
  draft: true,
})
const programmeRows = programmes.docs.length ? programmes.docs : teacherProgrammes
const withoutHours = programmeRows.filter(
  (p) => !('hours' in p && p.hours) || !('credits' in p && p.credits),
)
section(
  "Teachers' programmes without hours or credits",
  withoutHours.length === programmeRows.length
    ? [`all ${programmeRows.length}: neither Figma nor the old site gives them per programme`]
    : withoutHours.map((p) => `${p.number} ${p.title}`),
)
const legal = await payload.find({ collection: 'legal-pages', depth: 0, draft: true })
section(
  'Policies without «Последна актуализация»',
  legal.docs.length
    ? legal.docs.filter((doc) => !doc.updatedOn).map((doc) => doc.title)
    : ['privacy, cookies (the base seed leaves the date empty)'],
)
const drafts = await payload.count({
  collection: 'media',
  where: { altReviewed: { equals: false } },
})
section(
  'Media with alt text to review («Алт текстът е проверен» off)',
  drafts.totalDocs ? [`${drafts.totalDocs} files`] : [],
)
section('Old site vs the CMS (ЦПО and teachers)', report.live)
section('Covers', report.covers)
section('Courses merged', report.courses)
section('Language pages', report.pages)
section('Translation languages', report.translation)
section('Old dated entries not in the approved list (not imported)', notes.unlistedEntries)
section('Approved groups whose old entry is gone', notes.missingEntries)
section('Old pages that had photos (none imported: ask the client)', notes.pagesWithPhotos)

console.log(`\nMissing or estimated: left empty, never made up; ask the client.${lines.join('\n')}`)
process.exit(0)
