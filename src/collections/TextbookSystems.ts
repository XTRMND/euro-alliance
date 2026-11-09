import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { systemCardFields } from '@/fields/system-card'
import { revalidateCollection } from '@/hooks/revalidate'
import { adminEditedAtField, markAdminEdit } from '@/hooks/admin-edits'

// Textbook systems (docs/cms-schema.md § 3), shown in System cards (135:389) on program pages:
// the publisher or age group on a chip, the title, the bubble («6 нива», «C1 до ниво»), a
// description, the levels and an optional note on a navy strip («Включено: DVD …»).
export const TextbookSystems: CollectionConfig = {
  slug: 'textbook-systems',
  labels: { singular: 'Учебна система', plural: 'Учебни системи' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'kicker'] },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: {
    beforeChange: [markAdminEdit],
    afterChange: [revalidateCollection],
    afterDelete: [revalidateCollection],
  },
  fields: [...systemCardFields({ localizedName: false }), adminEditedAtField],
}
