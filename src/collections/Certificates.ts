import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'
import { adminEditedAtField, markAdminEdit } from '@/hooks/admin-edits'

// International exams (Certificate card 145:364) in the `#sertifikati` section of the language
// pages: the issuer, the exam's name, the code on the seal and the book we prepare with.
export const Certificates: CollectionConfig = {
  slug: 'certificates',
  labels: { singular: 'Сертификат', plural: 'Сертификати' },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'issuer'],
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: {
    beforeChange: [markAdminEdit],
    afterChange: [revalidateCollection],
    afterDelete: [revalidateCollection],
  },
  fields: [
    adminEditedAtField,
    { name: 'name', type: 'text', label: 'Име на изпита', required: true },
    {
      type: 'row',
      fields: [
        { name: 'issuer', type: 'text', label: 'Издава', localized: true },
        {
          name: 'code',
          type: 'text',
          label: 'Код на печата',
          admin: { description: 'Например FCE.' },
        },
      ],
    },
    {
      name: 'prep',
      type: 'text',
      label: 'Подготовка с',
      admin: { description: 'Учебникът, с който се подготвяме. Празно: редът не се показва.' },
    },
  ],
}
