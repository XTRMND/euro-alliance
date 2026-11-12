import type { Field, GlobalConfig } from 'payload'
import { anyone, isStaff } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'
import { searchChangedGlobal } from '@/lib/search-records'
import { destinationOptions } from '@/lib/destinations'
import { metaField } from '@/fields/meta'

// The About page (190:2677 / 210:2395): a fixed set of sections in the subnav's order, each a
// group. An empty field hides its element; a section without content hides itself and its
// subnav item. Licences and samples come from Documents, projects from Funded projects.

const text = (name: string, label: string, extra: Partial<Field> = {}): Field =>
  ({ name, type: 'text', label, localized: true, ...extra }) as Field

const textarea = (name: string, label: string): Field => ({
  name,
  type: 'textarea',
  label,
  localized: true,
})

const lines = (name: string, label: string): Field => ({
  name,
  type: 'array',
  label,
  fields: [text('text', 'Текст', { required: true })],
})

const link = (name: string, label: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      type: 'row',
      fields: [
        text('label', 'Текст'),
        { name: 'destination', type: 'select', label: 'Води към', options: destinationOptions },
      ],
    },
  ],
})

const head = (withLead = true): Field[] => [
  { type: 'row', fields: [text('kicker', 'Надзаглавие'), text('heading', 'Заглавие')] },
  ...(withLead ? [textarea('lead', 'Въвеждащ текст')] : []),
]

export const About: GlobalConfig = {
  slug: 'about',
  admin: { hideAPIURL: true },
  label: 'За нас',
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal, searchChangedGlobal] },
  fields: [
    metaField(),
    {
      name: 'hero',
      type: 'group',
      label: 'Начало на страницата',
      fields: [
        text('kicker', 'Надзаглавие'),
        {
          type: 'row',
          fields: [
            text('title', 'Заглавие'),
            text('highlight', 'Подчертана фраза', {
              admin: { description: 'Част от заглавието.' },
            }),
          ],
        },
        textarea('lead', 'Текст'),
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          label: 'Снимка в «скъсаната хартия»',
          filterOptions: { kind: { equals: 'photo' } },
        },
        link('primary', 'Бутон'),
        link('secondary', 'Връзка'),
      ],
    },
    {
      name: 'history',
      type: 'group',
      label: 'История',
      fields: [
        ...head(),
        {
          name: 'items',
          type: 'array',
          label: 'Години',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'year', type: 'text', label: 'Година', required: true },
                text('title', 'Заглавие', { required: true }),
              ],
            },
            textarea('text', 'Текст'),
          ],
        },
        textarea('closing', 'Заключителен абзац'),
      ],
    },
    {
      name: 'figures',
      type: 'group',
      label: 'В цифри',
      fields: [
        text('heading', 'Заглавие'),
        {
          name: 'items',
          type: 'array',
          label: 'Числа',
          admin: { description: 'Само официални числа.' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'figure', type: 'text', label: 'Число', required: true },
                text('label', 'Надпис', { required: true }),
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'statement',
      type: 'group',
      label: 'Кого обучаваме',
      fields: [
        {
          type: 'row',
          fields: [
            text('before', 'Заглавие, начало'),
            text('highlight', 'Подчертано'),
            text('after', 'Край'),
          ],
        },
        lines('audiences', 'Кого'),
        textarea('note', 'Бележка'),
        {
          name: 'photos',
          type: 'array',
          label: 'Снимки',
          maxRows: 3,
          fields: [
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: 'Снимка',
              required: true,
              filterOptions: { kind: { equals: 'photo' } },
            },
            text('caption', 'Надпис'),
          ],
        },
      ],
    },
    {
      name: 'team',
      type: 'group',
      label: 'Екип',
      fields: [
        ...head(false),
        textarea('quote', 'Цитат'),
        {
          name: 'values',
          type: 'array',
          label: 'Качества',
          maxRows: 3,
          fields: [text('title', 'Заглавие', { required: true }), textarea('text', 'Текст')],
        },
      ],
    },
    {
      name: 'standards',
      type: 'group',
      label: 'Стандарти',
      fields: [
        ...head(),
        {
          name: 'groups',
          type: 'array',
          label: 'Групи',
          maxRows: 3,
          fields: [
            text('title', 'Заглавие', { required: true }),
            {
              name: 'fields',
              type: 'array',
              label: 'Редове',
              fields: [
                {
                  type: 'row',
                  fields: [
                    text('label', 'Надпис', { required: true }),
                    text('value', 'Стойност', { required: true }),
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'stub',
          type: 'group',
          label: 'Отрязък',
          fields: [
            { type: 'row', fields: [text('label', 'Надпис'), text('title', 'Заглавие')] },
            { type: 'row', fields: [text('chip', 'Етикет'), text('buttonLabel', 'Бутон')] },
            textarea('note', 'Бележка'),
          ],
        },
      ],
    },
    {
      name: 'licences',
      type: 'group',
      label: 'Лицензи и сертификати',
      fields: [
        ...head(),
        {
          name: 'documents',
          type: 'relationship',
          relationTo: 'documents',
          hasMany: true,
          label: 'Документи',
        },
        {
          name: 'links',
          type: 'array',
          label: 'Връзки',
          fields: [
            {
              type: 'row',
              fields: [
                text('label', 'Текст', { required: true }),
                {
                  name: 'destination',
                  type: 'select',
                  label: 'Води към',
                  options: destinationOptions,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'documents',
      type: 'group',
      label: 'Документи след курса',
      fields: [
        ...head(false),
        lines('items', 'Документи'),
        {
          name: 'fees',
          type: 'group',
          label: 'Такси (тъмното каре)',
          fields: [
            text('text', 'Първи ред'),
            text('duplicate', 'Дубликат'),
            textarea('note', 'Бележка'),
          ],
        },
        {
          name: 'samples',
          type: 'relationship',
          relationTo: 'documents',
          hasMany: true,
          maxRows: 3,
          label: 'Образци',
        },
      ],
    },
    {
      name: 'projects',
      type: 'group',
      label: 'Проекти',
      fields: [
        ...head(false),
        {
          name: 'projects',
          type: 'relationship',
          relationTo: 'funded-projects',
          hasMany: true,
          label: 'Проекти',
        },
      ],
    },
    {
      name: 'elearning',
      type: 'group',
      label: 'Електронно обучение',
      fields: [
        ...head(),
        lines('benefits', 'Предимства'),
        text('platformsTitle', 'Заглавие на платформите'),
        {
          name: 'platforms',
          type: 'array',
          label: 'Платформи',
          fields: [{ name: 'name', type: 'text', label: 'Име', required: true }],
        },
      ],
    },
  ],
}
