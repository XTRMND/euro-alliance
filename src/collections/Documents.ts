import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'

// Documents and licences (docs/cms-schema.md § 3) shown as Document photos (193:351) on the About
// page: the client's licences and certificates, and sample diplomas. The scan is the picture; a
// visitor opens it in full size. Ordered by dragging in the admin.
export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Документ', plural: 'Документи и лицензи' },
  orderable: true,
  admin: {
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'type'],
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollection] },
  fields: [
    { name: 'title', type: 'text', label: 'Надпис', required: true, localized: true },
    {
      name: 'type',
      type: 'select',
      label: 'Вид',
      required: true,
      options: [
        { value: 'licence', label: 'Лиценз' },
        { value: 'certificate', label: 'Сертификат' },
        { value: 'sample', label: 'Образец' },
      ],
    },
    {
      name: 'scan',
      type: 'upload',
      relationTo: 'media',
      label: 'Сканиран документ',
      required: true,
      filterOptions: { kind: { equals: 'scan' } },
      admin: { description: 'Показва се както е, без оцветяване.' },
    },
  ],
}
