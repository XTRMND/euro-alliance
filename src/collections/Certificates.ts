import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'
import { adminEditedAtField, markAdminEdit } from '@/hooks/admin-edits'

// Exams and certificates (Certificate card 145:364) in the `#sertifikati` section of the language
// pages: an international certificate with its issuer («Cambridge ESOL»), or a state exam with
// when it's taken («12. клас»); then the exam's name, the code on the seal and the book we prepare
// with. The card's first line is the issuer, or else «Кога».
export const certificateKinds = {
  international: 'Международен сертификат',
  state: 'Държавен изпит',
} as const
export const Certificates: CollectionConfig = {
  slug: 'certificates',
  labels: { singular: 'Изпит или сертификат', plural: 'Изпити и сертификати' },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'name',
    defaultColumns: ['name', 'kind', 'when', 'code', 'issuer'],
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
        {
          name: 'kind',
          type: 'select',
          label: 'Вид',
          required: true,
          defaultValue: 'international',
          options: Object.entries(certificateKinds).map(([value, label]) => ({ value, label })),
        },
        {
          name: 'when',
          type: 'text',
          label: 'Кога',
          localized: true,
          admin: {
            description:
              'Кога се държи изпитът, например «12. клас». На картата стои на първия ред, ако «Издава» е празно.',
          },
        },
      ],
    },
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
