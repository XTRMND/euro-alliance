import type { CollectionConfig } from 'payload'
import { isAdminField, isStaff, publishedOrStaff } from '@/access'

// docs/cms-schema.md § 3. The map and location fields arrive with the Location card (PR 11).
export const Offices: CollectionConfig = {
  slug: 'offices',
  labels: { singular: 'Офис', plural: 'Офиси' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'department', 'role'] },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  fields: [
    { name: 'name', type: 'text', label: 'Име', required: true, localized: true },
    { name: 'department', type: 'text', label: 'Направление', localized: true },
    {
      name: 'role',
      type: 'select',
      label: 'Роля при запитвания',
      required: true,
      unique: true,
      options: [
        { label: 'Курсове', value: 'courses' },
        { label: 'Преводи, Пловдив', value: 'translations-plovdiv' },
        { label: 'Преводи, София', value: 'translations-sofia' },
      ],
      access: { update: isAdminField },
      admin: {
        description: 'Определя накъде отиват запитванията. Променя се само от администратор.',
      },
    },
    { name: 'address', type: 'textarea', label: 'Адрес', required: true, localized: true },
    {
      name: 'phones',
      type: 'array',
      label: 'Телефони',
      fields: [{ name: 'number', type: 'text', label: 'Номер', required: true }],
    },
    {
      name: 'emails',
      type: 'array',
      label: 'Имейли',
      fields: [{ name: 'email', type: 'email', label: 'Имейл', required: true }],
    },
    { name: 'routes', type: 'richText', label: 'Как да стигнете', localized: true },
  ],
}
