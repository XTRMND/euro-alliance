import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'

// The team (docs/cms-schema.md § 3). Not shown yet: the About page's «Екип» section is text only
// in Figma, and member cards with photos have no design. Nothing is seeded: names, roles and
// photos come from the client.
export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Член на екипа', plural: 'Екип' },
  orderable: true,
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'role'] },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollection] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Име', required: true, localized: true },
        { name: 'role', type: 'text', label: 'Роля', localized: true },
      ],
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Снимка',
      filterOptions: { kind: { equals: 'photo' } },
    },
  ],
}
