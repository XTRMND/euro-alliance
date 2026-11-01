import { HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateCollection } from '@/hooks/revalidate'

// docs/cms-schema.md § 3. Added with the homepage, the first page that shows news; the news pages
// arrive in PR 15. The cover is a photo, shown in its duotone tint (55% on the homepage, 30% on
// the news pages). The body allows H2 and H3 only: the page H1 is the title, and the H2s feed the
// contents rail.

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'Новина', plural: 'Новини' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'date', '_status'] },
  defaultSort: '-date',
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollection] },
  fields: [
    { name: 'title', type: 'text', label: 'Заглавие', required: true, localized: true },
    slugField(),
    {
      name: 'date',
      type: 'date',
      label: 'Дата',
      required: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Снимка',
      filterOptions: { kind: { equals: 'photo' } },
      admin: { description: 'Само истинска снимка. Без снимка картата е без изображение.' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Кратко описание',
      localized: true,
      admin: { description: 'За картите и за описанието в търсачките.' },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Текст',
      localized: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures.filter((feature) => feature.key !== 'heading'),
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
        ],
      }),
    },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Галерия',
      filterOptions: { kind: { equals: 'photo' } },
    },
    {
      name: 'related',
      type: 'relationship',
      relationTo: 'news',
      hasMany: true,
      maxRows: 3,
      label: 'Свързани новини',
    },
    {
      name: 'legacyId',
      type: 'text',
      label: 'Стар номер',
      admin: { position: 'sidebar', description: 'От стария сайт, за пренасочването.' },
    },
    { name: 'legacyUrl', type: 'text', label: 'Стар адрес', admin: { position: 'sidebar' } },
  ],
}
