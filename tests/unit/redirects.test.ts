import { describe, expect, it } from 'vitest'
import { isSitePath, normalizePath, staticRedirects } from '@/lib/redirects'

describe('normalizePath', () => {
  it('ignores case and trailing slashes, and decodes', () => {
    expect(normalizePath('/About-us/Our-History/')).toBe('/about-us/our-history')
    expect(normalizePath('/News//')).toBe('/news')
    expect(normalizePath('/%D0%9D%D0%BE%D0%B2%D0%B8%D0%BD%D0%B8')).toBe('/новини')
    expect(normalizePath('/')).toBe('/')
  })
})

describe('isSitePath', () => {
  it('knows the new site’s pages by their first segment, as written', () => {
    expect(isSitePath('/')).toBe(true)
    expect(isSitePath('/kursove/test-course-a')).toBe(true)
    expect(isSitePath('/za-nas')).toBe(true)
    expect(isSitePath('/Vouchers')).toBe(false)
    expect(isSitePath('/kursove/')).toBe(false)
    expect(isSitePath('/KURSOVE')).toBe(false)
  })
})

describe('the fixed redirects', () => {
  it('map the old site’s addresses to the new ones', () => {
    expect(staticRedirects['/vouchers']).toBe('/vaucheri')
    expect(staticRedirects['/language-education/language-educations-for-adults/english']).toBe(
      '/ezitsi/angliyski/vazrastni',
    )
    expect(staticRedirects['/language-education/language-education-for-students/russian']).toBe(
      '/ezitsi/ruski/uchenitsi',
    )
    expect(staticRedirects['/about-us/personal-data-gdpr']).toBe('/poveritelnost')
  })

  it('are written in their normalized form and lead to the new site in one hop', () => {
    for (const [from, to] of Object.entries(staticRedirects)) {
      expect(normalizePath(from)).toBe(from)
      expect(staticRedirects[normalizePath(to.split(/[?#]/)[0])]).toBeUndefined()
      expect(isSitePath(to.split(/[?#]/)[0])).toBe(true)
    }
  })
})
