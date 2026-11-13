import { routes } from './routes'

// The live preview (docs/admin-redesign.md, decision 11): the admin's preview frame shows the
// page itself, at its own address with `?preview=`, rendered from what's in the form. This file
// is the address side, without Payload or Next: which documents have a preview, where it is, and
// how the marker in the address is read. The server side is src/lib/preview-request.ts.

export const previewKinds = ['courses', 'programs', 'news', 'home', 'about', 'contact'] as const
export type PreviewKind = (typeof previewKinds)[number]

export const isPreviewKind = (value: unknown): value is PreviewKind =>
  previewKinds.includes(value as PreviewKind)

/** The request header the proxy sets from the address, for the readers (never trusted alone). */
export const previewHeader = 'x-ea-preview'

export type PreviewTarget = {
  kind: PreviewKind
  /** A collection's document; the globals have none. */
  id?: string
  locale: 'bg' | 'en'
  /** The frame's token, once it has sent unsaved data. */
  live?: string
}

const isCollection = (kind: PreviewKind) =>
  kind === 'courses' || kind === 'programs' || kind === 'news'

/** `?preview=courses.25&locale=bg&live=…`, as the proxy passes it on. */
export function previewQuery({ kind, id, locale, live }: PreviewTarget): string {
  const query = new URLSearchParams({ preview: id ? `${kind}.${id}` : kind, locale })
  if (live) query.set('live', live)
  return query.toString()
}

/** The target named by an address's query, or undefined when it isn't a well-formed preview. */
export function previewTarget(query: URLSearchParams): PreviewTarget | undefined {
  const [kind, id, ...rest] = (query.get('preview') ?? '').split('.')
  if (!isPreviewKind(kind) || rest.length) return undefined
  if (isCollection(kind) ? !id || !/^\d+$/.test(id) : id !== undefined) return undefined
  const live = query.get('live') ?? undefined
  if (live !== undefined && !/^[\w-]{8,64}$/.test(live)) return undefined
  return { kind, id, locale: query.get('locale') === 'en' ? 'en' : 'bg', live }
}

type PreviewedDoc = {
  id?: number | string | null
  slug?: string | null
  type?: string | null
  language?: string | null
  audience?: string | null
}

/** The page a document is shown on, whether or not it's published yet; undefined if it has none. */
function pageOf(kind: PreviewKind, doc: PreviewedDoc): string | undefined {
  switch (kind) {
    case 'home':
      return routes.home()
    case 'about':
      return routes.about()
    case 'contact':
      return routes.contact()
    // A document without a slug yet is still shown: the page is read by the marker, not the slug.
    case 'courses':
      return routes.course(doc.slug || 'preview')
    case 'news':
      return routes.newsArticle(doc.slug || 'preview')
    case 'programs':
      switch (doc.type) {
        case 'language':
          // Russian has a page for students only; without both fields there is no page yet.
          return doc.language &&
            doc.audience &&
            !(doc.language === 'russian' && doc.audience === 'adults')
            ? routes.languageProgram(doc.language as 'english', doc.audience as 'adults')
            : undefined
        case 'vouchers':
          return routes.vouchers()
        case 'vocational':
          return routes.professions()
        case 'teachers':
          return routes.teachers()
        case 'farmers':
          return routes.farmers()
        case 'computer':
          return routes.computerCourses()
        case 'translations':
          return routes.translations()
        default:
          return undefined
      }
  }
}

/**
 * The address of a document's live preview, for the admin's frame: `/kursove/<slug>?preview=
 * courses.25&locale=bg`. Empty when there's nothing to show yet (an unsaved document, a language
 * programme without its language).
 */
export function previewUrl(kind: PreviewKind, doc: PreviewedDoc, locale?: string): string {
  if (isCollection(kind) && !doc.id) return ''
  const page = pageOf(kind, doc)
  if (!page) return ''
  const target: PreviewTarget = {
    kind,
    id: isCollection(kind) ? String(doc.id) : undefined,
    locale: locale === 'en' ? 'en' : 'bg',
  }
  return `${page}?${previewQuery(target)}`
}
