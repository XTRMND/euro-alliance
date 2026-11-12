import { describe, expect, it } from 'vitest'
import { isPreviewKind, previewOf, previewPath, setPreview } from '@/lib/preview'
import { storePreview, storedPreview } from '@/lib/preview-store'
import { contentSecurityPolicy, securityHeaders } from '@/lib/security-headers'

describe('the preview address', () => {
  it('names the document, and the content language when given', () => {
    expect(previewPath('courses', 12)).toBe('/preview/courses/12')
    expect(previewPath('home', undefined, 'en')).toBe('/preview/home?locale=en')
  })
  it('knows the kinds that have a preview', () => {
    expect(isPreviewKind('news')).toBe(true)
    expect(isPreviewKind('users')).toBe(false)
    expect(isPreviewKind(undefined)).toBe(false)
  })
})

describe('the preview scope', () => {
  it('holds nothing outside a render of the preview route', () => {
    setPreview('home', { hero: {} })
    expect(previewOf('home')).toBeUndefined()
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
    const frameOptions = (framedBySelf: boolean) =>
      securityHeaders({ production: true, framedBySelf }).find(
        (header) => header.key === 'X-Frame-Options',
      )?.value
    expect(frameOptions(false)).toBe('DENY')
    expect(frameOptions(true)).toBe('SAMEORIGIN')
  })
})
