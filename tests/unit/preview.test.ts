import { describe, expect, it } from 'vitest'
import { isPreviewKind, previewQuery, previewTarget, previewUrl } from '@/lib/preview'
import { storePreview, storedPreview } from '@/lib/preview-store'
import { contentSecurityPolicy } from '@/lib/security-headers'

describe('the preview address', () => {
  it('is the page itself, marked with the document and the content language', () => {
    expect(previewUrl('courses', { id: 12, slug: 'test-course-a' })).toBe(
      '/kursove/test-course-a?preview=courses.12&locale=bg',
    )
    expect(previewUrl('home', {}, 'en')).toBe('/?preview=home&locale=en')
    expect(previewUrl('programs', { id: 3, type: 'vouchers' })).toBe(
      '/vaucheri?preview=programs.3&locale=bg',
    )
    expect(
      previewUrl('programs', { id: 1, type: 'language', language: 'english', audience: 'adults' }),
    ).toBe('/ezitsi/angliyski/vazrastni?preview=programs.1&locale=bg')
  })
  it('shows a document without a slug yet, by its marker', () => {
    expect(previewUrl('news', { id: 7 })).toBe('/novini/preview?preview=news.7&locale=bg')
  })
  it('is empty when there is no page to show yet', () => {
    expect(previewUrl('courses', { slug: 'unsaved' })).toBe('')
    expect(previewUrl('programs', { id: 4, type: 'language' })).toBe('')
    expect(
      previewUrl('programs', { id: 4, type: 'language', language: 'russian', audience: 'adults' }),
    ).toBe('')
  })
  it('reads the marker back, and refuses a malformed one', () => {
    const target = (query: string) => previewTarget(new URLSearchParams(query))
    expect(target('preview=courses.12&locale=bg&live=abcdefgh-1')).toEqual({
      kind: 'courses',
      id: '12',
      locale: 'bg',
      live: 'abcdefgh-1',
    })
    expect(target(previewQuery({ kind: 'about', locale: 'en' }))).toEqual({
      kind: 'about',
      id: undefined,
      locale: 'en',
      live: undefined,
    })
    for (const bad of [
      '',
      'q=test',
      'preview=users.1',
      'preview=courses',
      'preview=courses.x',
      'preview=home.1',
      'preview=news.1&live=short',
      'preview=news.1.2',
    ])
      expect(target(bad)).toBeUndefined()
  })
  it('knows the kinds that have a preview', () => {
    expect(isPreviewKind('news')).toBe(true)
    expect(isPreviewKind('users')).toBe(false)
    expect(isPreviewKind(undefined)).toBe(false)
  })
})

describe('unsaved data for the preview frame', () => {
  const mine = { user: 1, kind: 'courses' as const, id: '12' }
  it('comes back for the same frame, user and document only', () => {
    storePreview('token-a', { ...mine, data: { title: 'Test course A' } }, 1_000)
    expect(storedPreview('token-a', mine, 2_000)).toEqual({ title: 'Test course A' })
    expect(storedPreview('token-b', mine, 2_000)).toBeUndefined()
    expect(storedPreview(undefined, mine, 2_000)).toBeUndefined()
    expect(storedPreview('token-a', { ...mine, user: 2 }, 2_000)).toBeUndefined()
    expect(storedPreview('token-a', { ...mine, id: '13' }, 2_000)).toBeUndefined()
    expect(storedPreview('token-a', { ...mine, kind: 'news' }, 2_000)).toBeUndefined()
  })
  it('is dropped ten minutes after the last change', () => {
    storePreview('token-c', { ...mine, data: {} }, 0)
    expect(storedPreview('token-c', mine, 10 * 60_000 + 1)).toBeUndefined()
  })
})

describe('framing', () => {
  it('lets only the preview be framed, and only by the site itself', () => {
    expect(contentSecurityPolicy({ nonce: 'n' })).toContain("frame-ancestors 'none'")
    expect(contentSecurityPolicy({ nonce: 'n', framedBySelf: true })).toContain(
      "frame-ancestors 'self'",
    )
  })
})
