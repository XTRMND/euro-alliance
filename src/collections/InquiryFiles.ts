import type { CollectionConfig } from 'payload'
import { isAdmin, isStaff } from '@/access'
import { uploadDirs } from '@/lib/media/storage'
import { uploadLimits } from '@/lib/inquiries'

// Documents sent with a translation inquiry (docs/cms-schema.md § 3). Private: stored outside
// public/ in their own folder and served only to logged-in staff (Payload checks `read` before
// it serves a file). Only the wizard's server action creates them; images lose their EXIF first.
export const InquiryFiles: CollectionConfig = {
  slug: 'inquiry-files',
  labels: { singular: 'Файл към запитване', plural: 'Файлове към запитвания' },
  admin: { hidden: true },
  access: { read: isStaff, create: () => false, update: () => false, delete: isAdmin },
  upload: {
    staticDir: uploadDirs.inquiries,
    mimeTypes: Object.keys(uploadLimits.types),
  },
  fields: [],
}
