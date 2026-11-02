// The content import (docs/content-import.md § 3, PR 21): the old site's news, courses and the
// language pages the new site doesn't have yet, from the crawl (pnpm import:inventory) into
// Payload, published (the client approved all content, 02.11.2026). Text only: the old photos
// aren't imported (the user's decision of 02.11.2026), and the news covers come last, from the
// photos picked for them. Documents linked from the texts are downloaded once, a second apart, and
// stored by content hash. Idempotent: a record is matched on its legacyUrl and updated, and a
// cover set since is kept. Writes scripts/import/out/report.md.
//   pnpm import:run, with IMPORT_DRY_RUN=1 to write nothing and IMPORT_ONLY=news|courses|pages for
//   one part (environment variables: `payload run` doesn't pass arguments on to the script).
//   IMPORT_ONLY=covers applies the user's photo picks (out/photo-decisions.json), the last step:
//   it never runs as part of the rest.
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import config from '@payload-config'
import * as cheerio from 'cheerio'
import { getPayload, type Payload } from 'payload'
import { normalizePath, staticRedirects, withoutEnglish } from '@/lib/redirects'
import { type Audience, type Language, routes } from '@/lib/routes'
import { slugify } from '@/lib/slug'
import { type Destination, destinations } from '@/lib/destinations'
import { richText } from '@/seed/programs'
import { htmlToLexical, plainText, typeset } from './html-to-lexical'

const out = new URL('./out/', import.meta.url)
const userAgent = 'EuroAlliance-site-migration/1.0 (content migration to the new euro-alliance.net)'
const dryRun = process.env.IMPORT_DRY_RUN === '1'
const only = process.env.IMPORT_ONLY
const runs = (part: string) => !only || only === part
const unsplashDir = new URL('./in/unsplash/', import.meta.url)

type InventoryPage = {
  url: string
  status: number
  type: string
  title: string
  h1: string
  html?: string
}
type Inventory = { pages: InventoryPage[]; documents: { url: string; linkedFrom: string[] }[] }

const report = {
  news: {
    created: 0,
    updated: 0,
    allCaps: 0,
    tables: 0,
    /** Articles with images in their text (left out: the article text has no image design). */
    textImages: [] as string[],
  },
  courses: { created: 0, updated: 0, prices: [] as string[], pastStart: [] as string[] },
  pages: {
    created: 0,
    updated: 0,
    kept: [] as string[],
    made: [] as string[],
    /** Bulgarian pages on hold (the user checks them in Figma first). */
    held: [] as string[],
  },
  images: { downloaded: 0, reused: 0, failed: [] as string[], skippedInText: 0 },
  documents: { uploaded: 0, failed: [] as string[] },
  links: { mapped: 0, external: 0, unmapped: new Set<string>() },
  covers: {
    decisions: false,
    original: 0,
    unsplash: 0,
    none: 0,
    /** Picked Unsplash photos not yet in in/unsplash/. */
    notDownloaded: [] as string[],
    notFound: [] as string[],
  },
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const pathOf = (url: string) => decodeURI(new URL(url).pathname)
let lastRequest = 0

/** A file from the old site, cached in out/files/ (one request a second at most). */
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
  report.images.downloaded++
  return { data, type }
}

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
}

type MediaFields = {
  alt: string
  kind: 'photo' | 'scan'
  altReviewed?: boolean
  credit?: string
  textInImage?: boolean
}

/** Uploads a file to media once (by its name) and returns the media document. */
async function upload(
  payload: Payload,
  file: { data: Buffer; type: string },
  name: string,
  fields: MediaFields,
): Promise<{ id: number; url?: string | null } | null> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: name } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) {
    report.images.reused++
    // The flag may change between runs; the alt text and credit an editor reviewed stay.
    const flag = fields.textInImage
    if (!dryRun && flag !== undefined && existing.docs[0].textInImage !== flag)
      await payload.update({
        collection: 'media',
        id: existing.docs[0].id,
        data: { textInImage: flag },
      })
    return existing.docs[0]
  }
  if (dryRun) return { id: 0, url: null }
  return payload.create({
    collection: 'media',
    data: { altReviewed: false, ...fields },
    file: { data: file.data, mimetype: file.type, name, size: file.data.length },
  })
}

/** Uploads a file from the old site once (named by its content hash). */
async function media(
  payload: Payload,
  url: string,
  fields: MediaFields,
): Promise<{ id: number; url?: string | null } | null> {
  const file = await download(url)
  if (!file) {
    report.images.failed.push(url)
    return null
  }
  const ext = extensions[file.type] ?? url.split('.').pop()?.toLowerCase() ?? 'bin'
  const name = `import-${createHash('sha256').update(file.data).digest('hex').slice(0, 16)}.${ext}`
  return upload(payload, file, name, fields)
}

type Decision = {
  title: string
  legacyUrl: string | null
  choice: 'original' | 'unsplash' | 'none'
  original?: { src: string }
  textInImage?: boolean
  unsplash?: { id: string; page: string; photographer: string }
}

/**
 * The news covers and the homepage's small photo the user picked (out/photo-decisions.json, from
 * the local picker): the old cover, an Unsplash photo downloaded by hand into in/unsplash/ and
 * found by its id in the file name, or none. Alt texts are drafts (altReviewed: false) unless the
 * old site had one.
 */
async function importCovers(payload: Payload, altOf: Map<string, string>) {
  const file = new URL('photo-decisions.json', out)
  if (!existsSync(file)) return
  report.covers.decisions = true
  const { slots } = JSON.parse(await readFile(file, 'utf8')) as {
    slots: Record<string, Decision>
  }
  const downloads = existsSync(unsplashDir) ? await readdir(unsplashDir) : []
  for (const [slot, decision] of Object.entries(slots)) {
    const home = slot === 'home:photo-b'
    const drafted = home
      ? 'Снимка към началната страница'
      : `Снимка към новината „${typeset(decision.title)}“`
    let cover: number | null = null
    if (decision.choice === 'original' && decision.original) {
      const doc = await media(payload, decision.original.src, {
        alt: altOf.get(decision.original.src) || drafted,
        kind: 'photo',
        textInImage: Boolean(decision.textInImage),
      })
      if (!doc) continue
      cover = doc.id
      report.covers.original++
    } else if (decision.choice === 'unsplash' && decision.unsplash) {
      const { id, page, photographer } = decision.unsplash
      const name = downloads.find((download) => download.includes(id))
      if (!name) {
        report.covers.notDownloaded.push(`${decision.title}: ${page}`)
        continue
      }
      const ext = name.split('.').pop()!.toLowerCase()
      const doc = await upload(
        payload,
        {
          data: await readFile(new URL(name, unsplashDir)),
          type: ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg',
        },
        `unsplash-${id}.${ext}`,
        { alt: drafted, kind: 'photo', credit: `${photographer} / Unsplash` },
      )
      if (!doc) continue
      cover = doc.id
      report.covers.unsplash++
    } else report.covers.none++
    if (dryRun) continue
    if (home) {
      const current = await payload.findGlobal({ slug: 'home', depth: 0, locale: 'bg' })
      await payload.updateGlobal({
        slug: 'home',
        locale: 'bg',
        data: { hero: { ...current.hero, photoSecondary: cover } } as never,
      })
      continue
    }
    const found = await payload.find({
      collection: 'news',
      where: { legacyUrl: { equals: decision.legacyUrl } },
      limit: 1,
      depth: 0,
      draft: true,
    })
    if (!found.docs[0]) {
      report.covers.notFound.push(decision.title)
      continue
    }
    await payload.update({
      collection: 'news',
      id: found.docs[0].id,
      locale: 'bg',
      data: { cover } as never,
    })
  }
}

type Part = string | { text: string; destination: Destination }

/** A language page from scripts/import/language-pages.json (sources and notes left out here). */
type LanguagePage = {
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

/** Upserts a textbook system or a certificate by name, published, and returns its id. */
async function upsertByName(
  payload: Payload,
  collection: 'textbook-systems' | 'certificates',
  data: { name: string } & Record<string, unknown>,
): Promise<number> {
  const found = await payload.find({
    collection,
    where: { name: { equals: data.name } },
    limit: 1,
    depth: 0,
    draft: true,
  })
  const values = { ...data, _status: 'published' } as never
  const doc = found.docs[0]
    ? await payload.update({ collection, id: found.docs[0].id, locale: 'bg', data: values })
    : await payload.create({ collection, locale: 'bg', data: values })
  return doc.id
}

/**
 * A language page's Program on the English template (src/seed/programs.ts): the hero with the
 * flag (no notebook phrases: no source has them), «Как можете да учите», the textbook systems,
 * the certificates and the questions, each only when the page has content for it; the courses
 * section «Курсове по …».
 */
async function languagePageData(payload: Payload, page: LanguagePage) {
  const systemIds: number[] = []
  for (const { levels, strip, ...system } of page.systems ?? [])
    systemIds.push(
      await upsertByName(payload, 'textbook-systems', {
        ...system,
        levels: levels.map((level) => ({ level })),
        ...(strip ? { strip } : {}),
      }),
    )
  const certificateIds: number[] = []
  for (const certificate of page.certificates ?? [])
    certificateIds.push(await upsertByName(payload, 'certificates', certificate))
  const sections = [
    page.features?.length && {
      blockType: 'features',
      heading: 'Как можете да учите',
      items: page.features,
    },
    systemIds.length && {
      blockType: 'textbookSystems',
      heading: page.systemsBlock?.heading ?? 'Учебни системи и нива',
      lead: page.systemsBlock?.lead,
      systems: systemIds,
      ...(page.systemsBlock?.linkLabel
        ? { link: { label: page.systemsBlock.linkLabel, destination: 'levelTest' } }
        : {}),
      columns: 'two',
    },
    certificateIds.length && {
      blockType: 'certificates',
      heading: page.certificatesBlock?.heading ?? 'Сертификати',
      lead: page.certificatesBlock?.lead,
      certificates: certificateIds,
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
              : { text: part.text, url: destinations[part.destination].href },
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
    _status: 'published' as const,
  }
}

/** «30.10.26 г.» → 2026-10-30. */
function oldDate(text: string): string | null {
  const m = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/)
  if (!m) return null
  const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])
  return `${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}T00:00:00.000Z`
}

const isAllCaps = (text: string) => text === text.toUpperCase() && /[А-ЯA-Z]{4}/.test(text)

async function main() {
  const payload = await getPayload({ config })
  const inventory = JSON.parse(await readFile(new URL('inventory.json', out), 'utf8')) as Inventory
  const html = async (page: InventoryPage) =>
    cheerio.load(await readFile(new URL(`html/${page.html}`, out), 'utf8'))
  const bulgarian = inventory.pages.filter((page) => !/^\/en(\/|$)/i.test(pathOf(page.url)))

  // News slugs first, so links between articles can point at the new addresses.
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

  // Course slugs too, for the links to old course pages.
  const coursePages = bulgarian.filter((page) => /^\/courses\/\d+/i.test(pathOf(page.url)))
  const courseSlug = new Map<string, string>()
  const courseTitle = new Map<string, string>()
  const usedCourseSlugs = new Set<string>()
  for (const page of coursePages) {
    const $ = await html(page)
    const id = pathOf(page.url).split('/')[2]
    const title = typeset(String($('input[name="courseName"]').val() ?? page.title).trim())
    let slug = slugify(title)
    if (usedCourseSlugs.has(slug)) slug = `${slug}-${id}`
    usedCourseSlugs.add(slug)
    courseSlug.set(normalizePath(pathOf(page.url)), slug)
    courseTitle.set(normalizePath(pathOf(page.url)), title)
  }

  // Documents on the old site linked from the text: uploaded, and their links rewritten to the
  // copies (documents on other sites stay links). One missing on the old site too loses its link.
  const documentUrl = new Map<string, string>()
  const copies = new Set<string>()
  async function documentLink(href: string, label: string): Promise<string | null> {
    if (documentUrl.has(href)) return documentUrl.get(href)!
    const doc = await media(payload, href, {
      alt: label || decodeURI(href.split('/').pop() ?? 'Документ'),
      kind: 'scan',
    })
    if (!doc?.url && !dryRun) {
      report.documents.failed.push(href)
      return null
    }
    report.documents.uploaded++
    documentUrl.set(href, doc?.url ?? href)
    if (doc?.url) copies.add(doc.url)
    return doc?.url ?? href
  }

  /** An old link → the new address (or left as it is, for other sites). */
  const mapLink = (href: string): string => {
    if (copies.has(href)) return href
    let url: URL
    try {
      url = new URL(href, 'https://euro-alliance.net/')
    } catch {
      return href
    }
    if (url.hostname.replace(/^www\./, '') !== 'euro-alliance.net') {
      report.links.external++
      return url.href
    }
    if (documentUrl.has(url.href)) return documentUrl.get(url.href)!
    const path = withoutEnglish(normalizePath(url.pathname))
    const target =
      path === '/'
        ? '/'
        : (staticRedirects[path] ??
          (newsSlug.has(path) ? routes.newsArticle(newsSlug.get(path)!) : undefined) ??
          (courseSlug.has(path) ? routes.course(courseSlug.get(path)!) : undefined))
    if (target) {
      report.links.mapped++
      return target
    }
    report.links.unmapped.add(url.href)
    return url.href
  }

  // ── News ──────────────────────────────────────────────────────────────────
  if (runs('news')) {
    for (const page of articles) {
      const $ = await html(page)
      const id = Number(pathOf(page.url).split('/')[2])
      const title = typeset(page.h1 || $('h1').first().text().trim() || page.title)
      if (isAllCaps(title)) report.news.allCaps++
      const article = $('article.blogpost')
      const date = oldDate(article.find('.post-date').text())
      const content = article.find('.blogpost-content').first()
      content
        .find('.carousel-inner, [role="listbox"], .carousel-indicators, .carousel-control')
        .remove()
      for (const link of content.find('a[href]').toArray()) {
        const href = new URL($(link).attr('href')!, page.url)
        const ours = href.hostname.replace(/^www\./, '') === 'euro-alliance.net'
        if (ours && /\.(pdf|docx?|xlsx?)$/i.test(href.pathname)) {
          const copy = await documentLink(href.href, $(link).text().trim())
          if (copy) $(link).attr('href', copy)
          else $(link).removeAttr('href')
        }
      }
      const converted = htmlToLexical(content.html() ?? '', mapLink)
      report.images.skippedInText += converted.skippedImages.length
      if (converted.skippedImages.length)
        report.news.textImages.push(
          `${title}: ${converted.skippedImages.length} (${pathOf(page.url)})`,
        )
      report.news.tables += converted.tables
      const text = plainText(converted.root)
      const excerpt = text.split('\n').find((line) => line.length > 40) ?? text.split('\n')[0] ?? ''
      // No cover: it comes from the photos picked for the news (the import's last step).
      const data = {
        title,
        slug: newsSlug.get(normalizePath(pathOf(page.url)))!,
        date: date ?? new Date().toISOString(),
        excerpt:
          excerpt.length > 200 ? `${excerpt.slice(0, 199).replace(/\s+\S*$/, '')}…` : excerpt,
        body: { root: converted.root },
        legacyId: id,
        legacyUrl: page.url,
        _status: 'published' as const,
      }
      const found = await payload.find({
        collection: 'news',
        where: { legacyUrl: { equals: page.url } },
        limit: 1,
        depth: 0,
        draft: true,
      })
      if (dryRun) continue
      if (found.docs[0]) {
        await payload.update({
          collection: 'news',
          id: found.docs[0].id,
          locale: 'bg',
          data: data as never,
        })
        report.news.updated++
      } else {
        await payload.create({ collection: 'news', locale: 'bg', data: data as never })
        report.news.created++
      }
    }
  }

  // ── Courses ───────────────────────────────────────────────────────────────
  if (runs('courses')) {
    for (const page of coursePages) {
      const $ = await html(page)
      const field: Record<string, string> = {}
      $('dl.dl-horizontal dt').each((_, dt) => {
        const value = $(dt).next('dd').text().replace(/\s+/g, ' ').trim()
        field[$(dt).text().trim()] = value === 'ask' ? '' : value
      })
      const title = courseTitle.get(normalizePath(pathOf(page.url)))!
      const slug = courseSlug.get(normalizePath(pathOf(page.url)))!
      const description = $('h3')
        .filter((_, h) => $(h).text().trim() === 'Тема на обучение')
        .first()
        .next('p')
        .text()
        .trim()
      const students = /ученици/i.test(field['Участници'] ?? '')
      const isBel = /БЕЛ/.test(title)
      const isTeachers = /педагогическ/i.test(title)
      const voucher = /ваучер/i.test(title) || /ваучер/i.test(field['Цена (лв.)'] ?? '')
      const priceText = field['Цена (лв.)'] ?? ''
      const amount = priceText.match(/(\d+(?:[.,]\d+)?)/)?.[1]
      const currency = /лв/i.test(priceText.replace(/\(лв\.\)/, '')) ? 'BGN' : 'EUR'
      if (priceText)
        report.courses.prices.push(`${title}: «${priceText}»${currency === 'BGN' ? ' (лв)' : ''}`)
      const startDate = String($('input[name="courseStartDate"]').val() ?? '') || null
      if (startDate && startDate < new Date().toISOString().slice(0, 10))
        report.courses.pastStart.push(`${title} (${startDate})`)
      const days = [field['Учебни дни'], field['Учебни часове']].filter(Boolean).join(', ')
      const data = {
        title,
        slug,
        description: typeset(description),
        category: isTeachers ? 'teachers' : isBel ? 'exams' : voucher ? 'vouchers' : 'languages',
        topic: isTeachers ? 'teaching' : isBel ? 'exam-prep' : 'english',
        ...(isTeachers ? {} : { language: (isBel ? 'bulgarian' : 'english') as Language }),
        audience: (students ? 'students' : 'adults') as Audience,
        format: /онлайн/i.test(title) ? 'online' : 'in-person',
        levelName: field['Ниво'] || undefined,
        program: field['Програма'] || undefined,
        document: field['Документ'] || undefined,
        duration: field['Хорариум'] || undefined,
        schedule: days || undefined,
        venue: field['Учебна база'] || undefined,
        city: field['Град'] || undefined,
        startDate: startDate ? `${startDate}T00:00:00.000Z` : undefined,
        ...(amount ? { price: Number(amount.replace(',', '.')), currency } : {}),
        priceNote: priceText || undefined,
        included: field['Бележки'] || undefined,
        voucherEligible: voucher,
        legacyUrl: page.url,
        _status: 'published' as const,
      }
      const found = await payload.find({
        collection: 'courses',
        where: { legacyUrl: { equals: page.url } },
        limit: 1,
        depth: 0,
        draft: true,
      })
      if (dryRun) continue
      if (found.docs[0]) {
        await payload.update({
          collection: 'courses',
          id: found.docs[0].id,
          locale: 'bg',
          data: data as never,
        })
        report.courses.updated++
      } else {
        await payload.create({ collection: 'courses', locale: 'bg', data: data as never })
        report.courses.created++
      }
    }
  }

  // ── Pages: the language pages, on the English template ──────────────────
  // One page per language and audience (the user, 02.11.2026) from scripts/import/language-pages.json:
  // each language's old page and the English pages' language-neutral Figma copy, with a source per
  // field; a section with no content is left out. Pages from the approved Figma copy (English) stay.
  // Bulgarian (БЕЛ, Bulgarian for foreigners) is on hold: not built, and a page an earlier run made
  // from the old site is unpublished.
  if (runs('pages')) {
    const pages = JSON.parse(
      await readFile(new URL('./language-pages.json', import.meta.url), 'utf8'),
    ) as LanguagePage[]
    for (const page of pages) {
      const existing = await payload.find({
        collection: 'programs',
        where: {
          and: [
            { type: { equals: 'language' } },
            { language: { equals: page.language } },
            { audience: { equals: page.audience } },
          ],
        },
        limit: 1,
        depth: 0,
        draft: true,
      })
      const ours = existing.docs[0] as { legacyUrl?: string | null } | undefined
      if (ours && !ours.legacyUrl) {
        report.pages.kept.push(`${page.language} ${page.audience} (the page from Figma stays)`)
        continue
      }
      const data = dryRun ? {} : await languagePageData(payload, page)
      report.pages.made.push(
        `${pathOf(page.oldUrl)} → ${routes.languageProgram(page.language, page.audience as 'students')}: ${page.hidden.length ? `hidden ${page.hidden.join(', ')}` : 'every section'}`,
      )
      if (dryRun) continue
      if (existing.docs[0]) {
        await payload.update({
          collection: 'programs',
          id: existing.docs[0].id,
          locale: 'bg',
          data: data as never,
        })
        report.pages.updated++
      } else {
        await payload.create({ collection: 'programs', locale: 'bg', data: data as never })
        report.pages.created++
      }
    }
    const held = await payload.find({
      collection: 'programs',
      where: {
        and: [
          { type: { equals: 'language' } },
          { language: { equals: 'bulgarian' } },
          { legacyUrl: { exists: true } },
        ],
      },
      depth: 0,
      draft: true,
    })
    for (const doc of held.docs) {
      report.pages.held.push(doc.title)
      if (!dryRun && doc._status === 'published')
        await payload.update({
          collection: 'programs',
          id: doc.id,
          locale: 'bg',
          data: { _status: 'draft' },
        })
    }
  }

  if (only === 'covers') {
    // The old site's alt texts, by image address.
    const altOf = new Map<string, string>()
    for (const page of inventory.pages as (InventoryPage & {
      images?: { src: string; alt: string | null }[]
    })[])
      for (const image of page.images ?? [])
        if (image.alt?.trim()) altOf.set(image.src, typeset(image.alt.trim()))
    await importCovers(payload, altOf)
  }

  await writeReport(inventory)
  process.exit(0)
}

/** The old pages that had photos (from `pnpm import:images`), to ask the client for replacements. */
async function imageGaps(): Promise<string[]> {
  const file = new URL('images.json', out)
  if (!existsSync(file)) return ['- Old pages with photos: run `pnpm import:images` to list them.']
  const images = JSON.parse(await readFile(file, 'utf8')) as {
    group: string
    uses: { page: string; where: string }[]
  }[]
  const pages = new Map<string, number>()
  for (const image of images) {
    if (image.group !== 'page' && image.group !== 'course') continue
    for (const page of new Set(image.uses.map((use) => use.page))) {
      const path = pathOf(page)
      if (/^\/en(\/|$)/i.test(path)) continue
      pages.set(path, (pages.get(path) ?? 0) + 1)
    }
  }
  return [
    `- Old pages with photos, none imported (the new page, and how many photos the old one had): ask the client for real photos where a new section needs one.`,
    ...[...pages]
      .sort((a, b) => b[1] - a[1])
      .map(([path, count]) => {
        const target = path === '/' ? '/' : staticRedirects[normalizePath(path)]
        return `  - ${path} → ${target ?? 'no new page'}: ${count}`
      }),
  ]
}

async function writeReport(inventory: Inventory) {
  const r = report
  const bg = inventory.pages.filter((page) => !/^\/en(\/|$)/i.test(pathOf(page.url)))
  const lines = [
    `# Content import report`,
    '',
    `Run ${new Date().toISOString().slice(0, 16).replace('T', ' ')}${dryRun ? ' (dry run: nothing written)' : ''}. Everything imported is published (the client approved all content, 02.11.2026).`,
    '',
    `## Counts`,
    '',
    `| | Old site | Imported |`,
    `|---|---|---|`,
    `| News articles | ${bg.filter((p) => /^\/news\/\d+/i.test(pathOf(p.url))).length} | ${r.news.created} new, ${r.news.updated} updated |`,
    `| Courses | ${bg.filter((p) => /^\/courses\/\d+/i.test(pathOf(p.url))).length} | ${r.courses.created} new, ${r.courses.updated} updated |`,
    `| Language pages | ${r.pages.made.length} without a page on the new site | ${r.pages.created} new, ${r.pages.updated} updated |`,
    `| Documents linked from the texts | ${r.images.downloaded} downloaded | ${r.images.reused} already in media |`,
    '',
    `News listing pages (\`/News?page=N\`) aren't imported: they redirect to /novini. The English copies (\`/en/…\`) redirect to the Bulgarian page with a 302 (docs/english/old-site.md keeps the few real translations).`,
    '',
    `## To check on staging`,
    '',
    `- ${r.news.allCaps} news titles are written in capitals on the old site and kept as written.`,
    `- ${r.news.tables} tables in article texts became a paragraph per row.`,
    `- Prices, as written:`,
    ...r.courses.prices.map((price) => `  - ${price}`),
    `- Courses that have already started (published, but no longer listed): ${r.courses.pastStart.join('; ') || 'none'}.`,
    `- Language pages on the English template, from each old page and the neutral Figma copy (scripts/import/language-pages.json has a source for every field):`,
    ...r.pages.made.map((page) => `  - ${page}`),
    `- Pages kept from the approved Figma copy: ${r.pages.kept.join('; ') || 'none'}. On hold until the user has checked them in Figma, unpublished: ${r.pages.held.join('; ') || 'none'}.`,
    `- Documents linked from the texts, now in Media: ${r.documents.uploaded}. Missing on the old site too, so their links were removed (the text stays): ${r.documents.failed.join(', ') || 'none'}.`,
    `- Links to the old site without a new address: ${[...r.links.unmapped].join(', ') || 'none'}; ${r.links.mapped} links rewritten to the new addresses, ${r.links.external} to other sites kept.`,
    '',
    `## Images`,
    '',
    `No photo from the old site is imported (the user's decision of 02.11.2026). News covers and the homepage's small photo are picked from the old covers or Unsplash (scripts/import/out/photo-decisions.json) and imported last; until then those slots show their no-image state. The About page's photos are the client's own only. Courses take the design's Course visual and sticker.`,
    '',
    ...(only === 'covers'
      ? [
          r.covers.decisions
            ? `- Covers and the homepage photo, from the user's picks: ${r.covers.original} old covers, ${r.covers.unsplash} Unsplash photos, ${r.covers.none} without. Their alt texts are drafts to review in Media (\`altReviewed: false\`).`
            : '- No picks yet: out/photo-decisions.json is missing.',
          ...(r.covers.notDownloaded.length
            ? [
                `- Picked on Unsplash but not in scripts/import/in/unsplash/ yet:`,
                ...r.covers.notDownloaded.map((photo) => `  - ${photo}`),
              ]
            : []),
          ...(r.covers.notFound.length
            ? [`- Picks for news not in the database: ${r.covers.notFound.join('; ')}`]
            : []),
        ]
      : []),
    `- Images inside article texts, left out (the article text has no design for images): ${r.images.skippedInText}, in:`,
    ...r.news.textImages.map((article) => `  - ${article}`),
    ...(await imageGaps()),
    '',
  ]
  await writeFile(new URL('report.md', out), `${lines.join('\n')}\n`)
  console.log(lines.join('\n'))
}

await main()
