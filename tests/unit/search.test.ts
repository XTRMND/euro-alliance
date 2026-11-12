import { describe, expect, it } from 'vitest'
import { cleanSearchTerm } from '@/lib/analytics'
import { routes, searchTabFromParam } from '@/lib/routes'
import { searchRecords, wordSimilarity } from '@/lib/search-match'
import { markTerms, searchTerms, snippetOf } from '@/lib/search-text'
import { collectText, searchRecord, type SearchRecord } from '@/lib/search-records'

describe('searchTerms', () => {
  it('keeps words of two letters or more, lowercased, once each', () => {
    expect(searchTerms('Английски  език, английски! a')).toEqual(['английски', 'език'])
  })

  it('drops everything but letters and digits', () => {
    expect(searchTerms("'); drop table search; --")).toEqual(['drop', 'table', 'search'])
  })
})

describe('markTerms', () => {
  it('marks the terms wherever they appear, in any case', () => {
    expect(markTerms('Английски език', ['англ'])).toEqual([
      { text: 'Англ', mark: true },
      { text: 'ийски език', mark: false },
    ])
  })

  it('leaves text without terms alone', () => {
    expect(markTerms('Test text', [])).toEqual([{ text: 'Test text', mark: false }])
  })
})

describe('snippetOf', () => {
  it('is the excerpt when the excerpt or the title has a term', () => {
    expect(snippetOf({ title: 'Test A', excerpt: 'Short test text.', text: 'x' }, ['test'])).toBe(
      'Short test text.',
    )
  })

  it('is the passage around the term when only the text has it', () => {
    const text = `${'дума '.repeat(40)}намерена ${'край '.repeat(60)}`
    const snippet = snippetOf({ title: 'Test A', excerpt: 'Без това.', text }, ['намерена'])
    expect(snippet.startsWith('…')).toBe(true)
    expect(snippet.endsWith('…')).toBe(true)
    expect(snippet).toContain('намерена')
    expect(snippet.length).toBeLessThanOrEqual(222)
  })
})

describe('cleanSearchTerm', () => {
  it('redacts emails, phone numbers and long digit runs', () => {
    expect(cleanSearchTerm('курс test@example.com')).toBe('курс [redacted]')
    expect(cleanSearchTerm('обади се на 0886 601 108')).toBe('обади се на [redacted]')
    expect(cleanSearchTerm('  английски   B2 ')).toBe('английски B2')
  })
})

describe('the search address', () => {
  it('keeps the tab in the address, except «Всичко»', () => {
    expect(routes.search('английски', 'courses')).toBe(
      '/tarsene?q=%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8&vid=kursove',
    )
    expect(routes.search('test', 'all')).toBe('/tarsene?q=test')
    expect(searchTabFromParam('novini')).toBe('news')
    expect(searchTabFromParam('anything')).toBe('all')
  })
})

describe('the search index', () => {
  it('collects text fields and rich text, not ids or links', () => {
    const body = { root: { type: 'root', children: [{ type: 'text', text: 'Test body' }] } }
    expect(
      collectText({ id: 3, slug: 'test-a', heading: 'Test A', url: 'https://example.com', body }),
    ).toEqual(['Test A', 'Test body'])
  })

  it('gives a language page its section path and address', () => {
    const record = searchRecord('programs', {
      id: 7,
      title: 'Test course A',
      type: 'language',
      language: 'english',
      audience: 'adults',
      hero: { heading: 'Test', lead: 'Test lead' },
    })
    expect(record).toMatchObject({
      type: 'page',
      title: 'Test course A',
      path: 'Езици › Английски',
      excerpt: 'Test lead',
      url: '/ezitsi/angliyski/vazrastni',
      source: 'programs:7',
    })
  })

  it('skips a course without an address', () => {
    expect(searchRecord('courses', { id: 1, title: 'Test course A' })).toBeNull()
  })
})

describe('searchRecords (the search without an index)', () => {
  const record = (source: string, fields: Partial<SearchRecord>): SearchRecord => ({
    type: 'page',
    title: 'Test',
    path: '',
    excerpt: '',
    text: '',
    url: `/${source}`,
    source,
    ...fields,
  })
  const records = [
    record('a', { title: 'Английски език за възрастни', excerpt: 'Курсове по общ английски.' }),
    record('b', { title: 'Немски език', text: 'Споменава английски веднъж.' }),
    record('c', { title: 'Преводи и легализация', text: 'Писмени и устни преводи.' }),
    record('n1', { type: 'news', title: 'Тест новина', publishedAt: '2026-01-01', sourceId: 1 }),
    record('n2', { type: 'news', title: 'Тест новина', publishedAt: '2026-06-01', sourceId: 2 }),
  ]
  const sources = (query: string) => searchRecords(records, query).map((hit) => hit.id)

  it('matches every word as the start of a word, in any field', () => {
    expect(sources('англ')).toEqual(['a', 'b'])
    expect(sources('английски възрастни')).toEqual(['a'])
    expect(sources('глийски')).toEqual([])
    expect(sources('превод')).toEqual(['c'])
  })

  it('forgives a typo in the title or excerpt, not in the text', () => {
    expect(wordSimilarity('англйски', 'Английски език за възрастни')).toBeGreaterThan(0.5)
    expect(sources('англйски')).toEqual(['a'])
  })

  it('puts the closest title first, and the newest first on a tie', () => {
    expect(sources('тест новина')).toEqual(['n2', 'n1'])
    expect(sources('немски')).toEqual(['b'])
  })

  it('finds nothing without a word of two letters', () => {
    expect(sources('a')).toEqual([])
  })
})
