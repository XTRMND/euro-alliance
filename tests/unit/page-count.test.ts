import { describe, expect, it } from 'vitest'
import {
  countCharacters,
  docxText,
  fileText,
  odtText,
  readZipEntry,
  standardPages,
} from '@/lib/page-count'
import { zip } from '../documents'

const archive = (files: Record<string, string>, deflate = true): ArrayBuffer => {
  const buffer = zip(files, deflate)
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length) as ArrayBuffer
}

const documentXml = `<?xml version="1.0"?><w:document><w:body>
<w:p><w:r><w:t>Test</w:t></w:r><w:r><w:t xml:space="preserve"> paragraph &amp; one</w:t></w:r></w:p>
<w:p><w:r><w:t>Two</w:t><w:tab/><w:t>tabbed</w:t></w:r></w:p>
</w:body></w:document>`

describe('countCharacters', () => {
  it('counts characters with spaces, without the line breaks', () => {
    expect(countCharacters('Две думи')).toBe(8)
    expect(countCharacters('ред\nред\r\nред')).toBe(9)
    expect(countCharacters('')).toBe(0)
  })

  it('counts a character outside the BMP once', () => {
    expect(countCharacters('a😀b')).toBe(3)
  })
})

describe('standardPages', () => {
  it('divides by 1800 and keeps one decimal, half up', () => {
    expect(standardPages(12_240)).toBe(6.8)
    expect(standardPages(1800)).toBe(1)
    expect(standardPages(1890)).toBe(1.1)
    expect(standardPages(1889)).toBe(1)
    expect(standardPages(0)).toBe(0)
  })
})

describe('document text', () => {
  it('reads the paragraphs of a Word document', () => {
    expect(docxText(documentXml)).toBe('Test paragraph & one\nTwo\ttabbed')
  })

  it('reads the paragraphs and headings of an OpenDocument, with its spaces', () => {
    const xml = `<office:document-content><office:body><office:text>
<text:h text:outline-level="1">Heading</text:h>
<text:p>One<text:s text:c="3"/>two <text:span>three</text:span></text:p>
<text:p>Tab<text:tab/>and<text:line-break/>break &lt;4&gt;</text:p>
<text:p/></office:text></office:body></office:document-content>`
    expect(odtText(xml)).toBe('Heading\nOne   two three\nTab\tand\nbreak <4>\n')
  })
})

describe('readZipEntry', () => {
  it('reads a deflated and a stored file', async () => {
    const files = { mimetype: 'x', 'word/document.xml': documentXml }
    expect(await readZipEntry(archive(files), 'word/document.xml')).toBe(documentXml)
    expect(await readZipEntry(archive(files, false), 'word/document.xml')).toBe(documentXml)
  })

  it('has nothing for a missing file or something that isn’t a ZIP', async () => {
    expect(await readZipEntry(archive({ a: 'b' }), 'word/document.xml')).toBeNull()
    expect(await readZipEntry(new TextEncoder().encode('not a zip').buffer, 'a')).toBeNull()
  })
})

describe('fileText', () => {
  it('counts a Word document, and says when a file can’t be counted', async () => {
    const docx = new File([archive({ 'word/document.xml': documentXml })], 'dogovor.docx')
    expect(await fileText(docx)).toEqual({
      kind: 'text',
      text: 'Test paragraph & one\nTwo\ttabbed',
    })
    expect(await fileText(new File(['x'], 'scan.jpg', { type: 'image/jpeg' }))).toEqual({
      kind: 'uncountable',
      reason: 'image',
    })
    expect(await fileText(new File(['x'], 'old.doc'))).toEqual({
      kind: 'uncountable',
      reason: 'format',
    })
    expect(await fileText(new File(['x'], 'broken.docx'))).toEqual({
      kind: 'uncountable',
      reason: 'unreadable',
    })
  })
})
