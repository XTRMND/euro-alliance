import type { CollectionConfig } from 'payload'
import { isStaff } from '@/access'

// The site search's index (docs/cms-schema.md § 8): one record per published page, kept in sync
// by the hooks in src/lib/search-index.ts and rebuilt on every start. Not Payload's search plugin:
// it indexes collections only, and the About page is a global. Read through PostgreSQL full-text
// search and trigram similarity (src/lib/search.ts); nobody edits it by hand.
export const SearchIndex: CollectionConfig = {
  slug: 'search',
  labels: { singular: 'Запис в търсенето', plural: 'Търсене (индекс)' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'url'],
    description: 'Попълва се автоматично от публикуваното съдържание.',
  },
  access: { read: isStaff, create: () => false, update: () => false, delete: () => false },
  fields: [
    {
      name: 'type',
      type: 'select',
      label: 'Вид',
      required: true,
      index: true,
      options: [
        { value: 'course', label: 'Курс' },
        { value: 'page', label: 'Страница' },
        { value: 'news', label: 'Новина' },
      ],
    },
    { name: 'title', type: 'text', label: 'Заглавие', required: true },
    { name: 'path', type: 'text', label: 'Раздел' },
    { name: 'excerpt', type: 'textarea', label: 'Откъс' },
    { name: 'text', type: 'textarea', label: 'Текст' },
    { name: 'url', type: 'text', label: 'Адрес', required: true },
    {
      name: 'source',
      type: 'text',
      label: 'Източник',
      required: true,
      unique: true,
      admin: { description: 'Колекция и номер, например news:12.' },
    },
    { name: 'sourceId', type: 'number', label: 'Номер на източника' },
    { name: 'publishedAt', type: 'date', label: 'Дата' },
  ],
}
