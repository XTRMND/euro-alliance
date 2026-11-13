import type { Field, GlobalConfig } from 'payload'
import { anyone, isStaff } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'
import { type LinkType, sitePageOptions } from '@/lib/nav-links'

// Header, mobile menu and footer links (docs/cms-schema.md § 7). Labels are content, so they live
// here, not in messages/*.json. A header or menu link with sub-links is a disclosure button that
// opens them (e.g. «Професионално обучение»); it has no address of its own.
// Links are picked, not typed (docs/admin-redesign.md, decision 10; src/lib/nav-links.ts): a
// fixed page of the site, a programme, a course, or (the fallback) an address typed by hand.

const urlPattern = /^(\/|#|https:\/\/|tel:|mailto:)/
const urlHint = 'Започва с /, #, https://, tel: или mailto:'

const label: Field = {
  name: 'label',
  type: 'text',
  label: 'Текст',
  required: true,
  localized: true,
}

type LinkData = { type?: LinkType | null; children?: unknown[] | null }

const typeLabels: Record<LinkType, string> = {
  page: 'Страница от сайта',
  program: 'Програма',
  course: 'Курс',
  custom: 'Друг адрес',
}

const is = (type: LinkType) => (_: unknown, sibling: LinkData) => sibling?.type === type

/** Required when its type is picked (a link that opens sub-links needs no target). */
const requiredFor =
  (type: LinkType, message: string) =>
  (value: unknown, { siblingData }: { siblingData: LinkData }) =>
    siblingData?.type !== type || siblingData.children?.length || value ? true : message

/**
 * Where a link goes. `optional`: a link that may open sub-links instead needs no target.
 */
const target = (optional = false): Field[] => [
  {
    name: 'type',
    type: 'select',
    label: 'Води към',
    defaultValue: 'page',
    options: (Object.keys(typeLabels) as LinkType[]).map((value) => ({
      value,
      label: typeLabels[value],
    })),
    admin: {
      isClearable: optional,
      description: optional ? 'Не се ползва, ако връзката отваря подвръзки.' : undefined,
    },
    validate: (value: unknown, { siblingData }: { siblingData: LinkData }) =>
      value || (optional && siblingData?.children?.length)
        ? true
        : 'Изберете накъде води връзката.',
  },
  {
    name: 'page',
    type: 'select',
    label: 'Страница',
    options: sitePageOptions,
    admin: { condition: is('page') },
    validate: requiredFor('page', 'Изберете страница.'),
  },
  {
    name: 'program',
    type: 'relationship',
    relationTo: 'programs',
    label: 'Програма',
    admin: { condition: is('program'), allowCreate: false },
    validate: requiredFor('program', 'Изберете програма.'),
  },
  {
    name: 'anchor',
    type: 'text',
    label: 'Секция от страницата',
    admin: {
      condition: is('program'),
      description: 'По избор: котвата на секция от програмата, например pismeni-prevodi.',
    },
    validate: (value: unknown) =>
      !value || /^[a-z0-9-]+$/.test(String(value)) || 'Малки латински букви, цифри и тирета.',
  },
  {
    name: 'course',
    type: 'relationship',
    relationTo: 'courses',
    label: 'Курс',
    admin: { condition: is('course'), allowCreate: false },
    validate: requiredFor('course', 'Изберете курс.'),
  },
  {
    name: 'url',
    type: 'text',
    label: 'Адрес',
    admin: {
      condition: is('custom'),
      description: `За външен сайт, телефон или имейл. ${urlHint}.`,
    },
    validate: (value: unknown, { siblingData }: { siblingData: LinkData }) =>
      siblingData?.type !== 'custom' ||
      (typeof value === 'string' && urlPattern.test(value)) ||
      urlHint,
  },
]

const rowLabel = { components: { RowLabel: '@/components/admin/RowLabel#LabelRowLabel' } }

const links = (name: string, title: string, extra: Field[] = []): Field => ({
  name,
  type: 'array',
  label: title,
  labels: { singular: 'Връзка', plural: 'Връзки' },
  admin: rowLabel,
  fields: [label, { type: 'row', fields: target() }, ...extra],
})

// A link that may instead open a group of sub-links.
const linksWithGroups = (name: string, title: string): Field => ({
  name,
  type: 'array',
  label: title,
  labels: { singular: 'Връзка', plural: 'Връзки' },
  admin: rowLabel,
  fields: [label, { type: 'row', fields: target(true) }, links('children', 'Подвръзки')],
})

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Навигация',
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'header',
      type: 'group',
      label: 'Горна лента (компютър)',
      fields: [
        linksWithGroups('left', 'Вляво от логото'),
        linksWithGroups('right', 'Вдясно от логото'),
      ],
    },
    linksWithGroups('menu', 'Мобилно меню'),
    {
      name: 'footer',
      type: 'array',
      label: 'Колони в долния колонтитул',
      labels: { singular: 'Колона', plural: 'Колони' },
      admin: { components: { RowLabel: '@/components/admin/RowLabel#HeadingRowLabel' } },
      fields: [
        { name: 'heading', type: 'text', label: 'Заглавие', required: true, localized: true },
        links('links', 'Връзки', [
          {
            name: 'icon',
            type: 'select',
            label: 'Икона',
            options: [{ label: 'Facebook', value: 'facebook' }],
            admin: { description: 'На компютър връзката се показва като икона.' },
          },
        ]),
      ],
    },
  ],
}
