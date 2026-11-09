// The news covers and the homepage's small photo picked in the local photo picker
// (out/photo-decisions.json): the old cover, an Unsplash photo downloaded by hand into
// in/unsplash/ (found by its id in the file name), or none. Local only: staging is shown without
// them (the user, 02.11.2026), and the content itself comes from `pnpm seed:staging`. Run after it:
// `pnpm import:covers` (IMPORT_DRY_RUN=1 writes nothing). Alt texts are drafts (altReviewed: false)
// unless the old site had one.
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { typeset } from './html-to-lexical'

const out = new URL('./out/', import.meta.url)
const unsplashDir = new URL('./in/unsplash/', import.meta.url)
const userAgent = 'EuroAlliance-site-migration/1.0 (content migration to the new euro-alliance.net)'
const dryRun = process.env.IMPORT_DRY_RUN === '1'

type Decision = {
  title: string
  legacyUrl: string | null
  choice: 'original' | 'unsplash' | 'none'
  original?: { src: string }
  textInImage?: boolean
  unsplash?: { id: string; page: string; photographer: string }
}

type MediaFields = { alt: string; kind: 'photo'; credit?: string; textInImage?: boolean }

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

let lastRequest = 0
/** A file from the old site, cached in out/files/ (one request a second at most). */
async function download(url: string): Promise<{ data: Buffer; type: string } | null> {
  const name = createHash('sha1').update(url).digest('hex')
  const cached = new URL(`files/${name}`, out)
  if (existsSync(cached)) {
    const meta = JSON.parse(await readFile(new URL(`files/${name}.json`, out), 'utf8'))
    return { data: await readFile(cached), type: meta.type }
  }
  await new Promise((resolve) => setTimeout(resolve, Math.max(0, lastRequest + 1000 - Date.now())))
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

/** Uploads a file to media once (by its name); the alt text an editor reviewed stays. */
async function upload(
  payload: Payload,
  file: { data: Buffer; type: string },
  name: string,
  fields: MediaFields,
): Promise<number | null> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: name } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) return existing.docs[0].id
  if (dryRun) return null
  const doc = await payload.create({
    collection: 'media',
    data: { altReviewed: false, ...fields },
    file: { data: file.data, mimetype: file.type, name, size: file.data.length },
  })
  return doc.id
}

const file = new URL('photo-decisions.json', out)
if (!existsSync(file)) {
  console.log('No out/photo-decisions.json: nothing to do.')
  process.exit(0)
}
const payload = await getPayload({ config })
const { slots } = JSON.parse(await readFile(file, 'utf8')) as { slots: Record<string, Decision> }
const inventory = JSON.parse(await readFile(new URL('inventory.json', out), 'utf8')) as {
  pages: { images?: { src: string; alt: string | null }[] }[]
}
const altOf = new Map<string, string>()
for (const page of inventory.pages)
  for (const image of page.images ?? [])
    if (image.alt?.trim()) altOf.set(image.src, typeset(image.alt.trim()))
const downloads = existsSync(unsplashDir) ? await readdir(unsplashDir) : []
const done = {
  original: 0,
  unsplash: 0,
  none: 0,
  notDownloaded: [] as string[],
  notFound: [] as string[],
}

for (const [slot, decision] of Object.entries(slots)) {
  const home = slot === 'home:photo-b'
  const drafted = home
    ? 'Снимка към началната страница'
    : `Снимка към новината „${typeset(decision.title)}“`
  let cover: number | null = null
  if (decision.choice === 'original' && decision.original) {
    const old = await download(decision.original.src)
    if (!old) continue
    const ext = extensions[old.type] ?? 'jpg'
    const name = `import-${createHash('sha256').update(old.data).digest('hex').slice(0, 16)}.${ext}`
    cover = await upload(payload, old, name, {
      alt: altOf.get(decision.original.src) || drafted,
      kind: 'photo',
      textInImage: Boolean(decision.textInImage),
    })
    done.original++
  } else if (decision.choice === 'unsplash' && decision.unsplash) {
    const { id, page, photographer } = decision.unsplash
    const name = downloads.find((download) => download.includes(id))
    if (!name) {
      done.notDownloaded.push(`${decision.title}: ${page}`)
      continue
    }
    const ext = name.split('.').pop()!.toLowerCase()
    cover = await upload(
      payload,
      {
        data: await readFile(new URL(name, unsplashDir)),
        type: ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg',
      },
      `unsplash-${id}.${ext}`,
      { alt: drafted, kind: 'photo', credit: `${photographer} / Unsplash` },
    )
    done.unsplash++
  } else done.none++
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
    done.notFound.push(decision.title)
    continue
  }
  await payload.update({
    collection: 'news',
    id: found.docs[0].id,
    locale: 'bg',
    data: { cover } as never,
  })
}

console.log(
  `Covers${dryRun ? ' (dry run)' : ''}: ${done.original} old, ${done.unsplash} Unsplash, ${done.none} none.`,
)
if (done.notDownloaded.length)
  console.log(`Unsplash photos not yet in in/unsplash/:\n  ${done.notDownloaded.join('\n  ')}`)
if (done.notFound.length) console.log(`No such article:\n  ${done.notFound.join('\n  ')}`)
process.exit(0)
