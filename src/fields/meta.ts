import type { GroupField } from 'payload'

/**
 * Search engines and sharing (docs/cms-schema.md § 1, PR 22): an optional title, description and
 * image for the page's <head>. Empty fields fall back to the page's own title, lead and photo.
 */
export function metaField(): GroupField {
  return {
    name: 'meta',
    type: 'group',
    label: 'За търсачките и споделяне',
    admin: {
      position: 'sidebar',
      description: 'По избор. Празно: заглавието, въвеждащият текст и снимката на страницата.',
    },
    fields: [
      { name: 'title', type: 'text', label: 'Заглавие', localized: true, maxLength: 70 },
      {
        name: 'description',
        type: 'textarea',
        label: 'Описание',
        localized: true,
        maxLength: 200,
      },
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
        label: 'Изображение',
        filterOptions: { mimeType: { contains: 'image' } },
      },
    ],
  }
}
