import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
  PayloadRequest,
} from 'payload'
import bg from '@/messages/bg.json'
import { legalDescription } from './legal'
import { type LexicalBody, nodeText } from './news'
import { type Audience, type Language, routes } from './routes'

// The search index's records (src/collections/SearchIndex.ts): one per published course, program
// page, news article and legal page, and one for the About page. Each has its section path («Езици ›
// Английски»), its title, an excerpt for the result and the text it's found by. Bulgarian only
// until the English site exists.

export type SearchType = 'course' | 'page' | 'news'

export type SearchRecord = {
  type: SearchType
  title: string
  path: string
  excerpt: string
  text: string
  url: string
  source: string
  sourceId?: number
  publishedAt?: string | null
}

const paths = bg.search.path
const languageNames = bg.languages as Record<Language, string>

/** Field names whose text a record is found by; ids, slugs, links and options aren't text. */
const textKeys = new Set([
  'title',
  'heading',
  'highlight',
  'kicker',
  'lead',
  'text',
  'label',
  'description',
  'name',
  'question',
  'answer',
  'caption',
  'body',
  'excerpt',
  'note',
  'quote',
  'audiences',
  'value',
])

/** Every text in a document: plain strings under the text keys, and rich text. */
export function collectText(value: unknown, key = ''): string[] {
  if (value === null || value === undefined) return []
  if (typeof value === 'string') return textKeys.has(key) && value.trim() ? [value.trim()] : []
  if (Array.isArray(value)) return value.flatMap((item) => collectText(item, key))
  if (typeof value !== 'object') return []
  const object = value as Record<string, unknown>
  if ('root' in object && typeof object.root === 'object') {
    return [nodeText((object as NonNullable<LexicalBody>).root)].filter(Boolean)
  }
  return Object.entries(object).flatMap(([k, v]) => collectText(v, k))
}

const join = (texts: string[]) => texts.join('\n').replace(/\s+\n/g, '\n').slice(0, 20000)

/** The text a page is found by besides its title: everything but the title and the hero's
    headings (they're matched as the title, and would open every snippet). */
function bodyText(doc: Record<string, unknown>): string {
  const hero = omit((doc.hero ?? {}) as Record<string, unknown>, [
    'title',
    'heading',
    'highlight',
    'kicker',
  ])
  return join(collectText({ ...omit(doc, ['title', 'slug']), hero }))
}

const omit = (object: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)))

type Doc = Record<string, unknown> & { id: number | string }

const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const programTargets: Record<string, { url: string; path: string }> = {
  vocational: { url: routes.professions(), path: paths.vocational },
  teachers: { url: routes.teachers(), path: paths.vocational },
  farmers: { url: routes.farmers(), path: paths.vocational },
  vouchers: { url: routes.vouchers(), path: paths.vouchers },
  computer: { url: routes.computerCourses(), path: paths.computer },
  translations: { url: routes.translations(), path: paths.translations },
}

/** The record for a published document of an indexed collection, or null. */
export function searchRecord(collection: string, doc: Doc): SearchRecord | null {
  const source = `${collection}:${doc.id}`
  const sourceId = typeof doc.id === 'number' ? doc.id : Number(doc.id)
  const text = bodyText(doc)
  switch (collection) {
    case 'courses': {
      if (!str(doc.slug)) return null
      return {
        type: 'course',
        title: str(doc.title),
        path: paths.courses,
        excerpt: str(doc.description),
        text,
        url: routes.course(str(doc.slug)),
        source,
        sourceId,
      }
    }
    case 'news': {
      if (!str(doc.slug)) return null
      return {
        type: 'news',
        title: str(doc.title),
        path: paths.news,
        excerpt: str(doc.excerpt) || str(doc.lead),
        text,
        url: routes.newsArticle(str(doc.slug)),
        source,
        sourceId,
        publishedAt: (doc.date as string) ?? null,
      }
    }
    case 'programs': {
      const hero = (doc.hero ?? {}) as Record<string, unknown>
      const title = str(hero.heading) || str(doc.title)
      if (doc.type === 'language') {
        const language = doc.language as Language
        const audience = doc.audience as Audience
        if (!language || !audience) return null
        return {
          type: 'page',
          // Both audiences' heroes say «Английски език»; the page's own title has the audience.
          title: str(doc.title) || title,
          path: `${paths.languages} › ${languageNames[language]}`,
          excerpt: str(hero.lead),
          text,
          url: routes.languageProgram(language, audience as never),
          source,
          sourceId,
        }
      }
      const target = programTargets[String(doc.type)]
      if (!target) return null
      return { type: 'page', title, excerpt: str(hero.lead), text, source, sourceId, ...target }
    }
    case 'legal-pages': {
      const url = doc.page === 'privacy' ? routes.privacy() : routes.cookies()
      return {
        type: 'page',
        title: str(doc.title),
        path: paths.about,
        excerpt: legalDescription((doc.sections as { body?: unknown }[]) ?? []) ?? '',
        text,
        url,
        source,
        sourceId,
      }
    }
    default:
      return null
  }
}

/** The About page's record, from its global. */
export function aboutRecord(about: Record<string, unknown>): SearchRecord | null {
  const hero = (about.hero ?? {}) as Record<string, unknown>
  if (!str(hero.title)) return null
  return {
    type: 'page',
    title: str(hero.title),
    path: paths.about,
    excerpt: str(hero.lead),
    text: bodyText(about),
    url: routes.about(),
    source: 'about',
  }
}

export const indexedCollections = ['courses', 'programs', 'news', 'legal-pages'] as const

const blank = (value: unknown) => value === null || value === undefined || value === ''

/** Whether the stored record already says this, so a rebuild writes only what changed. */
function unchanged(record: SearchRecord, stored: Record<string, unknown>) {
  return Object.entries(record).every(([key, value]) =>
    blank(value) ? blank(stored[key]) : stored[key] === value,
  )
}

/** Writes a record unless the stored one already says it; true when it wrote. */
async function write(
  payload: Payload,
  record: SearchRecord,
  existing: { id: number } | undefined,
  req?: PayloadRequest,
) {
  if (existing && unchanged(record, existing)) return false
  if (existing) await payload.update({ collection: 'search', id: existing.id, data: record, req })
  else await payload.create({ collection: 'search', data: record, req })
  return true
}

/** Writes or drops a record; in a hook, inside the hook's transaction (`req`). */
async function save(
  payload: Payload,
  source: string,
  record: SearchRecord | null,
  req?: PayloadRequest,
) {
  const { docs } = await payload.find({
    collection: 'search',
    where: { source: { equals: source } },
    limit: 1,
    depth: 0,
    req,
  })
  const existing = docs[0]
  if (record) await write(payload, record, existing, req)
  else if (existing) await payload.delete({ collection: 'search', id: existing.id, req })
}

/** The published version of a document, or null (a draft save leaves the published one live). */
async function published(req: PayloadRequest, collection: string, id: number | string) {
  const doc = await req.payload
    .findByID({
      collection: collection as (typeof indexedCollections)[number],
      id,
      depth: 0,
      locale: 'bg',
      draft: false,
      disableErrors: true,
      req,
    })
    .catch(() => null)
  return doc && (doc as { _status?: string })._status !== 'draft' ? (doc as unknown as Doc) : null
}

/** afterChange for an indexed collection: index the published version, or drop the record. */
export const indexAfterChange: CollectionAfterChangeHook = async ({ collection, doc, req }) => {
  const live =
    doc._status === 'draft' ? await published(req, collection.slug, doc.id) : (doc as Doc)
  const record = live && searchRecord(collection.slug, live)
  await save(req.payload, `${collection.slug}:${doc.id}`, record, req)
  return doc
}

export const indexAfterDelete: CollectionAfterDeleteHook = async ({ collection, id, req }) => {
  await save(req.payload, `${collection.slug}:${id}`, null, req)
}

export const indexAbout: GlobalAfterChangeHook = async ({ doc, req }) => {
  await save(req.payload, 'about', aboutRecord(doc), req)
  return doc
}

/** Rebuilds the whole index from what's published; runs on every start (derived data). */
export async function reindexSearch(payload: Payload) {
  const { docs: stored } = await payload.find({
    collection: 'search',
    depth: 0,
    pagination: false,
  })
  const bySource = new Map(stored.map((doc) => [doc.source, doc]))
  const records: SearchRecord[] = []
  for (const collection of indexedCollections) {
    const { docs } = await payload.find({
      collection,
      locale: 'bg',
      depth: 0,
      pagination: false,
      where: { _status: { equals: 'published' } },
    })
    for (const doc of docs) {
      const record = searchRecord(collection, doc as unknown as Doc)
      if (record) records.push(record)
    }
  }
  const about = await payload.findGlobal({ slug: 'about', locale: 'bg', depth: 0 })
  const record = aboutRecord(about as unknown as Record<string, unknown>)
  if (record) records.push(record)

  let written = 0
  for (const record of records)
    if (await write(payload, record, bySource.get(record.source))) written++
  const sources = new Set(records.map((record) => record.source))
  const stale = stored.filter((doc) => !sources.has(doc.source)).map((doc) => doc.id)
  if (stale.length) await payload.delete({ collection: 'search', where: { id: { in: stale } } })
  payload.logger.info(
    `Indexed ${sources.size} pages for the search (${written} written, ${stale.length} removed).`,
  )
}
