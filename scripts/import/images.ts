// The old site's images, sorted by where they're used, before any of them is imported (PR 21):
// news covers, images inside news texts, regular pages, course pages, and the site's chrome
// (header, footer, partner strip, form captchas). Reads the crawl (pnpm import:inventory),
// downloads each image once into out/files/ (the cache run.ts uses, one request a second), and
// writes out/images.json and a contact sheet, out/contact-sheet/index.html, with a thumbnail, the
// pixel size and the source page of every image. Run: `pnpm import:images`.
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import * as cheerio from 'cheerio'
import sharp from 'sharp'
import { newsSlots } from '../../src/lib/media/slots.ts'

const out = new URL('./out/', import.meta.url)
const sheet = new URL('contact-sheet/', out)
const userAgent = 'EuroAlliance-site-migration/1.0 (content migration to the new euro-alliance.net)'

export type Group = 'news-cover' | 'news-body' | 'course' | 'page' | 'chrome'

const groups: { id: Group; title: string; note: string }[] = [
  {
    id: 'news-cover',
    title: 'News: featured image',
    note: 'The banner at the top of an article (also its thumbnail on the listing, the sidebar and the homepage).',
  },
  {
    id: 'news-body',
    title: 'News: inside the article text',
    note: 'Images placed in the body of an article.',
  },
  {
    id: 'course',
    title: 'Course pages',
    note: 'Images of courses: the /Courses listing (the course pages themselves have none).',
  },
  {
    id: 'page',
    title: 'Regular pages',
    note: 'Images in the content of every other page (home, programmes, About, translations…).',
  },
  {
    id: 'chrome',
    title: 'Site chrome',
    note: 'Logos, the partner strip, header and footer art, buttons drawn as pictures, form captchas.',
  },
]

// When one image is used in several places, it belongs to the first group that applies.
const priority: Group[] = ['news-cover', 'news-body', 'chrome', 'course', 'page']

type Use = { page: string; title: string; where: string; group: Group; linked: boolean }

export type ImageEntry = {
  src: string
  group: Group
  uses: Use[]
  /** Resized copies the old CMS served (…<hash>237x147.png), folded into the original. */
  variants: string[]
  width?: number
  height?: number
  format?: string
  bytes?: number
  frames?: number
  thumb?: string
  /** For news covers: how many articles use this same image. */
  coverOf?: number
  /** The content's hash: the old site has some files under several addresses. */
  sha256?: string
  /** How many other images in the same group are the same file. */
  copies?: number
  error?: string
}

type InventoryPage = { url: string; type: string; title: string; h1: string; html?: string }

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const pathOf = (url: string) => decodeURI(new URL(url).pathname)
const isEnglish = (url: string) => /^\/en(\/|$)/i.test(pathOf(url))
const hash = (url: string) => createHash('sha1').update(url).digest('hex')
let lastRequest = 0

/**
 * A file from the old site, cached in out/files/ under the same names as run.ts uses; the HTTP
 * status when it fails (0 without an answer).
 */
async function download(url: string): Promise<Buffer | number> {
  const cached = new URL(`files/${hash(url)}`, out)
  if (existsSync(cached)) return readFile(cached)
  await sleep(Math.max(0, lastRequest + 1000 - Date.now()))
  lastRequest = Date.now()
  const response = await fetch(url, { headers: { 'user-agent': userAgent } }).catch(() => null)
  if (!response?.ok) return response?.status ?? 0
  const data = Buffer.from(await response.arrayBuffer())
  const type = response.headers.get('content-type')?.split(';')[0] ?? 'application/octet-stream'
  await mkdir(new URL('files/', out), { recursive: true })
  await writeFile(cached, data)
  await writeFile(new URL(`files/${hash(url)}.json`, out), JSON.stringify({ url, type }))
  return data
}

/** Where on the page an image sits, and so its group. */
function placeOf(
  $: cheerio.CheerioAPI,
  img: Parameters<cheerio.CheerioAPI>[0],
  kind: string,
): { group: Group; where: string } {
  const el = $(img)
  const inside = (selector: string) => el.closest(selector).length > 0
  if (/\/captcha\//.test(el.attr('src') ?? '')) return { group: 'chrome', where: 'form captcha' }
  if (inside('.header-container')) return { group: 'chrome', where: 'header' }
  if (inside('.footer-top, .footer, footer')) return { group: 'chrome', where: 'footer' }
  if (inside('.owl-carousel.clients')) return { group: 'chrome', where: 'partner strip' }
  if (kind === 'article') {
    if (inside('.blogpost-content .carousel-inner')) return { group: 'news-cover', where: 'cover' }
    if (inside('.blogpost-content')) return { group: 'news-body', where: 'article text' }
    if (inside('.sidebar')) return { group: 'news-cover', where: 'sidebar thumbnail' }
  }
  if (kind === 'listing' && inside('article.blogpost'))
    return { group: 'news-cover', where: 'listing thumbnail' }
  if (kind === 'home' && inside('.block .media'))
    return { group: 'news-cover', where: 'homepage news thumbnail' }
  if (kind === 'course') return { group: 'course', where: 'course page' }
  if (kind === 'courses' && inside('.listing-item'))
    return { group: 'course', where: 'course listing thumbnail' }
  if (inside('.slider-banner-container')) return { group: 'page', where: 'homepage slider' }
  return { group: 'page', where: 'page content' }
}

const variantPattern = /^(.*\/_assets\/[0-9a-f]{32})\d+x\d+(\.[a-z]+)$/i

/** Form captchas: a new image on every visit, nothing to import. */
const isCaptcha = (image: { src: string }) => /\/captcha\//.test(image.src)

/** A wide, short image that's always a link, like «ЗАПИШЕТЕ СЕ ТУК»: a button drawn as a picture. */
const isButton = (image: ImageEntry) =>
  !!image.width &&
  !!image.height &&
  image.width / image.height >= 4 &&
  image.height <= 200 &&
  image.uses.every((use) => use.linked || use.group === 'chrome')

async function main() {
  const inventory = JSON.parse(await readFile(new URL('inventory.json', out), 'utf8')) as {
    pages: InventoryPage[]
  }
  const images = new Map<string, ImageEntry>()
  const groupsOf = new Map<string, Set<Group>>()
  const covers = new Map<string, Set<string>>()

  for (const page of inventory.pages) {
    if (!page.html) continue
    const path = pathOf(page.url)
      .toLowerCase()
      .replace(/^\/en(?=\/)/, '')
    const kind = /^\/news\/\d+/.test(path)
      ? 'article'
      : /^\/courses\/\d+/.test(path)
        ? 'course'
        : path === '/courses'
          ? 'courses'
          : path.startsWith('/news')
            ? 'listing'
            : path === '/' || path === '/en'
              ? 'home'
              : 'page'
    const $ = cheerio.load(await readFile(new URL(`html/${page.html}`, out), 'utf8'))
    const title = page.h1 || page.title.replace(/^Евро Алианс\s*\/\/\s*/, '')
    for (const img of $('img[src]').toArray()) {
      let src: string
      try {
        src = new URL($(img).attr('src')!.trim(), page.url).href
      } catch {
        continue
      }
      const variant = src.match(variantPattern)
      const original = variant ? `${variant[1]}${variant[2]}` : src
      const { group, where } = placeOf($, img, kind)
      const entry = images.get(original) ?? { src: original, group, uses: [], variants: [] }
      if (variant && !entry.variants.includes(src)) entry.variants.push(src)
      if (!entry.uses.some((use) => use.page === page.url && use.where === where))
        entry.uses.push({
          page: page.url,
          title,
          where,
          group,
          linked: $(img).closest('a').length > 0,
        })
      images.set(original, entry)
      groupsOf.set(original, (groupsOf.get(original) ?? new Set()).add(group))
      if (where === 'cover' && !isEnglish(page.url))
        covers.set(original, (covers.get(original) ?? new Set()).add(page.url))
    }
  }

  await mkdir(new URL('thumbs/', sheet), { recursive: true })
  let done = 0
  for (const entry of images.values()) {
    entry.group = priority.find((group) => groupsOf.get(entry.src)!.has(group))!
    if (covers.has(entry.src)) entry.coverOf = covers.get(entry.src)!.size
    // The use that decided the group first (the article, not the listing), Bulgarian before the
    // English copies.
    const rank = (use: Use) =>
      Number(isEnglish(use.page)) * 2 +
      Number(
        use.group !== entry.group || /thumbnail/.test(use.where) !== (entry.group === 'course'),
      )
    entry.uses.sort((a, b) => rank(a) - rank(b))
    done++
    if (isCaptcha(entry)) {
      entry.error = 'captcha, generated per visit: not downloaded'
      continue
    }
    if (new URL(entry.src).hostname.replace(/^www\./, '') !== 'euro-alliance.net') {
      entry.error = `hotlinked from ${new URL(entry.src).hostname}: not downloaded`
      continue
    }
    const data = await download(entry.src)
    if (typeof data === 'number') {
      entry.error = data ? `HTTP ${data} on the old site (broken there too)` : 'no answer'
      continue
    }
    entry.bytes = data.length
    entry.sha256 = createHash('sha256').update(data).digest('hex')
    try {
      const meta = await sharp(data, { animated: true }).metadata()
      entry.width = meta.width
      entry.height = meta.pageHeight ?? meta.height
      entry.format = meta.format
      if ((meta.pages ?? 1) > 1) entry.frames = meta.pages
      entry.thumb = `thumbs/${hash(entry.src)}.webp`
      if (!existsSync(new URL(entry.thumb, sheet)))
        await sharp(data)
          .rotate()
          .resize(480, 360, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 78 })
          .toFile(new URL(entry.thumb, sheet).pathname)
    } catch (error) {
      entry.error = `not an image sharp can read (${(error as Error).message})`
    }
    if (entry.group !== 'chrome' && isButton(entry)) {
      entry.group = 'chrome'
      for (const use of entry.uses) use.where = 'button image'
    }
    if (done % 25 === 0) console.log(`${done}/${images.size}`)
  }

  const list = [...images.values()]
  for (const entry of list)
    if (entry.sha256)
      entry.copies =
        list.filter((other) => other.sha256 === entry.sha256 && other.group === entry.group)
          .length - 1
  await writeFile(new URL('images.json', out), `${JSON.stringify(list, null, 2)}\n`)
  await writeFile(new URL('index.html', sheet), contactSheet(list))
  console.log(summary(list))
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted.length ? sorted[Math.floor((sorted.length - 1) / 2)] : 0
}

/** Count, typical size and range of one group. */
function stats(all: ImageEntry[]) {
  const list = all.filter((image) => !isCaptcha(image))
  const captchas = all.length - list.length
  const sized = list.filter((image) => image.width && image.height)
  const widths = sized.map((image) => image.width!)
  const heights = sized.map((image) => image.height!)
  const fits = (slot: { width: number; height: number }, scale = 1) =>
    sized.filter(
      (image) => image.width! >= slot.width * scale && image.height! >= slot.height * scale,
    ).length
  const files = new Set(list.map((image) => image.sha256 ?? image.src)).size
  return {
    count: list.length,
    files,
    captchas,
    label: `${list.length}${files < list.length ? ` (${files} distinct files)` : ''}${captchas ? ` (+ ${captchas} form captchas)` : ''}`,
    sized: sized.length,
    median: sized.length ? `${median(widths)} × ${median(heights)}` : '–',
    widths: sized.length ? `${Math.min(...widths)}–${Math.max(...widths)}` : '–',
    fits: {
      card: fits(newsSlots.card),
      card2x: fits(newsSlots.card, 2),
      lead: fits(newsSlots.lead),
      banner: fits(newsSlots.banner),
      banner2x: fits(newsSlots.banner, 2),
    },
  }
}

function summary(list: ImageEntry[]): string {
  const lines = ['| Group | Images | Typical (median) | Widths |', '|---|---|---|---|']
  for (const group of groups) {
    const s = stats(list.filter((image) => image.group === group.id))
    lines.push(`| ${group.title} | ${s.label} | ${s.median} | ${s.widths} |`)
  }
  const news = stats(list.filter((image) => image.group === 'news-cover'))
  lines.push(
    '',
    `News covers that fill, without upscaling: a card (${newsSlots.card.width} × ${newsSlots.card.height}) ${news.fits.card}, at 2× ${news.fits.card2x}; the lead story (${newsSlots.lead.width} × ${newsSlots.lead.height}) ${news.fits.lead}; the article banner (${newsSlots.banner.width} × ${newsSlots.banner.height}) ${news.fits.banner}, at 2× ${news.fits.banner2x}.`,
  )
  return lines.join('\n')
}

const escape = (text: string) =>
  text.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c as '&' | '<' | '>' | '"'],
  )

function contactSheet(list: ImageEntry[]): string {
  const sections = groups.map((group) => {
    const all = list.filter((image) => image.group === group.id)
    const items = all
      .filter((image) => !isCaptcha(image))
      .sort((a, b) => (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0))
    const s = stats(all)
    const cards = items.map((image) => {
      const first = image.uses[0]
      const others = new Set(image.uses.map((use) => use.page)).size - 1
      const places = [...new Set(image.uses.map((use) => use.where))].join(', ')
      const size = image.width ? `${image.width} × ${image.height}` : '?'
      const flags = [
        image.frames ? `animated, ${image.frames} frames` : '',
        image.coverOf && image.coverOf > 1 ? `cover of ${image.coverOf} articles` : '',
        image.copies
          ? `the same file as ${image.copies} other${image.copies > 1 ? 's' : ''} here`
          : '',
        image.variants.length ? `+ ${image.variants.length} resized copies` : '',
        image.error ?? '',
      ].filter(Boolean)
      const fit =
        group.id === 'news-cover' && image.width && image.height
          ? (['card', 'lead', 'banner'] as const)
              .map((slot) =>
                image.width! >= newsSlots[slot].width && image.height! >= newsSlots[slot].height
                  ? `<span class="ok">${slot}</span>`
                  : `<span class="no">${slot}</span>`,
              )
              .join(' ')
          : ''
      return `<figure>
  <a class="thumb" href="${escape(image.src)}" target="_blank" rel="noreferrer">${
    image.thumb
      ? `<img src="${image.thumb}" alt="" loading="lazy" width="240" height="180">`
      : '<span>no preview</span>'
  }</a>
  <figcaption>
    <strong>${size}</strong> <span class="muted">${image.format ?? ''} ${image.bytes ? `${Math.round(image.bytes / 1024)} KB` : ''}</span>
    ${fit ? `<div class="fit">${fit}</div>` : ''}
    <a href="${escape(first.page)}" target="_blank" rel="noreferrer">${escape(first.title || pathOf(first.page))}</a>${others > 0 ? ` <span class="muted">+ ${others} more page${others > 1 ? 's' : ''}</span>` : ''}
    <div class="muted">${escape(places)}</div>
    ${flags.length ? `<div class="flag">${escape(flags.join(' · '))}</div>` : ''}
  </figcaption>
</figure>`
    })
    return `<section id="${group.id}">
  <h2>${group.title} <span class="count">${s.label}</span></h2>
  <p class="muted">${group.note} Typical size ${s.median} px (median); widths ${s.widths} px.${s.captchas ? ` The ${s.captchas} form captchas (one per form page, new on every visit) aren't shown.` : ''}</p>
  <div class="grid">${cards.join('\n')}</div>
</section>`
  })
  const news = stats(list.filter((image) => image.group === 'news-cover'))
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Old site images</title>
<style>
  :root { --bg: #f7f3ec; --card: #fff; --text: #14202e; --muted: #5a6676; --line: #dce1e7; --ok: #1d6b3a; --no: #a3261b; color-scheme: light dark; }
  @media (prefers-color-scheme: dark) { :root { --bg: #11161d; --card: #1b222c; --text: #e8ecf1; --muted: #9aa6b5; --line: #2c3542; --ok: #6fcf8f; --no: #ff8a7a; } }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px 16px 64px; background: var(--bg); color: var(--text); font: 14px/1.45 system-ui, sans-serif; }
  header, section { max-width: 1400px; margin: 0 auto; }
  h1 { font-size: 28px; margin: 0 0 4px; }
  h2 { font-size: 20px; margin: 40px 0 4px; }
  nav { display: flex; flex-wrap: wrap; gap: 8px 16px; margin: 12px 0; }
  a { color: inherit; }
  .count { font-weight: 400; color: var(--muted); }
  .muted { color: var(--muted); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 12px; }
  figure { margin: 0; background: var(--card); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
  .thumb { display: grid; place-items: center; height: 180px; background: repeating-conic-gradient(var(--line) 0 25%, transparent 0 50%) 0 0 / 16px 16px; }
  .thumb img { max-width: 100%; max-height: 180px; width: auto; height: auto; display: block; }
  figcaption { padding: 8px 10px 10px; overflow-wrap: anywhere; }
  .fit { margin: 2px 0; font-size: 12px; }
  .ok { color: var(--ok); } .ok::before { content: "✓ "; }
  .no { color: var(--no); text-decoration: line-through; }
  .flag { margin-top: 4px; font-size: 12px; color: var(--no); }
  table { border-collapse: collapse; margin-top: 12px; }
  td, th { border-bottom: 1px solid var(--line); padding: 4px 12px 4px 0; text-align: left; }
</style>
</head>
<body>
<header>
  <h1>Images on euro-alliance.net</h1>
  <p class="muted">${list.length} images from the crawl, each counted once (resized copies are folded into their original). Sorted by size, largest first. A thumbnail opens the original on the old site.</p>
  <table>
    <tr><th>Group</th><th>Images</th><th>Typical (median)</th><th>Widths</th></tr>
    ${groups
      .map((group) => {
        const s = stats(list.filter((image) => image.group === group.id))
        return `<tr><td><a href="#${group.id}">${group.title}</a></td><td>${s.label}</td><td>${s.median}</td><td>${s.widths}</td></tr>`
      })
      .join('\n    ')}
  </table>
  <p class="muted">News covers marked against the design's slots at 1× (no upscaling): card ${newsSlots.card.width} × ${newsSlots.card.height} (${news.fits.card} fit), lead story ${newsSlots.lead.width} × ${newsSlots.lead.height} (${news.fits.lead}), article banner ${newsSlots.banner.width} × ${newsSlots.banner.height} (${news.fits.banner}).</p>
</header>
${sections.join('\n')}
</body>
</html>
`
}

await main()
