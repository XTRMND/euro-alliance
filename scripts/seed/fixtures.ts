// The staging seed's fixtures (docs/seeding.md): what `pnpm seed:scrape` takes from the old site
// and `pnpm seed:staging` loads. They're committed in seed/, so the staging box never reaches
// euro-alliance.net.
import { readFile } from 'node:fs/promises'
import type { Audience, Language } from '@/lib/routes'

export const seedDir = new URL('../../seed/', import.meta.url)
export const seedMediaDir = new URL('media/', seedDir)

/** A link in a news text to a document copied into seed/media/, resolved when it's uploaded. */
export const mediaLink = (filename: string) => `seed-media:${filename}`
export const mediaLinkPattern = /^seed-media:(.+)$/

export type NewsFixture = {
  legacyId: number
  legacyUrl: string
  slug: string
  title: string
  /** ISO date; null when the old article shows none (reported, never made up). */
  date: string | null
  excerpt: string
  body: { root: Record<string, unknown> }
  /** For the report and for choosing test articles. */
  stats: {
    characters: number
    h2: number
    tables: number
    /** Images inside the text, left out (no design for them). */
    textImages: number
    /** Images in the article's photo carousel on the old site, not imported. */
    galleryImages: number
    documents: number
  }
}

/** A document linked from a news text, in seed/media/. */
export type DocumentFixture = { filename: string; mimetype: string; alt: string; source: string }

/** A cover from the approved Figma file for a real article (scripts/import/figma-covers.json). */
export type CoverFixture = { legacyId: number; file: string; alt: string; textInImage: boolean }

/** A group as the old entry gives it; the seed maps it to the groups collection's fields. */
export type GroupFixture = Record<string, unknown> & {
  label?: string
  startDate: string
  endDate?: string
  /** The old dated entry: the group's natural key. */
  legacyUrl: string
  /** The office by its role (ids differ between databases). */
  office?: 'courses'
}

/** An approved course (scripts/import/courses.json) with its groups from the old dated entries. */
export type CourseFixture = {
  slug: string
  title: string
  /** The old dated entries it takes in, to find courses an earlier import made of each. */
  legacyUrls: string[]
  data: Record<string, unknown>
  groups: GroupFixture[]
}

type Part = string | { text: string; destination: string }

/** A language page on the English template (scripts/import/language-pages.json). */
export type LanguagePageFixture = {
  language: Language
  audience: Audience
  oldUrl: string
  hero: { heading: string; highlight?: string | null; lead?: string | null }
  features: { title: string; text?: string | null }[] | null
  systemsBlock: { heading: string; lead?: string | null; linkLabel?: string | null } | null
  systems:
    | {
        name: string
        kicker?: string | null
        count?: string | null
        countLabel?: string | null
        description?: string | null
        levels: string[]
        strip?: { label: string; note: string } | null
      }[]
    | null
  certificatesBlock: { heading: string; lead?: string | null } | null
  certificates:
    { name: string; issuer?: string | null; code?: string | null; prep?: string | null }[] | null
  faq: { question: string; answer: Part[] }[] | null
  coursesHeading: string
  hidden: string[]
}

/** The ЦПО list as the old site writes it. */
export type ProfessionFixture = {
  directionCode: string
  name: string
  code: string
  degrees: ('I' | 'II' | 'III')[]
}

/** A programme for pedagogical specialists as the old site writes it (code 380100NN). */
export type TeacherProgrammeFixture = { code: string; number: string; title: string }

/** What the extraction found worth a look, printed again by every staging run. */
export type Notes = {
  /** Prices as written and as imported (лв. converted to euro). */
  prices: string[]
  /** Estimated group ends: the old site gives none. */
  ends: string[]
  levels: string[]
  noLevel: string[]
  /** Old dated entries the approved list doesn't take in (not imported). */
  unlistedEntries: string[]
  /** Groups of the approved list whose old entry the crawl didn't find. */
  missingEntries: string[]
  newsWithoutDate: string[]
  newsAllCaps: number
  newsTables: number
  newsTextImages: string[]
  /** Documents linked from texts that the old site doesn't serve either: their links are dropped. */
  documentsMissing: string[]
  /** Documents with personal data, kept out of seed/ (a public repository): their links are dropped. */
  documentsWithheld: string[]
  unmappedLinks: string[]
  /** Old pages that had photos (none imported), to ask the client for replacements. */
  pagesWithPhotos: string[]
}

export type Manifest = {
  scrapedAt: string
  crawledAt: string
  origin: string
  counts: Record<string, number>
}

export type Fixtures = {
  manifest: Manifest
  news: NewsFixture[]
  documents: DocumentFixture[]
  covers: CoverFixture[]
  courses: CourseFixture[]
  languagePages: LanguagePageFixture[]
  translation: { languages: string[] }
  professions: ProfessionFixture[]
  teacherProgrammes: TeacherProgrammeFixture[]
  notes: Notes
}

export const fixtureFiles = {
  manifest: 'manifest.json',
  news: 'news.json',
  documents: 'documents.json',
  covers: 'covers.json',
  courses: 'courses.json',
  languagePages: 'language-pages.json',
  translation: 'translation.json',
  professions: 'professions.json',
  teacherProgrammes: 'teacher-programmes.json',
  notes: 'notes.json',
} as const satisfies Record<keyof Fixtures, string>

export async function readFixtures(): Promise<Fixtures> {
  const entries = await Promise.all(
    Object.entries(fixtureFiles).map(async ([key, file]) => [
      key,
      JSON.parse(await readFile(new URL(file, seedDir), 'utf8')),
    ]),
  )
  return Object.fromEntries(entries) as Fixtures
}
