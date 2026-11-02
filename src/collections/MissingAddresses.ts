import type { CollectionConfig } from 'payload'
import { isAdmin, isStaff } from '@/access'

// Addresses that ended on the 404 page (the user, 02.11.2026: collect the old addresses that still
// get a 404 after launch). The proxy (src/proxy.ts) counts them and writes the counts once a
// minute; nobody adds them by hand. One worth keeping becomes a redirect (Пренасочвания), and its
// row can then go. Bot noise (.php, wp-…, .env) isn't recorded.
export const MissingAddresses: CollectionConfig = {
  slug: 'missing-addresses',
  labels: { singular: 'Липсващ адрес', plural: 'Липсващи адреси' },
  defaultSort: '-hits',
  admin: {
    useAsTitle: 'path',
    defaultColumns: ['path', 'hits', 'lastSeen'],
    description:
      'Адреси, които са стигнали до страницата «Тази страница я няма». Важните пренасочете в «Пренасочвания» и изтрийте реда.',
  },
  access: { read: isStaff, create: () => false, update: () => false, delete: isAdmin },
  fields: [
    {
      name: 'path',
      type: 'text',
      label: 'Адрес',
      required: true,
      unique: true,
      admin: { readOnly: true },
    },
    {
      name: 'hits',
      type: 'number',
      label: 'Посещения',
      required: true,
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'lastSeen',
      type: 'date',
      label: 'Последно',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}
