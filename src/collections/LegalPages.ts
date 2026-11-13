import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block, CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { destinationOptions } from '@/lib/destinations'
import { revalidateCollection } from '@/hooks/revalidate'
import { searchChanged, searchRemoved } from '@/lib/search-records'
import { metaField } from '@/fields/meta'

// Legal pages (docs/cms-schema.md § 3): the privacy policy (218:2842) and the cookie policy
// (224:3208), one document each, at fixed addresses (routes.privacy(), routes.cookies()). The text
// is a list of sections: each has its H2, a shorter label for the contents rail (Figma's labels
// are shorter than the headings) and its body. Besides paragraphs, numbered lists and links, a
// body takes a table (the cookie categories) and a link button to another page. Versions are kept
// so every change is traceable.

/** A table (224:3350): a header row and rows of cells; on a phone each row stacks. */
const LegalTable: Block = {
  slug: 'legalTable',
  labels: { singular: 'Таблица', plural: 'Таблици' },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: 'Колони',
      minRows: 2,
      maxRows: 4,
      fields: [{ name: 'label', type: 'text', label: 'Заглавие на колоната', required: true }],
    },
    {
      name: 'rows',
      type: 'array',
      label: 'Редове',
      minRows: 1,
      fields: [
        {
          name: 'cells',
          type: 'array',
          label: 'Клетки',
          admin: { description: 'По една клетка за всяка колона, в същия ред.' },
          fields: [{ name: 'text', type: 'textarea', label: 'Текст', required: true }],
        },
      ],
    },
  ],
}

/** A link button (Button Style=Link, 18:28) to a page of the site. */
const LegalLink: Block = {
  slug: 'legalLink',
  labels: { singular: 'Бутон-връзка', plural: 'Бутони-връзки' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', label: 'Текст', required: true },
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
}

export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  labels: { singular: 'Правна страница', plural: 'Правни страници' },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'page', 'updatedOn'],
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true, maxPerDoc: 50 },
  hooks: {
    afterChange: [revalidateCollection, searchChanged],
    afterDelete: [revalidateCollection, searchRemoved],
  },
  fields: [
    metaField(),
    {
      name: 'page',
      type: 'select',
      label: 'Страница',
      required: true,
      unique: true,
      options: [
        { value: 'privacy', label: 'Защита на личните данни (/poveritelnost)' },
        { value: 'cookies', label: 'Политика за бисквитките (/biskvitki)' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'updatedOn',
      type: 'date',
      label: 'Последна актуализация',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
        description:
          'Датата на последната промяна на политиката; показва се под текста. Празно: не се показва.',
      },
    },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'media',
      label: 'PDF',
      filterOptions: { mimeType: { equals: 'application/pdf' } },
      admin: {
        position: 'sidebar',
        description: 'По избор: за бутона «Изтегли като PDF». Без файл бутонът не се показва.',
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', label: 'Заглавие', required: true, localized: true },
        {
          name: 'highlight',
          type: 'text',
          label: 'Подчертана фраза',
          localized: true,
          admin: { description: 'Част от заглавието.' },
        },
      ],
    },
    {
      name: 'kicker',
      type: 'text',
      label: 'Ред под заглавието',
      localized: true,
      admin: { description: 'Показва се с главни букви.' },
    },
    {
      name: 'sections',
      type: 'array',
      label: 'Раздели',
      minRows: 1,
      labels: { singular: 'Раздел', plural: 'Раздели' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'heading', type: 'text', label: 'Заглавие', required: true, localized: true },
            {
              name: 'tocLabel',
              type: 'text',
              label: 'В съдържанието',
              localized: true,
              admin: { description: 'По избор: по-кратко име за съдържанието отстрани.' },
            },
          ],
        },
        {
          name: 'body',
          type: 'richText',
          label: 'Текст',
          localized: true,
          editor: lexicalEditor({
            features: ({ defaultFeatures }) => [
              ...defaultFeatures.filter(
                (feature) => !['heading', 'upload', 'relationship'].includes(feature.key),
              ),
              BlocksFeature({ blocks: [LegalTable, LegalLink] }),
            ],
          }),
        },
      ],
    },
  ],
}
