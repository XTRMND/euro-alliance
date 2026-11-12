import type { CollectionConfig, TextFieldSingleValidation } from 'payload'
import { isAdmin, isStaff } from '@/access'
import { normalizePath, staticRedirects } from '@/lib/redirects'

/** A path or an https address, and never an address that redirects again. */
const validateTarget: TextFieldSingleValidation = async (value, { req }) => {
  if (!value || !/^(\/|https:\/\/)/.test(value)) return 'Път, започващ с /, или https:// адрес.'
  if (!value.startsWith('/')) return true
  const path = normalizePath(value.split(/[?#]/)[0])
  if (staticRedirects[path]) return 'Този адрес също се пренасочва: посочете крайния.'
  const { totalDocs } = await req.payload.count({
    collection: 'redirects',
    where: { from: { equals: path } },
    req,
  })
  return totalDocs === 0 || 'Този адрес също се пренасочва: посочете крайния.'
}

// Redirects (docs/cms-schema.md § 3, docs/content-import.md § 5): old addresses that the fixed
// map in src/lib/redirects.ts doesn't cover, each to its new page with a 301. The import fills it
// (one per news article, PR 21); the admin can add more. Looked up by the proxy (src/proxy.ts)
// without regard to case or a trailing slash. A target is never another redirect: one hop.
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Пренасочване', plural: 'Пренасочвания' },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'source'],
  },
  access: { read: isStaff, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (typeof data?.from === 'string') {
          // A pasted full address keeps only its path.
          data.from = normalizePath(data.from.replace(/^https?:\/\/[^/]+/i, ''))
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      label: 'Стар адрес',
      required: true,
      unique: true,
      admin: { description: 'Пътят от стария сайт, например /News/123/zaglavie.' },
      validate: (value: string | null | undefined) => {
        if (!value?.startsWith('/')) return 'Започва с /.'
        if (staticRedirects[value]) return 'Този адрес вече се пренасочва автоматично.'
        return true
      },
    },
    {
      name: 'to',
      type: 'text',
      label: 'Нов адрес',
      required: true,
      admin: { description: 'Път в новия сайт (/novini/…) или пълен адрес.' },
      validate: validateTarget,
    },
    {
      name: 'source',
      type: 'select',
      label: 'Източник',
      defaultValue: 'manual',
      options: [
        { value: 'import', label: 'Импорт' },
        { value: 'manual', label: 'Ръчно' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
