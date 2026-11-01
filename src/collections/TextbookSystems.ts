import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'

// Textbook systems (docs/cms-schema.md § 3), shown in System cards (135:389) on program pages:
// the publisher or age group on a chip, the title, the bubble («6 нива», «C1 до ниво»), a
// description, the levels and an optional note on a navy strip («Включено: DVD …»).
export const TextbookSystems: CollectionConfig = {
  slug: 'textbook-systems',
  labels: { singular: 'Учебна система', plural: 'Учебни системи' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'kicker'] },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollection] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Име', required: true },
        {
          name: 'kicker',
          type: 'text',
          label: 'Надпис над името',
          localized: true,
          admin: { description: 'Издател или възраст, например «Longman» или «III–VII клас».' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'count',
          type: 'text',
          label: 'Число в балончето',
          admin: { description: 'Например 6 или C1.' },
        },
        {
          name: 'countLabel',
          type: 'text',
          label: 'Надпис в балончето',
          localized: true,
          admin: { description: 'Например «нива» или «до ниво».' },
        },
      ],
    },
    { name: 'description', type: 'textarea', label: 'Описание', localized: true },
    {
      name: 'levels',
      type: 'array',
      label: 'Нива',
      fields: [{ name: 'level', type: 'text', label: 'Ниво', required: true, localized: true }],
    },
    {
      name: 'strip',
      type: 'group',
      label: 'Бележка на тъмната ивица',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Надпис',
              localized: true,
              admin: { description: 'Например «Включено», «Фокус», «Цел».' },
            },
            { name: 'note', type: 'text', label: 'Бележка', localized: true },
          ],
        },
      ],
    },
  ],
}
