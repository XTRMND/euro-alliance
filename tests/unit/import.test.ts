import { describe, expect, it } from 'vitest'
import { htmlToLexical, plainText, typeset } from '../../scripts/import/html-to-lexical'

const types = (html: string) =>
  (htmlToLexical(html).root.children as { type: string; tag?: string }[]).map((node) =>
    node.tag ? `${node.type}:${node.tag}` : node.type,
  )

describe('htmlToLexical', () => {
  it('keeps short headings as H2 and turns paragraph-long h3 into paragraphs', () => {
    expect(types(`<h3>Test heading</h3><h3>${'Test text '.repeat(12)}</h3><p>Test</p>`)).toEqual([
      'heading:h2',
      'paragraph',
      'paragraph',
    ])
  })

  it('drops empty paragraphs and keeps lists, bold and line breaks', () => {
    const { root } = htmlToLexical(
      '<p>&nbsp;</p><ul><li><strong>Test</strong> A</li><li>B</li></ul><p>A<br>B</p>',
    )
    expect(types('<p>&nbsp;</p><ul><li>A</li></ul><p>A<br>B</p>')).toEqual(['list:ul', 'paragraph'])
    const list = (root.children as { children: { children: { format: number }[] }[] }[])[0]
    expect(list.children[0].children[0].format).toBe(1)
  })

  it('rewrites links with the mapper and opens other sites in a new tab', () => {
    const { root } = htmlToLexical(
      '<p><a href="https://euro-alliance.net/Vouchers">A</a> <a href="https://example.com">B</a></p>',
      (href) => (href.includes('Vouchers') ? '/vaucheri' : href),
    )
    const links = (
      root.children as { children: { type: string; fields?: { url: string; newTab: boolean } }[] }[]
    )[0].children.filter((n) => n.type === 'link')
    expect(links.map((link) => link.fields)).toEqual([
      { linkType: 'custom', url: '/vaucheri', newTab: false },
      { linkType: 'custom', url: 'https://example.com', newTab: true },
    ])
  })

  it('turns table rows into paragraphs', () => {
    const converted = htmlToLexical(
      '<table><tr><td>A</td><td>1</td></tr><tr><td>B</td><td>2</td></tr></table>',
    )
    expect(converted.tables).toBe(1)
    expect(plainText(converted.root)).toBe('A · 1\nB · 2')
  })
})

describe('typeset', () => {
  it('sets Bulgarian quotes and no-break spaces', () => {
    expect(typeset('"Тест" 175 958 лв и 1999 г.')).toBe('„Тест“ 175 958 лв и 1999 г.')
  })
})
