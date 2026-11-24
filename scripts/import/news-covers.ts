// The covers of the old news (Trello #13; the user, 23.11.2026): which picture each article gets.
// Reads the crawl's images (out/images.json, `pnpm import:images`), the decision taken for each
// distinct old cover (news-cover-choices.json) and the free photos picked for the themes of the
// ones that are replaced (news-cover-photos.json), and writes seed/news-covers.json, which
// `pnpm seed:staging` reads. Run: `pnpm import:news-covers`.
//
// - The client's own pictures aren't committed (the repository is public and some show
//   children): the seed downloads each from the old site when it runs and checks it against the
//   sha256 written here.
// - The replacement photos are committed in seed/media/covers/ (free to use, no personal data).
// - Figma's seven covers stay (figma-covers.json); a cover too small for a card stays out.
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { newsSlots } from '../../src/lib/media/slots.ts'
import type { NewsCover, NewsCovers } from '../seed/news-covers.ts'

const here = new URL('./', import.meta.url)
const root = new URL('../../', import.meta.url)
const read = async <T>(url: URL) => JSON.parse(await readFile(url, 'utf8')) as T

type CrawledImage = {
  src: string
  group: string
  sha256: string
  width: number
  height: number
  format: string
  bytes: number
  uses: { page: string; title: string; where: string }[]
}
type Choice =
  | { use: 'own'; kind: 'photo' | 'project' | 'graphic'; textInImage?: boolean }
  | { use: 'replace'; theme: string }
  | { use: 'none'; why: string }
type Photo = {
  id: string
  page: string
  photographer: string
  file: string
  sha256: string
  width: number
  height: number
  alt: string
}

const mimetypes: Record<string, string> = { jpeg: 'image/jpeg', png: 'image/png' }

const images = (await read<CrawledImage[]>(new URL('out/images.json', here))).filter(
  (image) => image.group === 'news-cover',
)
const { images: choices } = await read<{ images: Record<string, Choice> }>(
  new URL('news-cover-choices.json', here),
)
const { themes } = await read<{ themes: Record<string, Photo[]> }>(
  new URL('news-cover-photos.json', here),
)
const figma = new Set(
  (await read<{ legacyId: string }[]>(new URL('figma-covers.json', here))).map((cover) =>
    Number(cover.legacyId),
  ),
)
const news = await read<{ legacyId: number; title: string }[]>(new URL('seed/news.json', root))
const titles = new Map(news.map((article) => [article.legacyId, article.title]))

// Every replacement photo is in the repository, and is the file that was looked at.
for (const [theme, photos] of Object.entries(themes)) {
  for (const photo of photos) {
    const file = new URL(`seed/media/covers/${photo.file}`, root)
    if (!existsSync(file)) throw new Error(`${theme}: seed/media/covers/${photo.file} is missing.`)
    const sha = createHash('sha256')
      .update(await readFile(file))
      .digest('hex')
    if (sha !== photo.sha256) throw new Error(`${theme}: ${photo.file} isn't the file recorded.`)
  }
}

/** The old cover of each article: the image used as «cover» on its own page. */
const coverOf = new Map<number, CrawledImage>()
for (const image of images) {
  for (const use of image.uses) {
    const id = Number(/\/News\/(\d+)(\/|$)/.exec(use.page)?.[1])
    if (use.where === 'cover' && id) coverOf.set(id, image)
  }
}

const covers: NewsCover[] = []
const without: NewsCovers['without'] = []
const turn = new Map<string, number>()

for (const { legacyId, title } of [...news].sort((a, b) => a.legacyId - b.legacyId)) {
  if (figma.has(legacyId)) continue
  const image = coverOf.get(legacyId)
  const choice = image && choices[image.sha256]
  const leave = (reason: string) => without.push({ legacyId, title, reason })

  if (!image) leave('no cover on the old site')
  else if (!choice) leave('a cover nobody has looked at yet (news-cover-choices.json)')
  else if (choice.use === 'none') leave(choice.why)
  else if (choice.use === 'own') {
    const mimetype = mimetypes[image.format]
    if (!mimetype) leave(`the old cover is a ${image.format}`)
    else if (image.width < newsSlots.card.width || image.height < newsSlots.card.height)
      leave(`the old cover is ${image.width} × ${image.height}, too small for a card`)
    else
      covers.push({
        legacyId,
        source: 'old-site',
        url: image.src,
        sha256: image.sha256,
        mimetype,
        width: image.width,
        height: image.height,
        // A draft for an editor to review (altReviewed: false): the old site has no alt texts.
        alt: `Изображение към новината «${title}»`,
        textInImage: choice.textInImage ?? false,
      })
  } else {
    const photos = themes[choice.theme] ?? []
    if (photos.length === 0) leave(`no photo picked for the theme «${choice.theme}»`)
    else {
      // Articles of one theme take its photos in turn, so neighbours don't all look alike.
      const n = turn.get(choice.theme) ?? 0
      turn.set(choice.theme, n + 1)
      const photo = photos[n % photos.length]!
      covers.push({
        legacyId,
        source: 'unsplash',
        file: `seed/media/covers/${photo.file}`,
        theme: choice.theme,
        credit: `${photo.photographer} / Unsplash`,
        page: photo.page,
        alt: photo.alt,
        textInImage: false,
      })
    }
  }
}

for (const id of coverOf.keys()) {
  if (!titles.has(id)) console.warn(`/News/${id} has a cover but isn't in seed/news.json.`)
}

await writeFile(
  new URL('seed/news-covers.json', root),
  `${JSON.stringify({ covers, without } satisfies NewsCovers, null, 2)}\n`,
)
const count = (source: string) => covers.filter((cover) => cover.source === source).length
console.log(
  `seed/news-covers.json: ${covers.length} covers (${count('old-site')} from the old site, ${count('unsplash')} replaced), ${without.length} articles without one, ${figma.size} left to Figma.`,
)
