import { readFile } from 'node:fs/promises'

// The covers of the old news (seed/news-covers.json, written by `pnpm import:news-covers`):
// either the client's own picture, downloaded from the old site when the seed runs and checked
// against its sha256 (those files aren't in the public repository), or a free photo that
// replaces a stock one, committed in seed/media/covers/.

export type NewsCover = { legacyId: number; alt: string; textInImage: boolean } & (
  | {
      source: 'old-site'
      url: string
      sha256: string
      mimetype: string
      width: number
      height: number
    }
  | { source: 'unsplash'; file: string; theme: string; credit: string; page: string }
)

export type NewsCovers = {
  covers: NewsCover[]
  /** Articles left without a cover, and why: for the report. */
  without: { legacyId: number; title: string; reason: string }[]
}

export async function readNewsCovers(): Promise<NewsCovers> {
  const file = new URL('../../seed/news-covers.json', import.meta.url)
  return JSON.parse(await readFile(file, 'utf8')) as NewsCovers
}

const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png' }

/** The media filename of a cover: the same picture on several articles is one upload. */
export function coverFilename(cover: NewsCover): string {
  return cover.source === 'old-site'
    ? `news-cover-${cover.sha256.slice(0, 12)}.${extensions[cover.mimetype] ?? 'jpg'}`
    : `news-cover-${cover.file.split('/').pop()}`
}
