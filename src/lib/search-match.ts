import type { SearchRecord, SearchType } from './search-records'
import { searchTerms } from './search-text'

// The search's matching and ranking (src/lib/search.ts), over records and nothing else, so it's
// unit-tested without a database.

export type SearchHit = {
  /** The record's source («news:12», «about»): unique, the list key. */
  id: string
  type: SearchType
  title: string
  path: string | null
  excerpt: string | null
  text: string | null
  url: string
  sourceId: number | null
}

/** Typo tolerance: how close the query must be to a run of words of the title or excerpt. */
const similarity = 0.5

const wordsOf = (text: string) => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []

/** A word's trigrams as pg_trgm counts them: two spaces before the word, one after. */
function trigrams(word: string): string[] {
  const padded = `  ${word} `
  const out: string[] = []
  for (let i = 0; i + 3 <= padded.length; i++) out.push(padded.slice(i, i + 3))
  return out
}

/**
 * How close `query` is to the closest run of consecutive words in `text`, 0 to 1: the trigrams
 * they share over all the trigrams of both (pg_trgm's strict word similarity).
 */
export function wordSimilarity(query: string, text: string): number {
  const wanted = new Set(wordsOf(query).flatMap(trigrams))
  if (wanted.size === 0) return 0
  const words = wordsOf(text).map((word) => new Set(trigrams(word)))
  const span = wordsOf(query).length + 1
  let best = 0
  for (let start = 0; start < words.length; start++) {
    const run = new Set<string>()
    for (let end = start; end < Math.min(words.length, start + span); end++) {
      for (const trigram of words[end]) run.add(trigram)
      let shared = 0
      for (const trigram of wanted) if (run.has(trigram)) shared++
      best = Math.max(best, shared / (wanted.size + run.size - shared))
    }
  }
  return best
}

// A record's words, split once and kept while the record is.
const split = new WeakMap<SearchRecord, { all: string[]; heading: string }>()
function parts(record: SearchRecord) {
  let entry = split.get(record)
  if (!entry) {
    entry = {
      all: wordsOf([record.title, record.path, record.excerpt, record.text].join(' ')),
      heading: `${record.title} ${record.excerpt}`,
    }
    split.set(record, entry)
  }
  return entry
}

/** The records that match the query, best first, 60 at most. */
export function searchRecords(records: readonly SearchRecord[], query: string): SearchHit[] {
  const terms = searchTerms(query)
  if (terms.length === 0) return []
  const phrase = terms.join(' ')
  const scored = records.flatMap((record) => {
    const { all, heading } = parts(record)
    // How many of the page's words start with each term.
    const counts = terms.map((term) => all.filter((word) => word.startsWith(term)).length)
    const everyTerm = counts.every((count) => count > 0)
    if (!everyTerm && wordSimilarity(phrase, heading) <= similarity) return []
    const frequency = everyTerm
      ? counts.reduce((sum, count) => sum + count / (count + 1), 0) / (10 * terms.length)
      : 0
    return [{ record, score: frequency + wordSimilarity(phrase, record.title) }]
  })
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      (b.record.publishedAt ?? '').localeCompare(a.record.publishedAt ?? '') ||
      a.record.source.localeCompare(b.record.source),
  )
  return scored.slice(0, 60).map(({ record }) => ({
    id: record.source,
    type: record.type,
    title: record.title,
    path: record.path || null,
    excerpt: record.excerpt || null,
    text: record.text || null,
    url: record.url,
    sourceId: record.sourceId ?? null,
  }))
}
