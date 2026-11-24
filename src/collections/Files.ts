import { APIError, type CollectionBeforeValidateHook, type CollectionConfig } from 'payload'
import { anyone, isStaff } from '@/access'
import { fileTypes } from '@/lib/files'
import { uploadDirs } from '@/lib/media/storage'
import { inspectFile } from '@/lib/upload-checks'

// Files to link to from a text (the client, 24.11.2026: «не мога да намеря къде се качват
// файлове, за да направя линк към тях от текста»): a PDF or a Word document is uploaded here, and
// its address («Адрес за връзка») goes into the link of any text in the admin. Photos aren't
// uploaded here: they belong to the photo field that shows them («Медия» has no screen).
// Public once uploaded: the address works for anyone who has it.

/** The wizard's checks for a visitor's document, for staff too: the real type, no macros. */
const checkFile: CollectionBeforeValidateHook = ({ req }) => {
  const file = req.file
  if (!file) return
  const verdict = inspectFile(file.mimetype, file.data)
  if (verdict === 'fileUnsafe')
    throw new APIError('Файлът съдържа макроси или е повреден и не може да бъде качен.', 400)
  if (verdict === 'fileType')
    throw new APIError(
      'Файлът не е това, което казва името му. Качете PDF, DOC, DOCX или ODT.',
      400,
    )
}

export const Files: CollectionConfig = {
  slug: 'files',
  labels: { singular: 'Файл', plural: 'Файлове' },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'filename', 'updatedAt'],
    description:
      'PDF и Word документи, към които сайтът води. Качете файла, копирайте «Адрес за връзка» и го поставете като връзка в текста.',
  },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  upload: {
    staticDir: uploadDirs.files,
    mimeTypes: Object.keys(fileTypes),
    modifyResponseHeaders: ({ headers }) => {
      headers.set('X-Content-Type-Options', 'nosniff')
      return headers
    },
  },
  hooks: { beforeValidate: [checkFile] },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Име',
      required: true,
      admin: { description: 'За вас, в този списък. На сайта се вижда текстът на връзката.' },
    },
    {
      name: 'address',
      type: 'ui',
      label: 'Адрес за връзка',
      admin: { components: { Field: '@/components/admin/edit/FileAddress#FileAddress' } },
    },
  ],
}
