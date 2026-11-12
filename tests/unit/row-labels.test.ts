import type { Block, Field } from 'payload'
import { describe, expect, it } from 'vitest'
import { Certificates } from '@/collections/Certificates'
import { Courses } from '@/collections/Courses'
import { Documents } from '@/collections/Documents'
import { Exams } from '@/collections/Exams'
import { FundedProjects } from '@/collections/FundedProjects'
import { Groups } from '@/collections/Groups'
import { Inquiries } from '@/collections/Inquiries'
import { LegalPages } from '@/collections/LegalPages'
import { Media } from '@/collections/Media'
import { News } from '@/collections/News'
import { Offices } from '@/collections/Offices'
import { Prices } from '@/collections/Prices'
import { Professions } from '@/collections/Professions'
import { Programs } from '@/collections/Programs'
import { Redirects } from '@/collections/Redirects'
import { TeacherProgrammes } from '@/collections/TeacherProgrammes'
import { Team } from '@/collections/Team'
import { TextbookSystems } from '@/collections/TextbookSystems'
import { Users } from '@/collections/Users'
import { namedLists, singularOf, withRowLabels } from '@/fields/row-labels'
import { About } from '@/globals/About'
import { Contact } from '@/globals/Contact'
import { Home } from '@/globals/Home'
import { InquiryRouting } from '@/globals/InquiryRouting'
import { Navigation } from '@/globals/Navigation'
import { Site } from '@/globals/Site'

// Every list of every form: «Добави стъпка», never «Добави Item»; a row label, never «Item 01».

const configs = [
  Certificates,
  Courses,
  Documents,
  Exams,
  FundedProjects,
  Groups,
  Inquiries,
  LegalPages,
  Media,
  News,
  Offices,
  Prices,
  Professions,
  Programs,
  Redirects,
  TeacherProgrammes,
  Team,
  TextbookSystems,
  Users,
  About,
  Contact,
  Home,
  InquiryRouting,
  Navigation,
  Site,
]

type List = { where: string; field: Extract<Field, { type: 'array' }> }

function lists(fields: Field[], where: string): List[] {
  return fields.flatMap((field): List[] => {
    const at = 'name' in field && field.name ? `${where}.${field.name}` : where
    switch (field.type) {
      case 'array':
        return [{ where: at, field }, ...lists(field.fields, at)]
      case 'blocks':
        return field.blocks.flatMap((block: Block) => lists(block.fields, `${at}[${block.slug}]`))
      case 'group':
      case 'row':
      case 'collapsible':
        return lists(field.fields, at)
      case 'tabs':
        return field.tabs.flatMap((tab) =>
          lists(tab.fields, 'name' in tab && tab.name ? `${at}.${tab.name}` : at),
        )
      default:
        return []
    }
  })
}

describe('the lists of the admin’s forms', () => {
  const all = configs.flatMap((config) => lists(namedLists(config).fields, config.slug))

  it('finds the lists', () => {
    expect(all.length).toBeGreaterThan(40)
  })

  it('names one of each in Bulgarian, in lower case', () => {
    const unnamed = all.filter(({ field }) => {
      const singular = field.labels?.singular
      return typeof singular !== 'string' || !/^[а-я]/.test(singular)
    })
    expect(unnamed.map(({ where }) => where)).toEqual([])
  })

  it('knows the word for every list’s title: none falls back to «ред» by default', () => {
    const rows = ['Редове', 'Данни', 'Кого']
    const guessed = configs
      .flatMap((config) => lists(config.fields, config.slug))
      .filter(
        ({ field }) =>
          singularOf(field) === 'ред' &&
          !rows.includes(String(field.label)) &&
          field.labels?.singular === undefined,
      )
    expect(guessed.map(({ where, field }) => `${where}: ${String(field.label)}`)).toEqual([])
  })

  it('gives every list a row label', () => {
    const without = all.filter(({ field }) => !field.admin?.components?.RowLabel)
    expect(without.map(({ where }) => where)).toEqual([])
  })

  it('keeps a list’s own words and its own row label', () => {
    const [field] = withRowLabels([
      {
        name: 'tests',
        type: 'array',
        label: 'Tests',
        labels: { singular: 'Раздел', plural: 'Раздели' },
        admin: { components: { RowLabel: 'Test#Label' } },
        fields: [{ name: 'items', type: 'array', label: 'Стъпки', fields: [] }],
      },
    ]) as [Extract<Field, { type: 'array' }>]
    expect(field.labels).toEqual({ singular: 'раздел', plural: 'Раздели' })
    expect(field.admin?.components?.RowLabel).toBe('Test#Label')
    const inner = field.fields[0] as Extract<Field, { type: 'array' }>
    expect(inner.labels?.singular).toBe('стъпка')
    expect(inner.admin?.components?.RowLabel).toEqual({
      path: '@/components/admin/RowLabel#AutoRowLabel',
      clientProps: { singular: 'стъпка' },
    })
  })
})
