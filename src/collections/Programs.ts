import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { anchorPattern, programBlocks } from '@/blocks'
import { topicOptions } from '@/collections/Courses'
import { slugField } from '@/fields/slug'
import { revalidateCollection } from '@/hooks/revalidate'
import { indexAfterChange, indexAfterDelete } from '@/lib/search-index'
import { destinationOptions } from '@/lib/destinations'
import { languages } from '@/lib/routes'
import { metaField } from '@/fields/meta'

// Program pages (docs/cms-schema.md § 3). A language program (one per language and audience,
// /ezitsi/{language}/{audience}) gets the notebook hero with its flag; every other type has one
// page (/vaucheri, /profesionalno-obuchenie/profesii …, and /prevodi for the translation agency)
// with the course-page hero: a sticker and a count bubble. The sections are blocks.

const languageLabels = {
  english: 'Английски',
  german: 'Немски',
  french: 'Френски',
  spanish: 'Испански',
  italian: 'Италиански',
  bulgarian: 'Български',
  russian: 'Руски',
}

const isLanguage = (data: { type?: string } | undefined) => data?.type === 'language'

export const Programs: CollectionConfig = {
  slug: 'programs',
  labels: { singular: 'Програма', plural: 'Програми' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'language', 'audience', '_status'],
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: {
    afterChange: [revalidateCollection, indexAfterChange],
    afterDelete: [revalidateCollection, indexAfterDelete],
    beforeValidate: [
      // One page per language and audience, and one per other type.
      async ({ data, req, originalDoc }) => {
        const type = data?.type ?? originalDoc?.type
        if (!type) return data
        const language = isLanguage({ type })
        if (language && (!data?.language || !data.audience)) return data
        const { docs } = await req.payload.find({
          collection: 'programs',
          where: {
            and: [
              { type: { equals: type } },
              ...(language
                ? [
                    { language: { equals: data?.language } },
                    { audience: { equals: data?.audience } },
                  ]
                : []),
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          depth: 0,
          limit: 1,
          draft: true,
          req,
        })
        if (docs.length > 0) {
          throw new Error(
            language
              ? 'Вече има програма за този език и аудитория.'
              : 'Вече има програма от този вид.',
          )
        }
        return data
      },
    ],
  },
  fields: [
    metaField(),
    {
      name: 'legacyUrl',
      type: 'text',
      label: 'Стар адрес',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Страница, внесена от стария сайт (PR 21).',
      },
    },
    { name: 'title', type: 'text', label: 'Заглавие (в админа)', required: true, localized: true },
    slugField(),
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          label: 'Вид',
          required: true,
          options: [
            { value: 'language', label: 'Език' },
            { value: 'vocational', label: 'ЦПО професии' },
            { value: 'vouchers', label: 'Ваучери' },
            { value: 'teachers', label: 'Педагогически специалисти' },
            { value: 'farmers', label: 'Земеделци' },
            { value: 'computer', label: 'Компютърни курсове' },
            { value: 'translations', label: 'Преводи' },
          ],
        },
        {
          name: 'language',
          type: 'select',
          label: 'Език',
          options: languages.map((value) => ({ value, label: languageLabels[value] })),
          admin: { condition: isLanguage },
        },
        {
          name: 'audience',
          type: 'select',
          label: 'Аудитория',
          options: [
            { value: 'adults', label: 'Възрастни' },
            { value: 'students', label: 'Ученици' },
          ],
          admin: { condition: isLanguage },
        },
      ],
    },
    {
      name: 'hero',
      type: 'group',
      label: 'Начало на страницата',
      fields: [
        { name: 'kicker', type: 'text', label: 'Надзаглавие', localized: true },
        { name: 'heading', type: 'text', label: 'Заглавие', required: true, localized: true },
        {
          name: 'highlight',
          type: 'text',
          label: 'Подчертана фраза',
          localized: true,
          admin: { description: 'Част от заглавието, с пясъчен маркер.' },
        },
        {
          name: 'highlightBreak',
          type: 'checkbox',
          label: 'Подчертаната фраза на нов ред',
          defaultValue: true,
          admin: { condition: (data) => !isLanguage(data) },
        },
        { name: 'lead', type: 'textarea', label: 'Текст', localized: true },
        {
          name: 'ctas',
          type: 'array',
          label: 'Бутони',
          maxRows: 2,
          admin: {
            description:
              'Към страница или към секция на тази страница (котвата ѝ). На езиковите програми «Курсове: езици» води към предстоящите курсове на страницата, ако има такива.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', type: 'text', label: 'Текст', required: true, localized: true },
                {
                  name: 'destination',
                  type: 'select',
                  label: 'Води към',
                  options: destinationOptions,
                },
                {
                  name: 'anchor',
                  type: 'text',
                  label: 'Или към секция (котва)',
                  validate: (
                    value: string | null | undefined,
                    { siblingData }: { siblingData: { destination?: string | null } },
                  ) =>
                    value
                      ? anchorPattern.test(value) || 'Само малки латински букви, цифри и тирета.'
                      : Boolean(siblingData.destination) || 'Изберете страница или котва.',
                },
              ],
            },
          ],
        },
        {
          name: 'sticker',
          type: 'select',
          label: 'Стикер',
          options: topicOptions,
          admin: { condition: (data) => !isLanguage(data) },
        },
        {
          name: 'countBubble',
          type: 'group',
          label: 'Балонче с число',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'value', type: 'text', label: 'Число' },
                { name: 'label', type: 'text', label: 'Надпис', localized: true },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'upcoming',
      type: 'group',
      label: 'Предстоящи курсове',
      admin: {
        description:
          'Курсовете от «Курсове»: на езиковите програми по езика и аудиторията, на ваучерите тези с ваучер, на другите от категорията. Без заглавие или без курсове секцията не се показва.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'heading', type: 'text', label: 'Заглавие', localized: true },
            {
              name: 'linkLabel',
              type: 'text',
              label: 'Текст на връзката към всички',
              localized: true,
            },
          ],
        },
      ],
    },
    {
      name: 'notebook',
      type: 'group',
      label: 'Тетрадката (езикови програми)',
      admin: { condition: isLanguage },
      fields: [
        { name: 'title', type: 'text', label: 'Заглавие (на ръка)', localized: true },
        {
          name: 'highlight',
          type: 'number',
          label: 'Подчертана фраза (номер)',
          min: 1,
          max: 4,
          admin: { description: 'Коя фраза е с маркер; празно: без маркер.' },
        },
        {
          name: 'phrases',
          type: 'array',
          label: 'Фрази',
          maxRows: 4,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'phrase', type: 'text', label: 'Фраза', required: true },
                { name: 'translation', type: 'text', label: 'Превод', localized: true },
              ],
            },
          ],
        },
        {
          name: 'note',
          type: 'group',
          label: 'Бележка',
          fields: [
            { name: 'title', type: 'text', label: 'Заглавие', localized: true },
            {
              name: 'steps',
              type: 'array',
              label: 'Стъпки',
              maxRows: 4,
              fields: [
                { name: 'text', type: 'text', label: 'Текст', required: true, localized: true },
              ],
            },
            { name: 'done', type: 'number', label: 'Отметнати', min: 0, max: 4 },
          ],
        },
      ],
    },
    { name: 'sections', type: 'blocks', label: 'Секции', blocks: programBlocks },
  ],
}
