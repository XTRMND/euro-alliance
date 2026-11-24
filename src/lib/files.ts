// «Файлове» (src/collections/Files.ts): the documents a text may link to.

/** What may be uploaded: the types the upload checks know how to look into. */
export const fileTypes: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.oasis.opendocument.text': 'odt',
}

/** A file's address on the site, without the host: it stays right when the domain changes. */
export function fileAddress(filename: string): string {
  return `/api/files/file/${encodeURIComponent(filename)}`
}
