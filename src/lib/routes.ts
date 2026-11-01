// The URL scheme (docs/content-import.md § 4). Every internal link is built here. Route folders
// under src/app/(frontend) use the same segments; tests/unit/routes.test.ts keeps them in sync.

export const languages = [
  'english',
  'german',
  'french',
  'spanish',
  'italian',
  'bulgarian',
  'russian',
] as const
export type Language = (typeof languages)[number]

export const audiences = ['adults', 'students'] as const
export type Audience = (typeof audiences)[number]

/** Russian is taught to students only. */
export type AudienceFor<L extends Language> = L extends 'russian' ? 'students' : Audience

export const languageSegments: Record<Language, string> = {
  english: 'angliyski',
  german: 'nemski',
  french: 'frenski',
  spanish: 'ispanski',
  italian: 'italianski',
  bulgarian: 'balgarski',
  russian: 'ruski',
}

export const audienceSegments: Record<Audience, string> = {
  adults: 'vazrastni',
  students: 'uchenitsi',
}

export const segments = {
  courses: 'kursove',
  languages: 'ezitsi',
  vouchers: 'vaucheri',
  vocational: 'profesionalno-obuchenie',
  professions: 'profesii',
  teachers: 'pedagogicheski-spetsialisti',
  farmers: 'zemedeltsi',
  computerCourses: 'kompyutarni-kursove',
  translations: 'prevodi',
  news: 'novini',
  about: 'za-nas',
  contact: 'kontakti',
  privacy: 'poveritelnost',
  cookies: 'biskvitki',
  search: 'tarsene',
} as const

export const queryParams = {
  page: 'stranitsa',
  topic: 'tema',
  search: 'q',
  category: 'kategoria',
  /** Course listing filters (PR 9). */
  audience: 'auditoria',
  language: 'ezik',
  format: 'format',
  funding: 'finansirane',
  start: 'nachalo',
  sort: 'sortirane',
  shown: 'pokazani',
  /** The course a visitor enrols in, read by the contact wizard (PR 11). */
  course: 'kurs',
  /** The language pair of «Изпратете документ», read by the contact wizard (PR 11). */
  from: 'ot',
  to: 'na',
} as const

/** Course listing filters (/kursove?kategoria=ezitsi&ezik=nemski …): URL values per option. */
export const courseCategories = {
  languages: 'ezitsi',
  exams: 'izpiti-i-sertifikati',
  vocational: 'profesionalno-obuchenie',
  vouchers: 'obuchenie-s-vaucheri',
  teachers: 'pedagogicheski-spetsialisti',
  farmers: 'obuchenie-za-zemedeltsi',
  computer: 'kompyutarni-kursove',
} as const
export type CourseCategory = keyof typeof courseCategories

export const courseAudienceSegments = { ...audienceSegments, companies: 'firmi' } as const

export const courseFormatSegments = { 'in-person': 'prisastveno', online: 'onlayn' } as const

/** «С ваучер от АЗ» (the only funding filter) and the sort orders. */
export const courseFilterValues = {
  voucher: 'vaucher',
  sortSoonest: 'nay-skoro',
  sortPrice: 'tsena',
} as const

export const anchors = {
  certificates: 'sertifikati',
} as const

/** Location cards on the contact page. */
export const contactLocations = {
  plovdiv: 'plovdiv',
  sofia: 'sofia',
} as const
export type ContactLocation = keyof typeof contactLocations

/** Provisional: PR 16 takes the final ids from the About Subnav items (189:349). */
export const aboutSections = {
  history: 'istoria',
  team: 'ekip',
  standards: 'standarti',
  documents: 'dokumenti',
  projects: 'proekti',
} as const
export type AboutSection = keyof typeof aboutSections

/** Reference pages for development, served only with DEV_PAGES=true. */
export const devRoutes = {
  tokens: '/dev/tokens',
  components: '/dev/components',
  patterns: '/dev/patterns',
  visuals: '/dev/visuals',
  cards: '/dev/cards',
  course: '/dev/course',
  news: '/dev/news',
} as const

function withQuery(path: string, name: string, value: string | undefined): string {
  return value ? `${path}?${new URLSearchParams({ [name]: value })}` : path
}

export const routes = {
  home: () => '/',
  courses: (category?: CourseCategory) =>
    withQuery(`/${segments.courses}`, queryParams.category, category && courseCategories[category]),
  course: (slug: string) => `/${segments.courses}/${slug}`,
  languageProgram: <L extends Language>(language: L, audience: AudienceFor<L>) =>
    `/${segments.languages}/${languageSegments[language]}/${audienceSegments[audience]}`,
  vouchers: () => `/${segments.vouchers}`,
  professions: () => `/${segments.vocational}/${segments.professions}`,
  teachers: () => `/${segments.vocational}/${segments.teachers}`,
  farmers: () => `/${segments.vocational}/${segments.farmers}`,
  computerCourses: () => `/${segments.computerCourses}`,
  translations: () => `/${segments.translations}`,
  news: (page = 1) =>
    withQuery(`/${segments.news}`, queryParams.page, page > 1 ? String(page) : undefined),
  newsArticle: (slug: string) => `/${segments.news}/${slug}`,
  about: (section?: AboutSection) =>
    section ? `/${segments.about}#${aboutSections[section]}` : `/${segments.about}`,
  /** `topic` preselects the contact wizard; PR 11 narrows it to the wizard's topics. */
  contact: (topic?: string, pair?: { from: string; to: string }) => {
    const path = withQuery(`/${segments.contact}`, queryParams.topic, topic)
    if (!pair) return path
    const query = new URLSearchParams({ [queryParams.from]: pair.from, [queryParams.to]: pair.to })
    return `${path}${path.includes('?') ? '&' : '?'}${query}`
  },
  /** Enrolment in a course: the wizard on the courses topic, or the voucher topic. */
  enrol: (course: string, voucher = false) =>
    `/${segments.contact}?${new URLSearchParams({
      [queryParams.topic]: voucher ? segments.vouchers : segments.courses,
      [queryParams.course]: course,
    })}`,
  contactLocation: (location: ContactLocation) =>
    `/${segments.contact}#${contactLocations[location]}`,
  privacy: () => `/${segments.privacy}`,
  cookies: () => `/${segments.cookies}`,
  search: (query?: string) => withQuery(`/${segments.search}`, queryParams.search, query),
}
