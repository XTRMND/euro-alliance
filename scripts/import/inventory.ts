// Inventory of the current site (docs/content-import.md § 3.1), the import's first step: crawls
// euro-alliance.net from its homepage (it has no sitemap.xml, and no robots.txt to respect) and
// writes scripts/import/out/inventory.json with, per page, its status, final address, type
// (guessed from the address, § 5), title, H1, meta description, internal links and images; and
// the documents it links to. Each page's HTML is kept in out/html/ for the extract step, so the
// site is crawled once; scripts/import/legacy-urls.json lists the addresses alone for the tests. One request at a time, a second apart, with a user agent that says who's
// asking. Run: `pnpm import:inventory`.
import { mkdir, writeFile } from 'node:fs/promises'
import * as cheerio from 'cheerio'

const origin = 'https://euro-alliance.net'
const userAgent = 'EuroAlliance-site-migration/1.0 (content migration to the new euro-alliance.net)'
const pause = 1000
const maxPages = 800
const out = new URL('./out/', import.meta.url)

type Image = { src: string; alt: string | null; width: string | null; height: string | null }

type Page = {
  url: string
  status: number
  finalUrl: string
  type: string
  title: string
  h1: string
  description: string
  links: string[]
  images: Image[]
  /** The saved HTML, in out/html/. */
  html?: string
}

const documentPattern = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|odt)$/i
const imagePattern = /\.(jpe?g|png|gif|webp|svg|bmp|ico)$/i

/** The page type from its address (docs/content-import.md § 5). */
export function pageType(path: string): string {
  const p = path.toLowerCase()
  if (p === '/' || p === '') return 'home'
  if (p.startsWith('/language-education/language-educations-for-adults')) return 'language-adults'
  if (p.startsWith('/language-education/language-education-for-students'))
    return 'language-students'
  if (p.includes('language-certificates')) return 'certificates'
  if (p.includes('entry-level-tests')) return 'entry-tests'
  if (p.startsWith('/language-education')) return 'language'
  if (p.startsWith('/vouchers')) return 'vouchers'
  if (p.includes('professions-and-specialty')) return 'professions'
  if (p.includes('pedagogical-specialists')) return 'teachers'
  if (p.includes('training-for-farmers')) return 'farmers'
  if (p.startsWith('/professional-education')) return 'vocational'
  if (p.startsWith('/computer-education')) return 'computer'
  if (p.startsWith('/translations')) return 'translations'
  if (/^\/news\/\d+/.test(p)) return 'news-article'
  if (p.startsWith('/news')) return 'news-listing'
  if (p.startsWith('/about-us')) return 'about'
  if (p.startsWith('/contact')) return 'contact'
  return 'other'
}

/** An internal address without its fragment; null for other hosts and non-page links. */
function internal(href: string, base: string): URL | null {
  if (!href || /^(mailto|tel|javascript):/i.test(href.trim())) return null
  let url: URL
  try {
    url = new URL(href.trim(), base)
  } catch {
    return null
  }
  if (url.hostname.replace(/^www\./, '') !== new URL(origin).hostname) return null
  url.hash = ''
  url.protocol = 'https:'
  url.hostname = new URL(origin).hostname
  return url
}

/** Pages are the same whatever the case of their path (the old server ignores it). */
const key = (url: URL) => `${url.pathname.toLowerCase().replace(/\/+$/, '') || '/'}${url.search}`

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  await mkdir(new URL('html/', out), { recursive: true })
  const queue: URL[] = [new URL('/', origin)]
  const seen = new Set<string>([key(queue[0])])
  const pages: Page[] = []
  const documents = new Map<string, { url: string; linkedFrom: string[] }>()

  while (queue.length > 0 && pages.length < maxPages) {
    const url = queue.shift()!
    let response: Response
    try {
      response = await fetch(url, { headers: { 'user-agent': userAgent }, redirect: 'follow' })
    } catch (error) {
      pages.push({
        url: url.href,
        status: 0,
        finalUrl: '',
        type: pageType(url.pathname),
        title: '',
        h1: '',
        description: `fetch failed: ${(error as Error).message}`,
        links: [],
        images: [],
      })
      await sleep(pause)
      continue
    }
    const type = response.headers.get('content-type') ?? ''
    const page: Page = {
      url: url.href,
      status: response.status,
      finalUrl: response.url,
      type: pageType(url.pathname),
      title: '',
      h1: '',
      description: '',
      links: [],
      images: [],
    }
    if (response.ok && type.includes('text/html')) {
      const html = await response.text()
      page.html = `${String(pages.length + 1).padStart(4, '0')}.html`
      await writeFile(new URL(`html/${page.html}`, out), html)
      const $ = cheerio.load(html)
      page.title = $('title').first().text().trim()
      page.h1 = $('h1').first().text().replace(/\s+/g, ' ').trim()
      page.description = $('meta[name="description"]').attr('content')?.trim() ?? ''
      const links = new Set<string>()
      $('a[href]').each((_, element) => {
        const link = internal($(element).attr('href') ?? '', response.url)
        if (!link) return
        if (documentPattern.test(link.pathname)) {
          const entry = documents.get(link.href) ?? { url: link.href, linkedFrom: [] }
          entry.linkedFrom.push(url.href)
          documents.set(link.href, entry)
          return
        }
        if (imagePattern.test(link.pathname)) return
        links.add(link.href)
        if (!seen.has(key(link))) {
          seen.add(key(link))
          queue.push(link)
        }
      })
      page.links = [...links]
      $('img[src]').each((_, element) => {
        const src = $(element).attr('src') ?? ''
        let absolute: string
        try {
          absolute = new URL(src, response.url).href
        } catch {
          return
        }
        page.images.push({
          src: absolute,
          alt: $(element).attr('alt') ?? null,
          width: $(element).attr('width') ?? null,
          height: $(element).attr('height') ?? null,
        })
      })
    } else {
      await response.arrayBuffer().catch(() => undefined)
    }
    pages.push(page)
    console.log(`${pages.length} ${page.status} ${page.type} ${url.pathname}${url.search}`)
    await sleep(pause)
  }

  const images = new Map<string, number>()
  for (const page of pages)
    for (const image of page.images) images.set(image.src, (images.get(image.src) ?? 0) + 1)
  const withoutAlt = pages
    .flatMap((page) => page.images)
    .filter((image) => !image.alt?.trim()).length
  const counts = {
    pages: pages.length,
    ok: pages.filter((page) => page.status === 200).length,
    byType: Object.fromEntries(
      [...new Set(pages.map((page) => page.type))].map((type) => [
        type,
        pages.filter((page) => page.type === type).length,
      ]),
    ),
    imageTags: pages.reduce((sum, page) => sum + page.images.length, 0),
    uniqueImages: images.size,
    imageTagsWithoutAlt: withoutAlt,
    documents: documents.size,
    unvisited: queue.length,
  }
  await mkdir(out, { recursive: true })
  await writeFile(
    new URL('inventory.json', out),
    `${JSON.stringify({ crawledAt: new Date().toISOString(), origin, counts, pages, documents: [...documents.values()] }, null, 2)}\n`,
  )
  // The old addresses alone, committed: the redirect tests read them (the inventory stays local).
  await writeFile(
    new URL('./legacy-urls.json', import.meta.url),
    `${JSON.stringify(
      pages.map(({ url, status, type, title }) => ({ url, status, type, title })),
      null,
      2,
    )}\n`,
  )
  console.log(JSON.stringify(counts, null, 2))
}

await main()
