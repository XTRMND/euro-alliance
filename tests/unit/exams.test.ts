import { describe, expect, it } from 'vitest'
import { examResults, resultsByValid } from '@/lib/exams'

describe('examResults', () => {
  it('links the results once they are out, instead of the deadline and the place', () => {
    expect(
      examResults({
        results: '/api/files/file/test-results.pdf',
        resultsBy: '2026-12-15T10:00:00.000Z',
        resultsPlace: 'Test place',
      }),
    ).toEqual({ kind: 'link', href: '/api/files/file/test-results.pdf' })
  })

  it('gives the deadline and the place before that, either one alone', () => {
    expect(
      examResults({ resultsBy: '2026-12-15T10:00:00.000Z', resultsPlace: 'Test place' }),
    ).toEqual({ kind: 'announced', by: '2026-12-15T10:00:00.000Z', place: 'Test place' })
    expect(examResults({ resultsBy: '2026-12-15T10:00:00.000Z' })).toEqual({
      kind: 'announced',
      by: '2026-12-15T10:00:00.000Z',
      place: null,
    })
    expect(examResults({ resultsPlace: 'Test place' })).toEqual({
      kind: 'announced',
      by: null,
      place: 'Test place',
    })
  })

  it('leaves the cell empty without any of them', () => {
    expect(examResults({})).toBeNull()
    expect(examResults({ results: '', resultsBy: null, resultsPlace: '  ' })).toBeNull()
  })
})

describe('resultsByValid', () => {
  it('accepts the exam day and later, in Sofia', () => {
    // The exam at 09:00 Sofia; the day picker stores noon.
    expect(resultsByValid('2026-12-02T10:00:00.000Z', '2026-12-02T07:00:00.000Z')).toBe(true)
    expect(resultsByValid('2026-12-20T10:00:00.000Z', '2026-12-02T07:00:00.000Z')).toBe(true)
    // 23:30 UTC on 1 December is already 2 December in Sofia.
    expect(resultsByValid('2026-12-01T23:30:00.000Z', '2026-12-02T07:00:00.000Z')).toBe(true)
  })

  it('refuses a deadline before the exam day', () => {
    expect(resultsByValid('2026-12-01T10:00:00.000Z', '2026-12-02T07:00:00.000Z')).toBe(false)
  })
})
