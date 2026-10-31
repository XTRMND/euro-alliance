import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '@/access'
import { uploadDirs } from '@/lib/media/storage'
import { tintNames } from '@/lib/media/tints'

// Generated from media by hooks/tints.ts; nobody edits these by hand.
export const MediaTints: CollectionConfig = {
  slug: 'media-tints',
  admin: { hidden: true },
  access: { read: anyone, create: () => false, update: () => false, delete: isAdmin },
  upload: {
    staticDir: uploadDirs.tints,
    mimeTypes: ['image/jpeg'],
  },
  fields: [
    { name: 'source', type: 'relationship', relationTo: 'media', required: true, index: true },
    { name: 'tint', type: 'select', required: true, options: tintNames },
  ],
}
