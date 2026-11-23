// What a file sent with an inquiry really is, beyond its first bytes (src/lib/inquiries.ts
// `sniffType`). Nothing here unpacks or runs the file: a ZIP's list of entries is read from its
// directory, an old Word file's stream names from its bytes. The office opens these files, so a
// document that carries macros is refused, and so is an archive or an installer wearing a
// document's type.

export type FileVerdict = 'ok' | 'fileType' | 'fileUnsafe'

const docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const odt = 'application/vnd.oasis.opendocument.text'

/** An unpacked document larger than this, or this many times its file, is a decompression bomb. */
export const zipLimits = { entries: 5000, unpackedBytes: 500 * 1024 * 1024, ratio: 200 }

type ZipEntry = { name: string; packed: number; unpacked: number }

const u16 = (bytes: Uint8Array, at: number) => bytes[at]! | (bytes[at + 1]! << 8)
const u32 = (bytes: Uint8Array, at: number) =>
  (bytes[at]! | (bytes[at + 1]! << 8) | (bytes[at + 2]! << 16) | (bytes[at + 3]! << 24)) >>> 0

const ascii = (bytes: Uint8Array, from: number, to: number) =>
  String.fromCharCode(...bytes.subarray(from, to))

/**
 * The entries of a ZIP archive, from its central directory, without unpacking anything.
 * Undefined when the archive can't be read (cut short, ZIP64, more entries than the limit).
 */
export function zipEntries(bytes: Uint8Array): ZipEntry[] | undefined {
  // The end record is in the last 22 bytes, or before a comment of up to 64 KB.
  let end = -1
  for (let at = bytes.length - 22; at >= Math.max(0, bytes.length - 22 - 0xffff); at--) {
    if (u32(bytes, at) === 0x06054b50) {
      end = at
      break
    }
  }
  if (end < 0) return undefined
  const count = u16(bytes, end + 10)
  let at = u32(bytes, end + 16)
  if (count === 0xffff || at === 0xffffffff || count > zipLimits.entries) return undefined

  const entries: ZipEntry[] = []
  for (let i = 0; i < count; i++) {
    if (at + 46 > bytes.length || u32(bytes, at) !== 0x02014b50) return undefined
    const nameLength = u16(bytes, at + 28)
    const next = at + 46 + nameLength + u16(bytes, at + 30) + u16(bytes, at + 32)
    if (next > bytes.length) return undefined
    entries.push({
      name: ascii(bytes, at + 46, at + 46 + nameLength),
      packed: u32(bytes, at + 20),
      unpacked: u32(bytes, at + 24),
    })
    at = next
  }
  return entries
}

/** An OpenDocument file starts with a stored entry «mimetype» that holds its type. */
function odtMimetype(bytes: Uint8Array): string | undefined {
  if (u32(bytes, 0) !== 0x04034b50 || u16(bytes, 8) !== 0) return undefined
  const nameLength = u16(bytes, 26)
  if (ascii(bytes, 30, 30 + nameLength) !== 'mimetype') return undefined
  const start = 30 + nameLength + u16(bytes, 28)
  return ascii(bytes, start, start + Math.min(u32(bytes, 18), 100))
}

function zipDocument(declared: string, bytes: Uint8Array): FileVerdict {
  const entries = zipEntries(bytes)
  if (!entries) return 'fileType'
  const names = new Set(entries.map((entry) => entry.name))

  if (declared === docx) {
    if (!names.has('[Content_Types].xml') || !names.has('word/document.xml')) return 'fileType'
  } else if (declared === odt) {
    if (odtMimetype(bytes) !== odt || !names.has('content.xml')) return 'fileType'
  } else return 'fileType'

  // Macros: a .docm saved as .docx, or an OpenDocument file with its Basic or script folders.
  const macros = entries.some(
    ({ name }) =>
      /(^|\/)vbaProject\.bin$/i.test(name) ||
      /^(Basic|Scripts)\//.test(name) ||
      /\.(exe|dll|js|vbs|bat|cmd|ps1|scr)$/i.test(name),
  )
  if (macros) return 'fileUnsafe'

  const unpacked = entries.reduce((sum, entry) => sum + entry.unpacked, 0)
  if (unpacked > zipLimits.unpackedBytes || unpacked > bytes.length * zipLimits.ratio)
    return 'fileUnsafe'
  return 'ok'
}

/** Whether the bytes hold this name as UTF-16, as an old Office file writes its stream names. */
function hasStream(bytes: Uint8Array, name: string): boolean {
  const needle = Buffer.from(name, 'utf16le')
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).includes(needle)
}

/** An old .doc: the same container holds Excel files and installers, so it must be Word's. */
function oldWord(bytes: Uint8Array): FileVerdict {
  const signature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]
  if (!signature.every((byte, i) => bytes[i] === byte)) return 'fileType'
  if (!hasStream(bytes, 'WordDocument')) return 'fileType'
  // Every file with VBA has this stream («Macros» alone could be a word in the text).
  if (hasStream(bytes, '_VBA_PROJECT')) return 'fileUnsafe'
  return 'ok'
}

function pdf(bytes: Uint8Array): FileVerdict {
  const buffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  return ascii(bytes, 0, 5) === '%PDF-' && buffer.includes('%%EOF') ? 'ok' : 'fileType'
}

/**
 * A closer look at a file whose first bytes already match its declared type (`acceptedFile`).
 * Images aren't looked at here: they're decoded and written again before they're stored.
 */
export function inspectFile(declared: string, bytes: Uint8Array): FileVerdict {
  if (declared === 'application/pdf') return pdf(bytes)
  if (declared === 'application/msword') return oldWord(bytes)
  if (declared === docx || declared === odt) return zipDocument(declared, bytes)
  return 'ok'
}

/** The extension a stored file gets: from its checked type, never from the name it came with. */
export function storedExtension(type: string, types: Record<string, string>): string {
  return types[type] ?? 'bin'
}
