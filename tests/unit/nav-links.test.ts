import { describe, expect, it } from 'vitest'
import { linkFromHref, linkHref, programUrl, resolveNavigation } from '@/lib/nav-links'

// docs/admin-redesign.md, decision 10: navigation links are picked, not typed.

const programs = [
  { id: 1, type: 'translations' },
  { id: 2, type: 'vocational' },
  { id: 3, type: 'language', language: 'german', audience: 'adults' },
]
const courses = [{ id: 7, slug: 'test-course-a' }]
const known = { programs, courses }

describe('a typed address as a picked link (the migration)', () => {
  it('picks the programme whose page the address is, with its section', () => {
    expect(linkFromHref('/prevodi', known)).toEqual({ type: 'program', program: 1 })
    expect(linkFromHref('/prevodi#pismeni-prevodi', known)).toEqual({
      type: 'program',
      program: 1,
      anchor: 'pismeni-prevodi',
    })
    expect(linkFromHref('/ezitsi/nemski/vazrastni', known)).toEqual({ type: 'program', program: 3 })
  })

  it('picks a course by its slug', () => {
    expect(linkFromHref('/kursove/test-course-a', known)).toEqual({ type: 'course', course: 7 })
  })

  it('picks a fixed page, a filtered listing or a section of About', () => {
    expect(linkFromHref('/kursove', known)).toEqual({ type: 'page', page: 'courses' })
    expect(linkFromHref('/kursove?kategoria=ezitsi&auditoria=uchenitsi', known)).toEqual({
      type: 'page',
      page: 'languagesStudents',
    })
    expect(linkFromHref('/za-nas#proekti', known)).toEqual({ type: 'page', page: 'about-projects' })
    expect(linkFromHref('/kontakti#sofia', known)).toEqual({ type: 'page', page: 'contactSofia' })
    // A programme page without its programme in the CMS is still a fixed page.
    expect(linkFromHref('/vaucheri', known)).toEqual({ type: 'page', page: 'vouchers' })
  })

  it('keeps anything else as the typed address', () => {
    for (const url of ['https://www.facebook.com/test', 'tel:+359000000000', '/kursove/unknown'])
      expect(linkFromHref(url, known)).toEqual({ type: 'custom', url })
  })

  it('goes back to the same address', () => {
    const populated = (href: string) => {
      const link = linkFromHref(href, known)
      return {
        ...link,
        program: programs.find((program) => program.id === link.program),
        course: courses.find((course) => course.id === link.course),
      }
    }
    for (const href of [
      '/prevodi#ustni-prevodi',
      '/profesionalno-obuchenie/profesii',
      '/kursove/test-course-a',
      '/kursove?kategoria=izpiti-i-sertifikati',
      '/kontakti?tema=prevodi',
      '/',
      'mailto:test@example.test',
    ])
      expect(linkHref(populated(href))).toBe(href)
  })
})

describe('a picked link on the site', () => {
  it('has no address while its programme or course isn’t there for a visitor', () => {
    expect(linkHref({ type: 'program', program: 5 })).toBeUndefined()
    expect(linkHref({ type: 'course', course: null })).toBeUndefined()
    expect(linkHref({ type: 'page', page: 'no-such-page' })).toBeUndefined()
    expect(programUrl({ type: 'language', language: 'german' })).toBeUndefined()
  })

  it('leaves out links with nowhere to go, and keeps a group with its sub-links', () => {
    const site = resolveNavigation({
      menu: [
        { label: 'Test A', type: 'page', page: 'courses' },
        { label: 'Test B', type: 'program', program: 9 },
        {
          label: 'Test group',
          children: [
            { label: 'Test C', type: 'program', program: programs[1] },
            { label: 'Test D', type: 'course', course: 3 },
          ],
        },
      ],
    })
    expect(site.menu).toEqual([
      { id: undefined, label: 'Test A', href: '/kursove', children: [] },
      {
        id: undefined,
        label: 'Test group',
        children: [{ id: undefined, label: 'Test C', href: '/profesionalno-obuchenie/profesii' }],
      },
    ])
  })
})
