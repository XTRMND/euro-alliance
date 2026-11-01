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

const oldLanguages: Record<string, Language> = {
  english: 'english',
  german: 'german',
  french: 'french',
  spanish: 'spanish',
  italian: 'italian',
  bulgarian: 'bulgarian',
}

const languageRows = Object.entries(oldLanguages).flatMap(([old, language]) => [
  [
    `/language-education/language-educations-for-adults/${old}`,
    routes.languageProgram(language as Exclude<Language, 'russian'>, 'adults'),
  ],
  [
    `/language-education/language-education-for-students/${old}`,
    routes.languageProgram(language, 'students'),
  ],
])

/** The fixed map, old (normalized) → new. */
export const staticRedirects: Record<string, string> = Object.fromEntries([
  ...languageRows,
  [
    '/language-education/language-education-for-students/russian',
    routes.languageProgram('russian', 'students'),
  ],
  // Open items (CLAUDE.md § 12): the proposed targets.
  [
    '/language-education/language-certificates',
    `${routes.languageProgram('english', 'adults')}#${anchors.certificates}`,
  ],
  ['/language-education/entry-level-tests', routes.contact('test-za-nivo')],
  ['/vouchers', routes.vouchers()],
  ['/professional-education/professions-and-specialty', routes.professions()],
  ['/professional-education/pedagogical-specialists', routes.teachers()],
  ['/professional-education/training-for-farmers', routes.farmers()],
  ['/computer-education', routes.computerCourses()],
  ['/translations/document-translations', routes.translations()],
  ['/translations/upload-new-translation-document', routes.contact('prevodi')],
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

const siteSegments = new Set<string>([...Object.values(segments), 'dev'])

/** A page of the new site as written (its first segment, exact case, no trailing slash). */
export function isSitePath(pathname: string): boolean {
  if (pathname === '/') return true
  if (pathname.endsWith('/')) return false
  return siteSegments.has(pathname.split('/')[1] ?? '')
}
