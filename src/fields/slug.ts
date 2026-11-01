import type { TextField } from 'payload'
import { slugify } from '@/lib/slug'

/**
 * The URL slug (docs/content-import.md § 4): transliterated from `from` when left empty, cleaned
 * up when typed. Unique per locale, so English can have its own slugs later.
 */
export function slugField(from = 'title'): TextField {
  return {
    name: 'slug',
    type: 'text',
    label: 'Адрес (slug)',
    localized: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: 'Попълва се от заглавието, ако е празно.',
    },
    hooks: {
      beforeValidate: [
        ({ value, siblingData }) => {
          const source = typeof value === 'string' && value.trim() ? value : siblingData?.[from]
          return typeof source === 'string' ? slugify(source) || undefined : value
        },
      ],
    },
  }
}
