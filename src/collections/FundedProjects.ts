import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'

// Funded projects (docs/cms-schema.md § 3), shown in Project cards (259:574): the title, facts as
// label and value rows, goals as chips, and the EU logo strip exactly as uploaded (publicity
// rules). Amounts are the official text from the contract («808 140,00 лв (413 195,42 €)»),
// never a number to convert.
export const FundedProjects: CollectionConfig = {
  slug: 'funded-projects',
  labels: { singular: 'Проект', plural: 'Проекти с финансиране' },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'code'],
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollection] },
  fields: [
    { name: 'title', type: 'text', label: 'Заглавие', required: true, localized: true },
    {
      name: 'code',
      type: 'text',
      label: 'Номер на проекта',
      admin: { description: 'Например BG16RFPR001-1.004-1004. Не се показва в картата.' },
    },
    {
      name: 'facts',
      type: 'array',
      label: 'Данни',
      admin: { description: 'Сумите както са в договора, без преобразуване.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', label: 'Надпис', required: true, localized: true },
            { name: 'value', type: 'text', label: 'Стойност', required: true, localized: true },
          ],
        },
      ],
    },
    {
      name: 'goals',
      type: 'array',
      label: 'Цели',
      fields: [{ name: 'goal', type: 'text', label: 'Цел', required: true, localized: true }],
    },
    {
      name: 'logoStrip',
      type: 'upload',
      relationTo: 'media',
      label: 'Лента с логата на ЕС',
      filterOptions: { kind: { equals: 'logo' } },
      admin: { description: 'Файлът точно както е предоставен: без изрязване и промени.' },
    },
  ],
}
