import { slugify } from './slug'

// The news pages (PR 15): the listing's pages, the article's outline and reading time, and which
// articles the article page shows beside and under it.

/** Page 1 shows the newest as the lead story and the next six in the grid; later pages six. */
export const newsGridSize = 6

export function newsPageCount(total: number): number {
  return total <= newsGridSize + 1 ? 1 : 1 + Math.ceil((total - newsGridSize - 1) / newsGridSize)
}

/** The items of a page: the lead story (page 1 only) and the grid. */
export function newsPage<T>(all: T[], page: number): { feature: T | null; grid: T[] } {
  if (page === 1) return { feature: all[0] ?? null, grid: all.slice(1, newsGridSize + 1) }
  const start = newsGridSize + 1 + (page - 2) * newsGridSize
  return { feature: null, grid: all.slice(start, start + newsGridSize) }
}

type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  children?: LexicalNode[]
}

export type LexicalBody = { root: LexicalNode } | null | undefined

/** The plain text of a rich text node and its children. */
export function nodeText(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  return (node.children ?? []).map(nodeText).join(node.type === 'root' ? '\n' : '')
}

/** Ids for headings in order: their slug, numbered when two are the same. */
export function headingIds(texts: string[]): string[] {
  const seen = new Map<string, number>()
  return texts.map((text) => {
    const base = slugify(text) || 'razdel'
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    return count === 1 ? base : `${base}-${count}`
  })
}

/** The article's H2s with their ids, for the contents rail. */
export function newsOutline(body: LexicalBody): { id: string; text: string }[] {
  const texts = (body?.root.children ?? [])
    .filter((node) => node.type === 'heading' && node.tag === 'h2')
    .map((node) => nodeText(node).trim())
  const ids = headingIds(texts)
  return texts.map((text, i) => ({ id: ids[i], text }))
}

/** Minutes to read, at 200 words a minute, at least one. */
export function readingMinutes(...texts: (string | null | undefined)[]): number {
  const words = texts
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length
  return Math.max(1, Math.ceil(words / 200))
}

/**
 * «Актуални новини»: the three latest without the article itself. «Още новини»: its related
 * articles, then the ones just older than it, then the newest, three in all, never itself.
 * `all` is newest first.
 */
export function newsAround<T extends { id: number }>(
  all: T[],
  current: T,
  related: T[] = [],
): { latest: T[]; more: T[] } {
  const others = all.filter((item) => item.id !== current.id)
  const index = all.findIndex((item) => item.id === current.id)
  const older = index < 0 ? [] : all.slice(index + 1)
  const more: T[] = []
  for (const item of [...related, ...older, ...others]) {
    if (more.length === 3) break
    if (item.id !== current.id && !more.some((chosen) => chosen.id === item.id)) more.push(item)
  }
  return { latest: others.slice(0, 3), more }
}
