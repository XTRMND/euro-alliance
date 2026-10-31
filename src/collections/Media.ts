import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isStaff } from '@/access'
import { regenerateTints, removeTints } from '@/hooks/tints'
import { uploadDirs } from '@/lib/media/storage'

// docs/cms-schema.md § 4. Photos get four duotone tints (media-tints). Logos are stored and served
// byte for byte as uploaded (EU publicity rules); the admin thumbnail is a separate file.
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Файл', plural: 'Медия' },
  admin: { useAsTitle: 'alt', defaultColumns: ['filename', 'alt', 'kind', 'altReviewed'] },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isAdmin },
  upload: {
    staticDir: uploadDirs.media,
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 480,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
    ],
    adminThumbnail: 'thumbnail',
  },
  hooks: {
    afterChange: [regenerateTints],
    beforeDelete: [removeTints],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Алтернативен текст',
      required: true,
      localized: true,
      admin: { description: 'Какво показва изображението, за хора, които не го виждат.' },
    },
    {
      name: 'altReviewed',
      type: 'checkbox',
      label: 'Текстът е проверен',
      defaultValue: true,
      admin: { description: 'Изключено, когато текстът е чернова от импорта.' },
    },
    {
      name: 'kind',
      type: 'select',
      label: 'Вид',
      required: true,
      defaultValue: 'photo',
      options: [
        { label: 'Снимка', value: 'photo' },
        { label: 'Илюстрация', value: 'art' },
        { label: 'Сканиран документ', value: 'scan' },
        { label: 'Лого', value: 'logo' },
      ],
    },
    { name: 'credit', type: 'text', label: 'Автор', localized: true },
  ],
}
