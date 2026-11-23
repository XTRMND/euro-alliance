import type { CollectionConfig } from 'payload'
import { isAdmin, isStaff } from '@/access'
import { uploadDirs } from '@/lib/media/storage'
import { uploadLimits } from '@/lib/inquiries'
import { downloadOnly } from '@/lib/security-headers'

// Documents sent with a translation inquiry (docs/cms-schema.md § 3). Private: stored outside
// public/ in their own folder and served only to logged-in staff (Payload checks `read` before
// it serves a file). Only the wizard's server action creates them, after its checks
// (src/lib/upload-checks.ts); images are written again without their EXIF. A file is stored under
// a random name; the name it came with is `originalName`. It's only ever served as a download.
export const InquiryFiles: CollectionConfig = {
  slug: 'inquiry-files',
  labels: { singular: 'Файл към запитване', plural: 'Файлове към запитвания' },
  admin: {
    hideAPIURL: true,
    hidden: true,
  },
  access: { read: isStaff, create: () => false, update: () => false, delete: isAdmin },
  upload: {
    staticDir: uploadDirs.inquiries,
    mimeTypes: Object.keys(uploadLimits.types),
    modifyResponseHeaders: ({ headers }) => downloadOnly(headers),
  },
  fields: [
    {
      name: 'originalName',
      type: 'text',
      label: 'Име на файла',
      admin: { readOnly: true },
    },
  ],
}
