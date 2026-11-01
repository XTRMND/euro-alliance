import type { Block, Field } from 'payload'
import { destinationOptions } from '@/lib/destinations'

// Program page sections (docs/cms-schema.md § 3, Programs): each block is one component of
// page 03. Every block has its section heading; empty optional fields hide their element.

const heading: Field[] = [
  {
    type: 'row',
    fields: [
      { name: 'heading', type: 'text', label: 'Заглавие', localized: true },
      {
        name: 'highlight',
        type: 'text',
        label: 'Подчертана фраза',
        localized: true,
        admin: { description: 'Част от заглавието.' },
      },
    ],
  },
  { name: 'lead', type: 'textarea', label: 'Въвеждащ текст', localized: true },
]

const link = (name: string, label: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', label: 'Текст', localized: true },
        { name: 'destination', type: 'select', label: 'Води към', options: destinationOptions },
      ],
    },
  ],
})

export const FeaturesBlock: Block = {
  slug: 'features',
  labels: { singular: 'Предимства', plural: 'Предимства' },
  fields: [
    ...heading,
    {
      name: 'items',
      type: 'array',
      label: 'Карти',
      fields: [
        { name: 'title', type: 'text', label: 'Заглавие', required: true, localized: true },
        { name: 'text', type: 'textarea', label: 'Текст', localized: true },
      ],
    },
  ],
}

export const LevelsBlock: Block = {
  slug: 'levels',
  labels: { singular: 'Нива', plural: 'Нива' },
  fields: [
    ...heading,
    {
      name: 'items',
      type: 'array',
      label: 'Нива',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'level', type: 'text', label: 'Ниво', required: true },
            { name: 'title', type: 'text', label: 'Заглавие', localized: true },
          ],
        },
        { name: 'text', type: 'textarea', label: 'Текст', localized: true },
      ],
    },
  ],
}

export const StepsBlock: Block = {
  slug: 'steps',
  labels: { singular: 'Стъпки', plural: 'Стъпки' },
  fields: [
    ...heading,
    {
      name: 'items',
      type: 'array',
      label: 'Стъпки',
      fields: [
        { name: 'title', type: 'text', label: 'Заглавие', required: true, localized: true },
        { name: 'text', type: 'textarea', label: 'Текст', localized: true },
      ],
    },
  ],
}

export const TextbookSystemsBlock: Block = {
  slug: 'textbookSystems',
  labels: { singular: 'Учебни системи', plural: 'Учебни системи' },
  fields: [
    ...heading,
    {
      name: 'systems',
      type: 'relationship',
      relationTo: 'textbook-systems',
      hasMany: true,
      label: 'Системи',
    },
    link('link', 'Връзка под картите'),
    {
      name: 'columns',
      type: 'select',
      label: 'Нивата в картите',
      defaultValue: 'two',
      options: [
        { value: 'two', label: 'В две колони' },
        { value: 'one', label: 'В една колона' },
      ],
    },
  ],
}

export const CertificatesBlock: Block = {
  slug: 'certificates',
  labels: { singular: 'Сертификати', plural: 'Сертификати' },
  admin: { group: 'Котва #sertifikati' },
  fields: [
    ...heading,
    {
      name: 'certificates',
      type: 'relationship',
      relationTo: 'certificates',
      hasMany: true,
      label: 'Сертификати',
    },
  ],
}

export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'Въпроси', plural: 'Въпроси' },
  fields: [
    ...heading,
    {
      name: 'items',
      type: 'array',
      label: 'Въпроси',
      fields: [
        { name: 'question', type: 'text', label: 'Въпрос', required: true, localized: true },
        { name: 'answer', type: 'richText', label: 'Отговор', required: true, localized: true },
      ],
    },
  ],
}

export const FiguresBlock: Block = {
  slug: 'figures',
  labels: { singular: 'Числа', plural: 'Числа' },
  fields: [
    ...heading,
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
            { name: 'label', type: 'text', label: 'Надпис', required: true, localized: true },
          ],
        },
      ],
    },
  ],
}

export const CalloutBlock: Block = {
  slug: 'callout',
  labels: { singular: 'Покана', plural: 'Покани' },
  fields: [
    {
      name: 'layout',
      type: 'select',
      label: 'Подредба',
      defaultValue: 'row',
      options: [
        { value: 'row', label: 'В ред' },
        { value: 'stack', label: 'Една под друга' },
      ],
    },
    { name: 'heading', type: 'text', label: 'Заглавие', required: true, localized: true },
    { name: 'text', type: 'textarea', label: 'Текст', localized: true },
    link('cta', 'Бутон'),
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Текст', plural: 'Текстове' },
  fields: [...heading, { name: 'body', type: 'richText', label: 'Текст', localized: true }],
}

export const programBlocks = [
  FeaturesBlock,
  LevelsBlock,
  StepsBlock,
  TextbookSystemsBlock,
  CertificatesBlock,
  FaqBlock,
  FiguresBlock,
  CalloutBlock,
  RichTextBlock,
]
