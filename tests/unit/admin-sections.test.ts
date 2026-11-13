import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { programBlocks } from '@/blocks'
import {
  sectionGroups,
  sectionKinds,
  sectionSummary,
  sectionThumbnail,
  thumbnailColours,
} from '@/lib/admin-sections'
import { childLinksLabel, describeLink } from '@/lib/nav-links'

describe('a programme’s sections', () => {
  it('names every block, with a group and an icon', () => {
    expect(programBlocks.map((block) => block.slug).sort()).toEqual(
      Object.keys(sectionKinds).sort(),
    )
    for (const block of programBlocks) {
      const kind = sectionKinds[block.slug as keyof typeof sectionKinds]
      expect(block.labels?.singular).toBe(kind.name)
      expect(block.admin?.group).toBe(sectionGroups[kind.group])
      expect(block.admin?.components?.Label).toBeTruthy()
    }
  })

  it('lists them in the drawer’s groups, in order', () => {
    const groups = programBlocks.map((block) => block.admin?.group)
    expect([...new Set(groups)]).toEqual(['Съдържание', 'Курсове и програми', 'Контакт и проекти'])
  })

  it('summarises a list by its count and titles', () => {
    expect(
      sectionSummary('features', { items: [{ title: 'Test card A' }, { title: 'Test card B' }] }),
    ).toBe('2 карти · Test card A, Test card B')
    expect(sectionSummary('features', { items: [{ title: 'Test card A' }] })).toBe(
      '1 карта · Test card A',
    )
    expect(sectionSummary('faq', { items: [{ question: 'Test question?' }, {}, {}, {}] })).toBe(
      '4 въпроса · Test question?',
    )
    expect(sectionSummary('figures', { items: [{}, {}] })).toBe('2 числа')
  })

  it('falls back to the section’s heading, then to what the kind is', () => {
    expect(sectionSummary('certificates', { heading: ' Test heading ' })).toBe('Test heading')
    expect(sectionSummary('certificates', {})).toBe('От «Изпити и сертификати»')
    expect(sectionSummary('features', { items: [] })).toBe('Карти с кратък текст')
    expect(sectionSummary('unknown', {})).toBe('')
  })

  it('draws the thumbnails in the site’s colours', () => {
    const tokens = readFileSync('src/styles/tokens.css', 'utf8').toLowerCase()
    const token = (name: string) => new RegExp(`${name}:\\s*(#[0-9a-f]{6})`).exec(tokens)?.[1]
    expect(thumbnailColours).toEqual({
      paper: token('--color-bg-warm'),
      navy: token('--color-brand-primary'),
      muted: token('--color-text-muted'),
      sand: token('--color-brand-accent'),
    })
    expect(sectionThumbnail('cards')).toMatch(/^data:image\/svg\+xml,/)
  })
})

describe('where a navigation link goes', () => {
  it('names the page, programme, course or address', () => {
    expect(describeLink({ type: 'page', page: 'home' })).toBe('Страница · Начална страница')
    expect(
      describeLink({ type: 'program', program: 3 }, { programs: { 3: 'Test programme' } }),
    ).toBe('Програма · Test programme')
    expect(describeLink({ type: 'program', program: 3 })).toBe('Програма')
    expect(describeLink({ type: 'course', course: { id: 5, title: 'Test course A' } })).toBe(
      'Курс · Test course A',
    )
    expect(describeLink({ type: 'custom', url: 'https://example.test' })).toBe(
      'Адрес · https://example.test',
    )
    expect(describeLink({})).toBe('Без връзка')
  })
  it('says when a link only opens its sub-links', () => {
    expect(describeLink({ type: 'page', page: 'home', children: [{}, {}] })).toBe('Само подменю')
    expect([childLinksLabel(1), childLinksLabel(3)]).toEqual(['1 подвръзка', '3 подвръзки'])
  })
})
