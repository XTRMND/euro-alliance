import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'

// ЦПО professions (docs/cms-schema.md § 3): the list on «Професии и специалности», one row per
// profession in its direction's card (236:3755). The order here is the page's order: drag the
// rows in the admin; a direction's card comes where its first profession is.
export const Professions: CollectionConfig = {
  slug: 'professions',
  labels: { singular: 'Професия', plural: 'Професии (ЦПО)' },
  orderable: true,
  admin: {
    hideAPIURL: true,
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'directionCode', 'degrees'],
    description:
      'Професиите на страницата «Професии и специалности», в този ред (подреждат се с влачене).',
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollection] },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'directionCode',
          type: 'text',
          label: 'Код на направлението',
          required: true,
          validate: (value: string | null | undefined) =>
            /^\d{3}$/.test(value ?? '') || 'Три цифри, например 041.',
        },
        {
          name: 'directionName',
          type: 'text',
          label: 'Професионално направление',
          required: true,
          localized: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Професия', required: true, localized: true },
        {
          name: 'code',
          type: 'text',
          label: 'Код на професията',
          required: true,
          unique: true,
          validate: (value: string | null | undefined) =>
            /^\d{6}$/.test(value ?? '') || 'Шест цифри, например 041101.',
        },
      ],
    },
    {
      name: 'degrees',
      type: 'select',
      label: 'Степени на професионална квалификация',
      hasMany: true,
      required: true,
      options: [
        { value: 'I', label: 'I степен' },
        { value: 'II', label: 'II степен' },
        { value: 'III', label: 'III степен' },
      ],
    },
  ],
}
