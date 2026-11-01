import type { GlobalConfig } from 'payload'
import { anyone, isStaff } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

// Translation agency settings (docs/cms-schema.md § 7). The languages fill the language pair of
// «Изпратете документ» on the homepage and the Translations page; with none, the pair is hidden.
// Topics arrive with the Translations page (PR 14).

export const Translation: GlobalConfig = {
  slug: 'translation',
  label: 'Преводи',
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'languages',
      type: 'array',
      label: 'Езици',
      labels: { singular: 'Език', plural: 'Езици' },
      admin: {
        description: 'Езиците, от и на които превеждате. Първият е избран в «от», вторият в «на».',
      },
      fields: [{ name: 'name', type: 'text', label: 'Език', required: true, localized: true }],
    },
  ],
}
