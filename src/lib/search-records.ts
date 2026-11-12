import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
} from 'payload'
import bg from '@/messages/bg.json'
import { legalDescription } from './legal'
import { type LexicalBody, nodeText } from './news'
import { type Audience, type Language, routes } from './routes'

// What the site search looks through (docs/admin-redesign.md, decision 8: no index collection):
// one record per published course, program page, news article and legal page, and one for the
// About page, built straight from the content. Each has its section path («Езици › Английски»),
// its title, an excerpt for the result and the text it's found by. Bulgarian only until the
// English site exists.

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
  /** When the content last changed, for the sitemap. */
  updatedAt?: string | null
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
  // The translation agency's languages are options of the page's language pair, not its text.
  return join(collectText({ ...omit(doc, ['title', 'slug', 'translationLanguages']), hero }))
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

export const searchedCollections = ['courses', 'programs', 'news', 'legal-pages'] as const

/**
 * Every record the search looks through: the published courses, program pages, news and legal
 * pages and the About page, read as a visitor (so drafts stay out).
 */
export async function findSearchRecords(payload: Payload): Promise<SearchRecord[]> {
  const records: SearchRecord[] = []
  for (const collection of searchedCollections) {
    const { docs } = await payload.find({
      collection,
      locale: 'bg',
      depth: 0,
      pagination: false,
      overrideAccess: false,
    })
    for (const doc of docs) {
      const record = searchRecord(collection, doc as unknown as Doc)
      if (record) records.push({ ...record, updatedAt: (doc.updatedAt as string) ?? null })
    }
  }
  const about = await payload.findGlobal({
    slug: 'about',
    locale: 'bg',
    depth: 0,
    overrideAccess: false,
  })
  const record = aboutRecord(about as unknown as Record<string, unknown>)
  if (record) records.push({ ...record, updatedAt: (about.updatedAt as string) ?? null })
  return records
}

// The records are kept for the life of the process and dropped when any searched content changes
// (the hooks below, on the searched collections and the About global). On `globalThis`, so the
// admin's routes and the site's pages share the one copy whatever bundle they're in. Content
// written from outside the process (the staging seed) shows after a restart, as with the site's
// other cached reads.
const store = globalThis as typeof globalThis & { __searchRecords?: Promise<SearchRecord[]> }

/** The search's records, read once and kept until content changes. */
export function getSearchRecords(payload: Payload): Promise<SearchRecord[]> {
  store.__searchRecords ??= findSearchRecords(payload).catch((error) => {
    store.__searchRecords = undefined
    throw error
  })
  return store.__searchRecords
}

const drop = () => {
  store.__searchRecords = undefined
}

/** afterChange and afterDelete of every searched collection, and afterChange of About. */
export const searchChanged: CollectionAfterChangeHook = ({ doc }) => {
  drop()
  return doc
}
export const searchRemoved: CollectionAfterDeleteHook = () => drop()
export const searchChangedGlobal: GlobalAfterChangeHook = ({ doc }) => {
  drop()
  return doc
}
