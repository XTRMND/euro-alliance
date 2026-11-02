import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isStaff } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'
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
    // Pages that show a photo or logo read it with its tints, tagged with this collection.
    afterChange: [regenerateTints, revalidateCollection],
    afterDelete: [revalidateCollection],
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
    {
      // A poster or a photo with a caption in it: cropped to the article banner's wide slot, the
      // text would be cut, so it shows only on cards (src/lib/media/slots.ts).
      name: 'textInImage',
      type: 'checkbox',
      label: 'Има текст в изображението',
      defaultValue: false,
      admin: {
        description:
          'Плакат или снимка с надпис: не се показва като широк банер в новина, където текстът би се изрязал.',
        condition: (data) => data?.kind === 'photo',
      },
    },
    {
      // The four tints of a photo, so a page gets them with the photo (DuotoneImage).
      name: 'tints',
      type: 'join',
      collection: 'media-tints',
      on: 'source',
      admin: { hidden: true },
    },
  ],
}
