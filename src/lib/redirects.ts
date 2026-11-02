import { anchors, type Language, routes, segments } from './routes'

// The old site's addresses (docs/content-import.md § 5): one 301 straight to the new page, matched
// without regard to case or a trailing slash. These are the fixed patterns; the `redirects`
// collection adds the rest (each news article from the import, and any added by hand). Unknown
// addresses get the real 404 page, never the homepage.

/** An address as the old site's links may spell it: lowercase, no trailing slash, decoded. */
export function normalizePath(pathname: string): string {
  let path = pathname
  try {
    path = decodeURI(pathname)
  } catch {}
  path = path.toLowerCase().replace(/\/+$/, '')
  return path.startsWith('/') ? path || '/' : `/${path}`
}

// The old language pages' addresses (scripts/import/out/inventory.json, 02.11.2026).
const oldLanguages: Record<string, Language> = {
  'english-language': 'english',
  'german-language': 'german',
  'french-language': 'french',
  'spanish-language': 'spanish',
  'italian-language': 'italian',
  'bulgarian-language': 'bulgarian',
}

const students = '/language-education/language-education-for-students'
const adults = '/language-education/language-educations-for-adults'
const certificates = `${routes.languageProgram('english', 'adults')}#${anchors.certificates}`

/** The fixed map, old (normalized) → new. */
export const staticRedirects: Record<string, string> = Object.fromEntries([
  ...Object.entries(oldLanguages).flatMap(([old, language]) => [
    [`${students}/${old}`, routes.languageProgram(language, 'students')],
    [
      `${adults}/${old === 'french-language' ? 'french-language-adults' : old}`,
      routes.languageProgram(language as Exclude<Language, 'russian'>, 'adults'),
    ],
  ]),
  [`${students}/russian-language`, routes.languageProgram('russian', 'students')],
  // The section pages without a page of their own: the language course listing.
  [students, routes.courses({ category: 'languages', audience: 'students' })],
  [adults, routes.courses({ category: 'languages', audience: 'adults' })],
  // Open items (CLAUDE.md § 12): the proposed targets.
  [`${students}/language-certificates`, certificates],
  [`${adults}/language-certificates`, certificates],
  [`${adults}/accreditation-of-language-skills`, certificates],
  [`${students}/entry-level-tests`, routes.contact('test-za-nivo')],
  [`${adults}/entry-level-tests-for-adults`, routes.contact('test-za-nivo')],
  ['/professional-education', routes.professions()],
  ['/courses', routes.courses()],
  ['/vouchers', routes.vouchers()],
  ['/professional-education/professions-and-specialty', routes.professions()],
  ['/professional-education/pedagogical-specialists', routes.teachers()],
  ['/professional-education/training-for-farmers', routes.farmers()],
  ['/computer-education', routes.computerCourses()],
  ['/translations', routes.translations()],
  ['/translations/document-translations', routes.translations()],
  ['/translations/interpreting', `${routes.translations()}#ustni-prevodi`],
  ['/translations/translations-price', routes.translations()],
  ['/translations/upload-new-translation-document', routes.contact('prevodi')],
  ['/contact-us', routes.contact()],
  ['/about-us/our-history', routes.about('history')],
  ['/about-us/our-team', routes.about('team')],
  ['/about-us/standarts', routes.about('standards')],
  ['/about-us/documents', routes.about('documents')],
  ['/about-us/projects', routes.about('projects')],
  ['/about-us/online-education', routes.about('elearning')],
  ['/about-us/learning', routes.about()],
  ['/about-us/personal-data-gdpr', routes.privacy()],
  ['/news', routes.news()],
])

/**
 * The old site's English copies (/en/…, some linked as /en/en/…) go to the Bulgarian page until
 * the English site exists: the address without its /en prefixes ('/' for /en itself).
 */
export function withoutEnglish(path: string): string {
  const stripped = path.replace(/^(\/en)+(?=\/|$)/, '')
  return stripped || '/'
}

const siteSegments = new Set<string>([...Object.values(segments), 'dev'])

/** A page of the new site as written (its first segment, exact case, no trailing slash). */
export function isSitePath(pathname: string): boolean {
  if (pathname === '/') return true
  if (pathname.endsWith('/')) return false
  return siteSegments.has(pathname.split('/')[1] ?? '')
}
