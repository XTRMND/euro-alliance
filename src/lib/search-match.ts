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

/** The text's trigrams in order, word by word. */
const trigramsOf = (text: string) => wordsOf(text).flatMap(trigrams)

/**
 * How close `query` is to the closest stretch of `text`, 0 to 1, as pg_trgm's word_similarity
 * counts it: over every run of the text's trigrams that starts and ends on one of the query's,
 * the query's trigrams found in the run, over all the distinct trigrams of both.
 */
export function wordSimilarity(query: string, text: string): number {
  const wanted = new Set(trigramsOf(query))
  if (wanted.size === 0) return 0
  const sequence = trigramsOf(text)
  let best = 0
  for (let start = 0; start < sequence.length; start++) {
    if (!wanted.has(sequence[start])) continue
    const run = new Set<string>()
    let shared = 0
    for (let end = start; end < sequence.length; end++) {
      const trigram = sequence[end]
      const known = wanted.has(trigram)
      if (!run.has(trigram)) {
        run.add(trigram)
        if (known) shared++
      }
      if (known) best = Math.max(best, shared / (wanted.size + run.size - shared))
      // Nothing further along can beat the best: too many trigrams that aren't the query's.
      else if (wanted.size / (wanted.size + run.size - shared) <= best) break
    }
  }
  return best
}

// ts_rank's constants: the default weight of a word, and how much two words count by how far
// apart they stand.
const weight = 0.1
const zeta2 = 1.64493406685
const closeness = (distance: number) =>
  distance > 100 ? 1e-30 : 1 / (1.005 + 0.05 * Math.exp(distance / 1.5 - 2))

/**
 * How well the page's words answer the terms, as PostgreSQL's ts_rank orders them: for one term,
 * how often the words that start with it appear; for several, how close together they stand.
 * `positions` has, per term, the places (1-based) of the words that start with it, by word.
 */
function rank(positions: Map<string, number[]>[]): number {
  if (positions.length < 2) {
    let sum = 0
    for (const places of positions[0].values()) {
      let harmonic = 0
      for (let n = 1; n <= Math.min(places.length, 256); n++) harmonic += 1 / (n * n)
      sum += (weight * harmonic) / zeta2
    }
    return sum
  }
  // Each word of a term against the last word (in dictionary order) of every earlier term: that
  // is how ts_rank pairs them.
  const words = positions.map((byWord) => [...byWord].sort(([a], [b]) => (a < b ? -1 : 1)))
  let miss = 1
  let paired = false
  for (let i = 1; i < words.length; i++)
    for (const [, places] of words[i])
      for (let k = 0; k < i; k++) {
        const earlier = words[k].at(-1)?.[1] ?? []
        for (const a of places.slice(0, 256))
          for (const b of earlier.slice(0, 256)) {
            const distance = Math.abs(a - b)
            if (!distance) continue
            miss *= 1 - Math.sqrt(weight * weight * closeness(distance))
            paired = true
          }
      }
  return paired ? 1 - miss : 1e-20
}

// A record's words, split once and kept while the record is.
const split = new WeakMap<SearchRecord, { places: Map<string, number[]>; heading: string }>()
function parts(record: SearchRecord) {
  let entry = split.get(record)
  if (!entry) {
    const places = new Map<string, number[]>()
    wordsOf([record.title, record.path, record.excerpt, record.text].join(' ')).forEach(
      (word, index) => places.set(word, [...(places.get(word) ?? []), index + 1]),
    )
    entry = { places, heading: `${record.title} ${record.excerpt}` }
    split.set(record, entry)
  }
  return entry
}

/** The records that match the query, best first, 60 at most. */
export function searchRecords(
  records: readonly SearchRecord[],
  query: string,
  limit = 60,
): SearchHit[] {
  const terms = searchTerms(query)
  if (terms.length === 0) return []
  const phrase = terms.join(' ')
  const scored = records.flatMap((record, index) => {
    const { places, heading } = parts(record)
    // Per term, the page's words that start with it and where they stand.
    const positions = terms.map(
      (term) => new Map([...places].filter(([word]) => word.startsWith(term))),
    )
    const everyTerm = positions.every((byWord) => byWord.size > 0)
    if (!everyTerm && wordSimilarity(phrase, heading) <= similarity) return []
    return [{ record, index, score: rank(positions) + wordSimilarity(phrase, record.title) }]
  })
  // Best first, then the newest. On a full tie the records keep their own order: that is the order
  // the index's query gave them in, and the pages' snapshots were taken with.
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      (b.record.publishedAt ?? '').localeCompare(a.record.publishedAt ?? '') ||
      a.index - b.index,
  )
  return scored.slice(0, limit).map(({ record }) => ({
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
