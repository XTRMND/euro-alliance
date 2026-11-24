import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { coverFilename, type NewsCovers } from '../../scripts/seed/news-covers'

// The covers of the old news (seed/news-covers.json, Trello #13): the client's own pictures are
// fetched from the old site when the seed runs and are never in the repository; the photos that
// replace stock ones are committed.

const root = path.resolve(__dirname, '../..')
const json = <T>(file: string) => JSON.parse(readFileSync(path.join(root, file), 'utf8')) as T

const { covers, without } = json<NewsCovers>('seed/news-covers.json')
const news = json<{ legacyId: number }[]>('seed/news.json')
const figma = json<{ legacyId: string }[]>('scripts/import/figma-covers.json').map((cover) =>
  Number(cover.legacyId),
)
const { themes } = json<{ themes: Record<string, { file: string; sha256: string }[]> }>(
  'scripts/import/news-cover-photos.json',
)

describe('the old news’ covers', () => {
  it('accounts for every article once: a picked cover, Figma’s, or a reason for none', () => {
    const ids = [...covers.map((c) => c.legacyId), ...without.map((w) => w.legacyId), ...figma]
    expect(new Set(ids).size).toBe(ids.length)
    expect([...ids].sort((a, b) => a - b)).toEqual(
      news.map((n) => n.legacyId).sort((a, b) => a - b),
    )
    for (const article of without) expect(article.reason).not.toBe('')
  })

  it('takes the client’s own pictures from the old site, by address and checksum', () => {
    const own = covers.filter((cover) => cover.source === 'old-site')
    expect(own.length).toBeGreaterThan(0)
    for (const cover of own) {
      expect(cover.url).toMatch(/^https:\/\/euro-alliance\.net\/application\/site\/_assets\//)
      expect(cover.sha256).toMatch(/^[0-9a-f]{64}$/)
      expect(['image/jpeg', 'image/png']).toContain(cover.mimetype)
      expect(coverFilename(cover)).toMatch(/^news-cover-[0-9a-f]{12}\.(jpg|png)$/)
      expect(cover.alt).not.toBe('')
    }
  })

  it('has every replacement photo in the repository, and nothing else in its folder', () => {
    const recorded = Object.values(themes).flat()
    const folder = path.join(root, 'seed/media/covers')
    expect(readdirSync(folder).sort()).toEqual(recorded.map((photo) => photo.file).sort())
    for (const photo of recorded) {
      const sha = createHash('sha256')
        .update(readFileSync(path.join(folder, photo.file)))
        .digest('hex')
      expect(sha, photo.file).toBe(photo.sha256)
    }
    for (const cover of covers) {
      if (cover.source !== 'unsplash') continue
      expect(existsSync(path.join(root, cover.file)), cover.file).toBe(true)
      expect(cover.textInImage).toBe(false)
      expect(cover.credit).toMatch(/ \/ Unsplash$/)
    }
  })
})
