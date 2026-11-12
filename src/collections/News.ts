import { BlocksFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block, CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateCollection } from '@/hooks/revalidate'
import { searchChanged, searchRemoved } from '@/lib/search-records'
import { metaField } from '@/fields/meta'
import { legacyRedirectHooks } from '@/hooks/legacy-redirect'
import { routes } from '@/lib/routes'
import { adminEditedAtField, markAdminEdit } from '@/hooks/admin-edits'

// docs/cms-schema.md § 3. Added with the homepage, the first page that shows news; the news pages
// arrive in PR 15. The cover is a photo, shown in its duotone tint (55% on the homepage, 30% on
// the news pages). The body allows H2 and H3 only: the page H1 is the title, and the H2s feed the
// contents rail (183:2574). Besides text, quotes and lists, the body takes two blocks from the
// article frame: a row of figures with a caption, and a link card.

/** A row of Figure cards (259:410) with a caption under it (186:2669). Only official numbers. */
const NewsFigures: Block = {
  slug: 'newsFigures',
  labels: { singular: 'Числа', plural: 'Числа' },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Числа',
      minRows: 1,
      maxRows: 4,
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
    { name: 'caption', type: 'text', label: 'Надпис под числата', localized: true },
  ],
}

/** The navy link card (186:2695): a label, the address and a button, one link. */
const NewsLinkCard: Block = {
  slug: 'newsLinkCard',
  labels: { singular: 'Връзка', plural: 'Връзки' },
  fields: [
    { name: 'label', type: 'text', label: 'Надпис', localized: true },
    {
      name: 'url',
      type: 'text',
      label: 'Адрес',
      required: true,
      validate: (value: string | null | undefined) =>
        /^https?:\/\//.test(value ?? '') || 'Пълен адрес, започващ с https://.',
    },
    { name: 'buttonLabel', type: 'text', label: 'Текст на бутона', localized: true },
  ],
}

// The old site's address redirects here while the record is published (PR 21).
const legacyRedirect = legacyRedirectHooks<{
  id: number
  slug?: string | null
  _status?: string | null
  legacyUrl?: string | null
}>('news', (doc) => (doc.slug ? routes.newsArticle(doc.slug) : null))

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'Новина', plural: 'Новини' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'date', '_status'] },
  defaultSort: '-date',
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: {
    beforeChange: [markAdminEdit],
    afterChange: [revalidateCollection, searchChanged, legacyRedirect.afterChange],
    afterDelete: [revalidateCollection, searchRemoved, legacyRedirect.afterDelete],
  },
  fields: [
    adminEditedAtField,
    metaField(),
    { name: 'title', type: 'text', label: 'Заглавие', required: true, localized: true },
    {
      name: 'shortTitle',
      type: 'text',
      label: 'Кратко заглавие',
      localized: true,
      admin: { description: 'За пътечката над заглавието. Празно: цялото заглавие.' },
    },
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
      name: 'lead',
      type: 'textarea',
      label: 'Въвеждащ абзац',
      localized: true,
      admin: { description: 'По избор: първият абзац на новината, с по-едър шрифт.' },
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
          BlocksFeature({ blocks: [NewsFigures, NewsLinkCard] }),
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
      admin: { description: 'Още не се показва: галерията няма дизайн.' },
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
