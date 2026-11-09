// `pnpm seed:scrape` (docs/seeding.md): the staging seed's first step, run locally. Crawls
// euro-alliance.net (scripts/import/inventory.ts: one request a second, the HTML kept in
// scripts/import/out/) and writes the fixtures to seed/, which are committed: the news, the
// approved courses with their old dated entries, the language pages, the translation languages,
// the ЦПО and teachers' lists as the old site writes them, and the documents linked from the news
// texts (copied into seed/media/). Text only: no photo from the old site (the user's decision of
// 02.11.2026); the seven news covers come from the approved Figma file.
//   pnpm seed:scrape            crawl again, then extract
//   pnpm seed:scrape --cached   extract from the last crawl
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import * as cheerio from 'cheerio'
import { normalizePath, staticRedirects, withoutEnglish } from '@/lib/redirects'
import { routes } from '@/lib/routes'
import { slugify } from '@/lib/slug'
import { htmlToLexical, plainText, typeset } from '../import/html-to-lexical'
import {
  bgnPerEuro,
  cleanCourseTitle,
  estimateGroupEnd,
  mergeOldLevels,
  type OldLevel,
  parseOldPrice,
} from '../import/old-course'
import {
  type CourseFixture,
  type CoverFixture,
  type DocumentFixture,
  type Fixtures,
  fixtureFiles,
  type GroupFixture,
  type LanguagePageFixture,
  mediaLink,
  type NewsFixture,
  type Notes,
  type ProfessionFixture,
  seedDir,
  seedMediaDir,
  type TeacherProgrammeFixture,
} from './fixtures'

const importDir = new URL('../import/', import.meta.url)
const out = new URL('out/', importDir)
const userAgent = 'EuroAlliance-site-migration/1.0 (content migration to the new euro-alliance.net)'

type InventoryPage = {
  url: string
  status: number
  type: string
  title: string
  h1: string
  html?: string
}
type Inventory = { crawledAt: string; origin: string; pages: InventoryPage[] }

const pathOf = (url: string) => decodeURI(new URL(url).pathname)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

if (!process.argv.includes('--cached')) {
  const crawl = spawnSync(process.execPath, [new URL('inventory.ts', importDir).pathname], {
    stdio: 'inherit',
  })
  if (crawl.status !== 0) process.exit(crawl.status ?? 1)
}

const inventory = JSON.parse(await readFile(new URL('inventory.json', out), 'utf8')) as Inventory
const html = async (page: InventoryPage) =>
  cheerio.load(await readFile(new URL(`html/${page.html}`, out), 'utf8'))
const bulgarian = inventory.pages.filter(
  (page) => page.status === 200 && !/^\/en(\/|$)/i.test(pathOf(page.url)),
)
const findPage = (pattern: RegExp) =>
  bulgarian.find((page) => pattern.test(normalizePath(pathOf(page.url))))

const notes: Notes = {
  prices: [],
  ends: [],
  levels: [],
  noLevel: [],
  unlistedEntries: [],
  missingEntries: [],
  newsWithoutDate: [],
  newsAllCaps: 0,
  newsTables: 0,
  newsTextImages: [],
  documentsMissing: [],
  documentsWithheld: [],
  unmappedLinks: [],
  pagesWithPhotos: [],
}

// ── Addresses ───────────────────────────────────────────────────────────────
// News and course slugs first, so links between old pages can point at the new addresses.
const articles = bulgarian.filter((page) => /^\/news\/\d+/i.test(pathOf(page.url)))
const newsSlug = new Map<string, string>()
const usedSlugs = new Set<string>()
for (const page of articles) {
  const id = pathOf(page.url).split('/')[2]
  let slug = slugify(page.h1 || page.title) || `novina-${id}`
  if (usedSlugs.has(slug)) slug = `${slug}-${id}`
  usedSlugs.add(slug)
  newsSlug.set(normalizePath(pathOf(page.url)), slug)
}

const coursePages = bulgarian.filter((page) => /^\/courses\/\d+/i.test(pathOf(page.url)))
const courseSlug = new Map<string, string>()
const usedCourseSlugs = new Set<string>()
for (const page of coursePages) {
  const $ = await html(page)
  const id = pathOf(page.url).split('/')[2]
  let slug = slugify(typeset(String($('input[name="courseName"]').val() ?? page.title).trim()))
  if (usedCourseSlugs.has(slug)) slug = `${slug}-${id}`
  usedCourseSlugs.add(slug)
  courseSlug.set(normalizePath(pathOf(page.url)), slug)
}

const unmapped = new Set<string>()
/** An old link → the new address (links to other sites stay as they are). */
function mapLink(href: string): string {
  if (href.startsWith('seed-media:')) return href
  let url: URL
  try {
    url = new URL(href, 'https://euro-alliance.net/')
  } catch {
    return href
  }
  if (url.hostname.replace(/^www\./, '') !== 'euro-alliance.net') return url.href
  const path = withoutEnglish(normalizePath(url.pathname))
  const target =
    path === '/'
      ? '/'
      : (staticRedirects[path] ??
        (newsSlug.has(path) ? routes.newsArticle(newsSlug.get(path)!) : undefined) ??
        (courseSlug.has(path) ? routes.course(courseSlug.get(path)!) : undefined))
  if (target) return target
  unmapped.add(url.href)
  return url.href
}

// ── Documents linked from the news texts ──────────────────────────────────
const extensions: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
}
let lastRequest = 0
/** A file from the old site, cached in scripts/import/out/files/ (a second between requests). */
async function download(url: string): Promise<{ data: Buffer; type: string } | null> {
  const name = createHash('sha1').update(url).digest('hex')
  const cached = new URL(`files/${name}`, out)
  if (existsSync(cached)) {
    const meta = JSON.parse(await readFile(new URL(`files/${name}.json`, out), 'utf8'))
    return { data: await readFile(cached), type: meta.type }
  }
  await sleep(Math.max(0, lastRequest + 1000 - Date.now()))
  lastRequest = Date.now()
  const response = await fetch(url, { headers: { 'user-agent': userAgent } }).catch(() => null)
  if (!response?.ok) return null
  const data = Buffer.from(await response.arrayBuffer())
  const type = response.headers.get('content-type')?.split(';')[0] ?? 'application/octet-stream'
  await mkdir(new URL('files/', out), { recursive: true })
  await writeFile(cached, data)
  await writeFile(new URL(`files/${name}.json`, out), JSON.stringify({ url, type }))
  return { data, type }
}

await rm(seedMediaDir, { recursive: true, force: true })
await mkdir(seedMediaDir, { recursive: true })
const documents = new Map<string, DocumentFixture | null>()
// Documents with personal data stay out of seed/ (the repository is public): the results lists of
// the children's contests (the user, 09.11.2026), named in withheld.json, and any document whose
// link says it's results, prize winners or a ranking. Their links go; the article text stays.
const withheld = new Map(
  (
    JSON.parse(await readFile(new URL('withheld.json', import.meta.url), 'utf8')) as {
      source: string
      reason: string
    }[]
  ).map(({ source, reason }) => [source, reason]),
)
const personalLink = /резултат|награден|класиран|списък на (участ|ученици|деца)/i

async function documentLink(href: string, label: string): Promise<string | null> {
  if (!documents.has(href) && (withheld.has(href) || personalLink.test(label))) {
    notes.documentsWithheld.push(`${href} («${label}»): ${withheld.get(href) ?? 'its link reads as results or prize winners'}`)
    documents.set(href, null)
  }
  if (!documents.has(href)) {
    const file = await download(href)
    if (!file) {
      notes.documentsMissing.push(href)
      documents.set(href, null)
    } else {
      const ext = extensions[file.type] ?? href.split('.').pop()?.toLowerCase() ?? 'bin'
      // Named by content, as the import named them before: the same file is uploaded once.
      const filename = `import-${createHash('sha256').update(file.data).digest('hex').slice(0, 16)}.${ext}`
      await writeFile(new URL(filename, seedMediaDir), file.data)
      documents.set(href, {
        filename,
        mimetype: file.type,
        alt: label || decodeURI(href.split('/').pop() ?? 'Документ'),
        source: href,
      })
    }
  }
  const document = documents.get(href)
  return document ? mediaLink(document.filename) : null
}

// ── News ──────────────────────────────────────────────────────────────────
/** «30.10.26 г.» → 2026-10-30. */
function oldDate(text: string): string | null {
  const m = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/)
  if (!m) return null
  const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])
  return `${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}T00:00:00.000Z`
}
const isAllCaps = (text: string) => text === text.toUpperCase() && /[А-ЯA-Z]{4}/.test(text)

const countNodes = (
  node: Record<string, unknown>,
  test: (n: Record<string, unknown>) => boolean,
) => {
  let n = test(node) ? 1 : 0
  for (const child of (node.children as Record<string, unknown>[] | undefined) ?? [])
    n += countNodes(child, test)
  return n
}

const news: NewsFixture[] = []
for (const page of articles) {
  const $ = await html(page)
  const id = Number(pathOf(page.url).split('/')[2])
  const title = typeset(page.h1 || $('h1').first().text().trim() || page.title)
  if (isAllCaps(title)) notes.newsAllCaps++
  const article = $('article.blogpost')
  const date = oldDate(article.find('.post-date').text())
  if (!date) notes.newsWithoutDate.push(`${title} (${pathOf(page.url)})`)
  const content = article.find('.blogpost-content').first()
  const galleryImages = article.find('.carousel-inner img').length
  content
    .find('.carousel-inner, [role="listbox"], .carousel-indicators, .carousel-control')
    .remove()
  let linkedDocuments = 0
  for (const link of content.find('a[href]').toArray()) {
    const href = new URL($(link).attr('href')!, page.url)
    const ours = href.hostname.replace(/^www\./, '') === 'euro-alliance.net'
    if (ours && /\.(pdf|docx?|xlsx?)$/i.test(href.pathname)) {
      const copy = await documentLink(href.href, $(link).text().trim())
      if (copy) {
        $(link).attr('href', copy)
        linkedDocuments++
      } else $(link).removeAttr('href')
    }
  }
  const converted = htmlToLexical(content.html() ?? '', mapLink)
  if (converted.skippedImages.length)
    notes.newsTextImages.push(`${title}: ${converted.skippedImages.length} (${pathOf(page.url)})`)
  notes.newsTables += converted.tables
  const text = plainText(converted.root)
  const excerpt = text.split('\n').find((line) => line.length > 40) ?? text.split('\n')[0] ?? ''
  news.push({
    legacyId: id,
    legacyUrl: page.url,
    slug: newsSlug.get(normalizePath(pathOf(page.url)))!,
    title,
    date,
    excerpt: excerpt.length > 200 ? `${excerpt.slice(0, 199).replace(/\s+\S*$/, '')}…` : excerpt,
    body: { root: converted.root },
    stats: {
      characters: text.length,
      h2: countNodes(converted.root, (n) => n.type === 'heading' && n.tag === 'h2'),
      tables: converted.tables,
      textImages: converted.skippedImages.length,
      galleryImages,
      documents: linkedDocuments,
    },
  })
}
// Newest first; the old id breaks ties within a day.
news.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || b.legacyId - a.legacyId)

// ── Covers from the approved Figma file ──────────────────────────────────────
const covers: CoverFixture[] = (
  JSON.parse(await readFile(new URL('figma-covers.json', importDir), 'utf8')) as {
    legacyId: string
    alt: string
    textInImage: boolean
  }[]
).map(({ legacyId, alt, textInImage }) => ({
  legacyId: Number(legacyId),
  file: `scripts/import/figma-covers/${legacyId}.jpg`,
  alt,
  textInImage,
}))

// ── Courses ───────────────────────────────────────────────────────────────
// The approved list (scripts/import/courses.json, docs/course-list.md): what the centre teaches,
// each with zero or more groups made from the old site's dated entries (/Courses/N). A group keeps
// the old entry's start, schedule, format and office; its price comes in euro and its end is
// estimated (scripts/import/old-course.ts; both reported). The level bubble comes from the old
// «Ниво» across the course's groups, unless the list gives one. The course page's text comes from
// its old page (scripts/import/course-pages.json): a field it leaves out is cleared.
type CourseEntry = {
  slug: string
  title?: string
  approved: boolean
  level?: string
  levelUnit?: 'level' | 'grade'
  format?: 'in-person' | 'online'
  voucherEligible?: boolean
  groups: { legacyId: string; label?: string; priceLabel?: string }[]
} & Record<string, unknown>

const entries = (
  JSON.parse(await readFile(new URL('courses.json', importDir), 'utf8')) as CourseEntry[]
).filter((entry) => entry.approved)
const pageContent = new Map(
  (
    JSON.parse(await readFile(new URL('course-pages.json', importDir), 'utf8')) as {
      slug: string
      fields: Record<string, string>
    }[]
  ).map((page) => [page.slug, page.fields]),
)
const contentFields = [
  'description',
  'duration',
  'program',
  'document',
  'included',
  'audienceNote',
  'levelName',
] as const
const pageById = new Map(coursePages.map((page) => [pathOf(page.url).split('/')[2], page]))

async function readOldEntry(page: InventoryPage) {
  const $ = await html(page)
  const field: Record<string, string> = {}
  $('dl.dl-horizontal dt').each((_, dt) => {
    const value = $(dt).next('dd').text().replace(/\s+/g, ' ').trim()
    field[$(dt).text().trim()] = value === 'ask' ? '' : value
  })
  const description = $('h3')
    .filter((_, h) => $(h).text().trim() === 'Тема на обучение')
    .first()
    .next('p')
    .text()
    .trim()
  return {
    field,
    name: typeset(String($('input[name="courseName"]').val() ?? page.title).trim()),
    description: typeset(description),
    startDate: String($('input[name="courseStartDate"]').val() ?? ''),
  }
}

function priceAndEnd(title: string, field: Record<string, string>, startDate: string) {
  const written = field['Цена (лв.)']
  const parsed = parseOldPrice(written)
  if (written)
    notes.prices.push(
      `${title}: «${written}»${
        parsed?.bgn
          ? ` → ${parsed.price} € (${parsed.bgn} лв. ÷ ${bgnPerEuro}, rounded to 5 €)`
          : parsed
            ? ` → ${String(parsed.price).replace('.', ',')} €`
            : ''
      }`,
    )
  const end = estimateGroupEnd(startDate, {
    total: field['Хорариум'],
    days: field['Учебни дни'],
    hours: field['Учебни часове'],
  })
  notes.ends.push(`${title}: ${startDate} → ${end.endDate} (${end.how})`)
  const price = parsed && {
    price: parsed.price,
    currency: parsed.currency,
    priceLabel: parsed.priceLabel,
  }
  return { price, endDate: `${end.endDate}T00:00:00.000Z` }
}

const noteLevel = (title: string, level: OldLevel | null, written?: string) =>
  level
    ? notes.levels.push(
        `${title}: «${written}» → ${level.level} (${level.levelUnit === 'grade' ? 'КЛАС' : 'НИВО'})`,
      )
    : notes.noLevel.push(`${title}${written ? `: «${written}»` : ''}`)

const courses: CourseFixture[] = []
const listed = new Set<string>()
for (const entry of entries) {
  const groups: GroupFixture[] = []
  const course: Record<string, string> = {}
  const levelTexts: string[] = []
  for (const { legacyId, label, priceLabel } of entry.groups) {
    listed.add(legacyId)
    const page = pageById.get(legacyId)
    if (!page) {
      notes.missingEntries.push(`${entry.title ?? entry.slug}: /Courses/${legacyId}`)
      continue
    }
    const { field, name, description, startDate } = await readOldEntry(page)
    course.originalTitle ??= name
    course.title ??= entry.title ?? cleanCourseTitle(name)
    course.description ??= description
    course.duration ??= field['Хорариум']
    course.program ??= field['Програма']
    course.document ??= field['Документ']
    levelTexts.push(field['Ниво'])
    if (!startDate) continue
    const { price, endDate } = priceAndEnd(
      `${course.title}${label ? `, ${label}` : ''}`,
      field,
      startDate,
    )
    const online = /online/i.test(field['Зала'] ?? '') || /онлайн/i.test(name)
    groups.push({
      ...(label ? { label } : {}),
      startDate: `${startDate}T00:00:00.000Z`,
      endDate,
      ...(field['Учебни дни'] ? { days: field['Учебни дни'] } : {}),
      // A time («18.00 до 20.50»), not a total («100 уч.часа», which some entries put here).
      ...(/\d{1,2}[.:]\d{2}/.test(field['Учебни часове'] ?? '')
        ? { hours: field['Учебни часове'] }
        : {}),
      format: online ? 'online' : 'in-person',
      ...(/самара/i.test(field['Учебна база'] ?? '') ? { office: 'courses' as const } : {}),
      ...(price ?? {}),
      ...(priceLabel ? { priceLabel } : {}),
      legacyUrl: page.url,
    })
  }
  const level = mergeOldLevels(levelTexts)
  if (level || levelTexts.some(Boolean))
    course.levelName = level?.levelName ?? levelTexts.find(Boolean)!
  const title = course.title ?? entry.title ?? entry.slug
  if (entry.level)
    noteLevel(
      title,
      { level: entry.level, levelUnit: entry.levelUnit ?? 'level', levelName: '' },
      course.levelName || 'courses.json',
    )
  else noteLevel(title, level, course.levelName)
  const fields = Object.fromEntries(
    Object.entries(entry).filter(([key]) => !['approved', 'source', 'groups'].includes(key)),
  )
  const content = pageContent.get(entry.slug)
  courses.push({
    slug: entry.slug,
    title: entry.title ?? title,
    legacyUrls: entry.groups
      .map(({ legacyId }) => pageById.get(legacyId)?.url)
      .filter((url): url is string => Boolean(url)),
    data: {
      ...(level ? { level: level.level, levelUnit: level.levelUnit } : {}),
      ...fields,
      ...Object.fromEntries(Object.entries(course).filter(([, value]) => value)),
      ...(content
        ? {
            ...Object.fromEntries(contentFields.map((name) => [name, content[name] ?? null])),
            format: content.format ?? entry.format ?? null,
          }
        : {}),
      ...(entry.title ? { title: entry.title } : {}),
      voucherEligible: Boolean(entry.voucherEligible),
    },
    groups,
  })
}
for (const [id, page] of pageById)
  if (!listed.has(id)) notes.unlistedEntries.push(`${page.title} (${pathOf(page.url)})`)

// ── Translation languages ─────────────────────────────────────────────────
// From the old «Писмени преводи» page (C13, 02.11.2026): Figma's pair first (Български, Немски),
// then the old list in its order.
const translationPage = findPage(/^\/translations\/document-translations$/i)
let translationLanguages: string[] = []
if (translationPage) {
  const $ = await html(translationPage)
  const text = $('body').text().replace(/\s+/g, ' ')
  const list = text.match(/Писмени езикови преводи и легализация(.*?)Други езици/)?.[1] ?? ''
  const old = [...list.matchAll(/([А-Я][а-я]+) език/g)].map((match) => match[1])
  if (old.length) translationLanguages = [...new Set(['Български', 'Немски', ...old])]
}

// ── The ЦПО and teachers' lists, as the old site writes them ─────────────────
const degreeOf: Record<string, 'I' | 'II' | 'III'> = { първа: 'I', втора: 'II', трета: 'III' }
const professions: ProfessionFixture[] = []
const professionsPage = findPage(/^\/professional-education\/professions-and-specialty$/i)
if (professionsPage) {
  const $ = await html(professionsPage)
  const text = $('body').text().replace(/\s+/g, ' ')
  for (const m of text.matchAll(
    /Професия\s+["„“]([^"„“]+)["“”],?\s+код\s+(\d{6})\s+-\s+(.+?)\s+степен/g,
  ))
    professions.push({
      directionCode: m[2].slice(0, 3),
      name: typeset(m[1].trim()),
      code: m[2],
      degrees: m[3]
        .split(/,\s*|\s+и\s+/)
        .map((word) => degreeOf[word.trim()])
        .filter(Boolean),
    })
}
const teacherProgrammes: TeacherProgrammeFixture[] = []
const teachersPage = findPage(/^\/professional-education\/pedagogical-specialists$/i)
if (teachersPage) {
  const $ = await html(teachersPage)
  const text = $('body').text().replace(/\s+/g, ' ')
  const list = text.match(/Списък на програмите за педагогически специалисти(.*?)Обучения за/)?.[1]
  for (const m of (list ?? '').matchAll(/(3801\d{4})\s*(.+?)(?=\s*3801\d{4}|$)/g))
    teacherProgrammes.push({ code: m[1], number: m[1].slice(-2), title: typeset(m[2].trim()) })
}

// ── Language pages ────────────────────────────────────────────────────────
// One per language and audience (the user, 02.11.2026), from each old page and the English pages'
// language-neutral Figma copy; the sources and notes stay in scripts/import/language-pages.json.
const languagePages = (
  JSON.parse(await readFile(new URL('language-pages.json', importDir), 'utf8')) as Record<
    string,
    unknown
  >[]
).map(
  (page) =>
    Object.fromEntries(
      Object.entries(page).filter(([key]) => key !== 'sources' && key !== 'notes'),
    ) as LanguagePageFixture,
)

// ── Old pages with photos (from `pnpm import:images`, when it has run) ────────
const imagesFile = new URL('images.json', out)
if (existsSync(imagesFile)) {
  const images = JSON.parse(await readFile(imagesFile, 'utf8')) as {
    group: string
    uses: { page: string }[]
  }[]
  const pages = new Map<string, number>()
  for (const image of images) {
    if (image.group !== 'page' && image.group !== 'course') continue
    for (const page of new Set(image.uses.map((use) => use.page))) {
      const path = pathOf(page)
      if (!/^\/en(\/|$)/i.test(path)) pages.set(path, (pages.get(path) ?? 0) + 1)
    }
  }
  notes.pagesWithPhotos = [...pages]
    .sort((a, b) => b[1] - a[1])
    .map(([path, count]) => {
      const target = path === '/' ? '/' : staticRedirects[normalizePath(path)]
      return `${path} → ${target ?? 'no new page'}: ${count}`
    })
}
notes.unmappedLinks = [...unmapped].sort()

// ── Write ─────────────────────────────────────────────────────────────────
const fixtures: Fixtures = {
  manifest: {
    scrapedAt: new Date().toISOString(),
    crawledAt: inventory.crawledAt,
    origin: inventory.origin,
    counts: {
      news: news.length,
      documents: [...documents.values()].filter(Boolean).length,
      covers: covers.length,
      courses: courses.length,
      groups: courses.reduce((n, course) => n + course.groups.length, 0),
      languagePages: languagePages.length,
      translationLanguages: translationLanguages.length,
      professions: professions.length,
      teacherProgrammes: teacherProgrammes.length,
    },
  },
  news,
  documents: [...documents.values()].filter((d): d is DocumentFixture => Boolean(d)),
  covers,
  courses,
  languagePages,
  translation: { languages: translationLanguages },
  professions,
  teacherProgrammes,
  notes,
}
await mkdir(seedDir, { recursive: true })
for (const [key, file] of Object.entries(fixtureFiles))
  await writeFile(
    new URL(file, seedDir),
    `${JSON.stringify(fixtures[key as keyof Fixtures], null, 2)}\n`,
  )

const media = await readdir(seedMediaDir)
console.log(`Fixtures written to seed/ (crawl of ${inventory.crawledAt}):`)
for (const [key, count] of Object.entries(fixtures.manifest.counts))
  console.log(`  ${key}: ${count}`)
console.log(`  files in seed/media/: ${media.length}`)
if (!professions.length || !teacherProgrammes.length || !translationLanguages.length) {
  console.error('An old page changed: a list came out empty. Check the extractors above.')
  process.exit(1)
}
