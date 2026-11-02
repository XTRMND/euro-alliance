import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { isSitePath, normalizePath, staticRedirects, withoutEnglish } from '@/lib/redirects'

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
    expect(
      staticRedirects['/language-education/language-educations-for-adults/english-language'],
    ).toBe('/ezitsi/angliyski/vazrastni')
    expect(
      staticRedirects['/language-education/language-educations-for-adults/french-language-adults'],
    ).toBe('/ezitsi/frenski/vazrastni')
    expect(
      staticRedirects['/language-education/language-education-for-students/russian-language'],
    ).toBe('/ezitsi/ruski/uchenitsi')
    expect(staticRedirects['/language-education/language-educations-for-adults']).toBe(
      '/kursove?kategoria=ezitsi&auditoria=vazrastni',
    )
    expect(staticRedirects['/about-us/personal-data-gdpr']).toBe('/poveritelnost')
    expect(staticRedirects['/contact-us']).toBe('/kontakti')
  })

  it('send the English copies to the Bulgarian page', () => {
    expect(withoutEnglish('/en/vouchers')).toBe('/vouchers')
    expect(withoutEnglish('/en/en/news')).toBe('/news')
    expect(withoutEnglish('/en')).toBe('/')
    expect(withoutEnglish('/english')).toBe('/english')
  })

  it('are written in their normalized form and lead to the new site in one hop', () => {
    for (const [from, to] of Object.entries(staticRedirects)) {
      expect(normalizePath(from)).toBe(from)
      expect(staticRedirects[normalizePath(to.split(/[?#]/)[0])]).toBeUndefined()
      expect(isSitePath(to.split(/[?#]/)[0])).toBe(true)
    }
  })

  it('cover every content page in the old site’s inventory', () => {
    // News articles and courses get their redirects from the import (the redirects collection).
    const legacy = JSON.parse(
      readFileSync(new URL('../../scripts/import/legacy-urls.json', import.meta.url), 'utf8'),
    ) as { url: string }[]
    const missing = legacy
      .map((page) => withoutEnglish(normalizePath(new URL(page.url).pathname)))
      .filter((path) => path !== '/' && !/^\/(news|courses)\/\d+/.test(path))
      .filter((path) => !staticRedirects[path])
    expect([...new Set(missing)]).toEqual([])
  })
})
