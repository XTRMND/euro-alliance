// The Page counter (173:378): standard pages of 1800 characters with spaces, counted in the
// browser from pasted text or a file. Nothing is uploaded. Characters are counted as Word counts
// «characters (with spaces)»: every character but the line breaks between paragraphs.
// Rounding is an open item (docs/pr-plan.md § 14): one decimal, half up.

export const charactersPerPage = 1800

export function countCharacters(text: string): number {
  return [...text.replace(/\r\n?|\n|\u2028|\u2029/g, '')].length
}

export function standardPages(characters: number): number {
  return Math.round((characters / charactersPerPage) * 10) / 10
}

export type Extracted =
  | { kind: 'text'; text: string }
  /** Photos and scans (no text to count), old .doc files, and anything we can't read. */
  | { kind: 'uncountable'; reason: 'image' | 'format' | 'unreadable' }

const xmlEntities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

function decodeXml(text: string): string {
  return text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity: string) =>
    entity[0] === '#'
      ? String.fromCodePoint(
          entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)),
        )
      : xmlEntities[entity.toLowerCase()],
  )
}

/** The body text of a Word document's word/document.xml, a paragraph per line. */
export function docxText(xml: string): string {
  const paragraphs = xml.match(/<w:p[\s>][\s\S]*?<\/w:p>/g) ?? []
  return paragraphs
    .map((paragraph) =>
      [...paragraph.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>|<w:tab\/>|<w:br\/>/g)]
        .map(([tag, text]) => (tag === '<w:tab/>' ? '\t' : tag === '<w:br/>' ? '\n' : text))
        .join(''),
    )
    .map(decodeXml)
    .join('\n')
}

/** The text of an OpenDocument's content.xml, a paragraph or heading per line. */
export function odtText(xml: string): string {
  const body = xml.match(/<office:text[\s>][\s\S]*<\/office:text>/)?.[0] ?? ''
  const blocks =
    body.match(/<text:(p|h)[\s>][\s\S]*?<\/text:\1>|<text:(?:p|h)(?:\s[^>]*)?\/>/g) ?? []
  return blocks
    .map((block) =>
      decodeXml(
        block
          .replace(/<text:s(?:\s+text:c="(\d+)")?\s*\/>/g, (_, count?: string) =>
            ' '.repeat(Number(count ?? 1)),
          )
          .replace(/<text:tab\s*\/>/g, '\t')
          .replace(/<text:line-break\s*\/>/g, '\n')
          .replace(/<[^>]+>/g, ''),
      ),
    )
    .join('\n')
}

/** One file of a ZIP archive (.docx and .odt are ZIP archives), or null without it. */
export async function readZipEntry(data: ArrayBuffer, name: string): Promise<string | null> {
  const view = new DataView(data)
  // The end of central directory record: its signature, searched from the end of the file.
  let end = -1
  for (let i = data.byteLength - 22; i >= Math.max(0, data.byteLength - 65_557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i
      break
    }
  }
  if (end < 0) return null
  const entries = view.getUint16(end + 10, true)
  let offset = view.getUint32(end + 16, true)
  const decoder = new TextDecoder()
  for (let i = 0; i < entries; i++) {
    if (view.getUint32(offset, true) !== 0x02014b50) return null
    const method = view.getUint16(offset + 10, true)
    const size = view.getUint32(offset + 20, true)
    const nameLength = view.getUint16(offset + 28, true)
    const extraLength = view.getUint16(offset + 30, true)
    const commentLength = view.getUint16(offset + 32, true)
    const local = view.getUint32(offset + 42, true)
    const entryName = decoder.decode(new Uint8Array(data, offset + 46, nameLength))
    if (entryName === name) {
      const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true)
      const bytes = new Uint8Array(data, start, size)
      if (method === 0) return decoder.decode(bytes)
      if (method !== 8) return null
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
      return new Response(stream).text()
    }
    offset += 46 + nameLength + extraLength + commentLength
  }
  return null
}

const extension = (name: string) => name.toLowerCase().split('.').pop() ?? ''

/** The text of a file, without PDFs (see pdf-text.ts, loaded only for them). */
export async function fileText(file: File): Promise<Extracted> {
  const type = extension(file.name)
  if (file.type.startsWith('image/')) return { kind: 'uncountable', reason: 'image' }
  try {
    if (type === 'txt' || file.type === 'text/plain') {
      return { kind: 'text', text: await file.text() }
    }
    if (type === 'docx' || type === 'odt') {
      const xml = await readZipEntry(
        await file.arrayBuffer(),
        type === 'docx' ? 'word/document.xml' : 'content.xml',
      )
      if (xml === null) return { kind: 'uncountable', reason: 'unreadable' }
      return { kind: 'text', text: type === 'docx' ? docxText(xml) : odtText(xml) }
    }
  } catch {
    return { kind: 'uncountable', reason: 'unreadable' }
  }
  return { kind: 'uncountable', reason: 'format' }
}
