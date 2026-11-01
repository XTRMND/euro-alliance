import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { programBlocks } from '@/blocks'
import { topicOptions } from '@/collections/Courses'
import { slugField } from '@/fields/slug'
import { revalidateCollection } from '@/hooks/revalidate'
import { destinationOptions } from '@/lib/destinations'
import { languages } from '@/lib/routes'

// Program pages (docs/cms-schema.md § 3). A language program (one per language and audience,
// /ezitsi/{language}/{audience}) gets the notebook hero with its flag; every other type gets the
// course-page hero with a sticker and a count bubble. The sections are blocks.

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
    afterChange: [revalidateCollection],
    afterDelete: [revalidateCollection],
    beforeValidate: [
      // One language page per language and audience.
      async ({ data, req, originalDoc }) => {
        if (!isLanguage(data) || !data?.language || !data.audience) return data
        const { docs } = await req.payload.find({
          collection: 'programs',
          where: {
            and: [
              { type: { equals: 'language' } },
              { language: { equals: data.language } },
              { audience: { equals: data.audience } },
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          depth: 0,
          limit: 1,
          draft: true,
          req,
        })
        if (docs.length > 0) throw new Error('Вече има програма за този език и аудитория.')
        return data
      },
    ],
  },
  fields: [
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
        { name: 'lead', type: 'textarea', label: 'Текст', localized: true },
        {
          name: 'ctas',
          type: 'array',
          label: 'Бутони',
          maxRows: 2,
          admin: {
            description:
              'На езиковите програми «Курсове: езици» води към предстоящите курсове на страницата, ако има такива.',
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
                  required: true,
                  options: destinationOptions,
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
        condition: isLanguage,
        description:
          'Курсовете по езика за тази аудитория, от «Курсове». Без курсове секцията не се показва.',
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
