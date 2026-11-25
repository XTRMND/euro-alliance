import { randomBytes } from 'node:crypto'
import { downloadOnly } from './security-headers'

export { fileAddress } from './file-address'

// «Файлове» (src/collections/Files.ts): the documents a text may link to.

/** What may be uploaded: the types the upload checks know how to look into. */
export const fileTypes: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.oasis.opendocument.text': 'odt',
}

/** One file: as much as the contact wizard takes from a visitor. */
export const maxFileBytes = 20 * 1024 * 1024

const latin: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sht',
  ъ: 'a',
  ь: 'y',
  ю: 'yu',
  я: 'ya',
}

/**
 * The name a file is stored under: a readable part from the name it came with (Latin letters,
 * digits and dashes only), eight random characters, so an address can't be guessed from another,
 * and the extension of its checked type, never the one it came with («faktura.html» sent as a PDF
 * is stored as «faktura-….pdf»).
 */
export function storedFileName(
  original: string,
  type: string,
  random = randomBytes(4).toString('hex'),
): string {
  const base = original
    .replace(/^.*[/\\]/, '')
    .replace(/\.[^.]*$/, '')
    .toLowerCase()
    .replace(/[а-я]/g, (letter) => latin[letter] ?? '')
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
  return `${base || 'fayl'}-${random}.${fileTypes[type] ?? 'bin'}`
}

/**
 * Whether a PDF can do something when it's opened: run a script, start a program, or carry
 * another file inside it. A search of the file's bytes for the names PDF gives these, also when
 * written with «#» codes. It doesn't open compressed parts of the file, so it catches the plain
 * cases, not a file built to hide them: that's a virus scanner's work (ClamAV, not installed).
 */
export function activePdf(bytes: Uint8Array): boolean {
  const text = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    .toString('latin1')
    .replace(/#([0-9a-f]{2})/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
  return /\/(JavaScript|JS|Launch|EmbeddedFile|RichMedia)(?![A-Za-z])/.test(text)
}

/**
 * How a file is served. A PDF opens in the browser's viewer, with nothing else allowed to load
 * and no page allowed to frame it; a Word or OpenDocument file is only ever a download.
 */
export function fileHeaders(headers: Headers): Headers {
  if (headers.get('Content-Type') !== 'application/pdf') {
    downloadOnly(headers)
    headers.set('Cache-Control', 'public, max-age=300')
    return headers
  }
  headers.set('Content-Disposition', 'inline')
  headers.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'")
  headers.set('X-Content-Type-Options', 'nosniff')
  return headers
}
