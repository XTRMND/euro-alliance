import {
  APIError,
  type Access,
  type CollectionBeforeChangeHook,
  type CollectionBeforeOperationHook,
  type CollectionConfig,
} from 'payload'
import { isAdmin, isStaff } from '@/access'
import { activePdf, fileHeaders, fileTypes, maxFileBytes, storedFileName } from '@/lib/files'
import { sniffType } from '@/lib/inquiries'
import { uploadDirs } from '@/lib/media/storage'
import { inspectFile } from '@/lib/upload-checks'

// Files to link to from a text (the client, 24.11.2026: «не мога да намеря къде се качват
// файлове, за да направя линк към тях от текста»): a PDF or a Word document is uploaded here, and
// its address («Адрес за връзка») goes into the link of any text in the admin. Photos aren't
// uploaded here: they belong to the photo field that shows them («Медия» has no screen).
//
// A file here is published under the site's own name, so an upload is checked harder than a
// visitor's document that only the office opens (v0.29.1, docs/cms-schema.md § Files):
// - who: signed-in staff upload and change; only an admin deletes; `uploadedBy` says who.
// - what: PDF, DOC, DOCX, ODT by its first bytes, whatever its name and declared type say; no
//   macros, no decompression bomb, no PDF that runs a script or carries another file; 20 MB.
// - stored under a name made here (src/lib/files.ts), with the checked type's extension.
// - no file is fetched from an address («Поставяне на URL» is off).
// - read: a file's address works for anyone who has it, but the list of files is staff's.

/** Staff read the records; a visitor only the file itself, by its exact name. */
const readFiles: Access = ({ req, isReadingStaticFile }) =>
  Boolean(req.user) || isReadingStaticFile === true

const refuse = (message: string) => new APIError(message, 400)

/** Before Payload looks at the file: what it is, and the name it'll be stored under. */
const checkFile: CollectionBeforeOperationHook = ({ req, operation, args }) => {
  const file = req.file
  if (!file || (operation !== 'create' && operation !== 'update')) return args
  if (file.size > maxFileBytes || file.data.length > maxFileBytes)
    throw refuse('Файлът е по-голям от 20 MB.')

  // The real type, from the first bytes; a ZIP is a document only if the name says which one.
  const sniffed = sniffType(file.data)
  const type =
    sniffed === 'application/zip'
      ? Object.keys(fileTypes).find(
          (known) => known === file.mimetype && /openxmlformats|opendocument/.test(known),
        )
      : sniffed
  if (!type || !(type in fileTypes))
    throw refuse('Този тип файл не се приема. Качете PDF, DOC, DOCX или ODT.')

  const verdict = inspectFile(type, file.data)
  if (verdict === 'fileType')
    throw refuse('Файлът не е това, което казва името му. Качете PDF, DOC, DOCX или ODT.')
  if (verdict === 'fileUnsafe')
    throw refuse('Файлът съдържа макроси или е повреден и не може да бъде качен.')
  if (type === 'application/pdf' && activePdf(file.data))
    throw refuse(
      'Този PDF съдържа скрипт, прикачен файл или команда за стартиране и не може да бъде публикуван. Запазете го наново като обикновен PDF («Печат → Запази като PDF») и опитайте пак.',
    )

  file.mimetype = type
  file.name = storedFileName(file.name, type)
  return args
}

/** Who put the file there: set here, never taken from the form. */
const stampUploader: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  if (operation === 'create' || req.file) data.uploadedBy = req.user?.id ?? null
  else delete data.uploadedBy
  return data
}

export const Files: CollectionConfig = {
  slug: 'files',
  labels: { singular: 'Файл', plural: 'Файлове' },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'filename', 'uploadedBy', 'updatedAt'],
    description:
      'PDF и Word документи, към които сайтът води. Качете файла, копирайте «Адрес за връзка» и го поставете като връзка в текста. Всеки с адреса може да отвори файла: не качвайте документи с лични данни.',
  },
  access: { read: readFiles, create: isStaff, update: isStaff, delete: isAdmin },
  // No duplicates: a copy would be stored without passing the checks above.
  disableDuplicate: true,
  upload: {
    staticDir: uploadDirs.files,
    mimeTypes: Object.keys(fileTypes),
    pasteURL: false,
    modifyResponseHeaders: ({ headers }) => fileHeaders(headers),
  },
  hooks: { beforeOperation: [checkFile], beforeChange: [stampUploader] },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Име',
      required: true,
      maxLength: 200,
      admin: { description: 'За вас, в този списък. На сайта се вижда текстът на връзката.' },
    },
    {
      name: 'address',
      type: 'ui',
      label: 'Адрес за връзка',
      admin: { components: { Field: '@/components/admin/edit/FileAddress#FileAddress' } },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Качен от',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
