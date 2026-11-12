import type { SearchHit } from './search-match'

// The search's text helpers (src/lib/search.ts): the query's words, the prefix query, the terms
// marked in a result and its snippet. No database here, so they're unit-tested on their own.

/** The query's words: letters and digits only, lowercased, at least two characters, up to eight. */
export function searchTerms(query: string): string[] {
  const words = query.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? []
  return [...new Set(words)].slice(0, 8)
}

export type Segment = { text: string; mark: boolean }

/** `text` split around the terms (case-insensitive), for <mark>. */
export function markTerms(text: string, terms: string[]): Segment[] {
  if (!text || terms.length === 0) return [{ text, mark: false }]
  const escaped = [...terms]
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'giu'))
  return parts
    .filter((part) => part !== '')
    .map((part) => ({ text: part, mark: terms.includes(part.toLowerCase()) }))
}

/**
 * The result's snippet: its excerpt when the excerpt or the title has a term (or the text has
 * none), otherwise the passage around the first term in its text, about 220 characters.
 */
export function snippetOf(
  hit: Pick<SearchHit, 'title' | 'excerpt' | 'text'>,
  terms: string[],
): string {
  const excerpt = (hit.excerpt ?? '').trim()
  const has = (value: string) => terms.some((term) => value.toLowerCase().includes(term))
  const text = (hit.text ?? '').replace(/\s+/g, ' ').trim()
  if (excerpt && (has(excerpt) || has(hit.title) || !has(text))) return shorten(excerpt, 220)
  if (!has(text)) return shorten(text, 220)
  const lower = text.toLowerCase()
  const at = Math.min(...terms.map((term) => lower.indexOf(term)).filter((i) => i >= 0))
  let start = Math.max(0, at - 80)
  if (start > 0) start = text.indexOf(' ', start) + 1 || start
  const window = text.slice(start, start + 220)
  const end = window.length < text.length - start ? window.replace(/\s+\S*$/, '') : window
  return `${start > 0 ? '…' : ''}${end}${start + end.length < text.length ? '…' : ''}`
}

function shorten(value: string, length: number): string {
  if (value.length <= length) return value
  return `${value.slice(0, length - 1).replace(/\s+\S*$/, '')}…`
}
