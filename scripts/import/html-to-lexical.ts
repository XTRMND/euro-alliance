import * as cheerio from 'cheerio'

// The old site's HTML → Payload's Lexical rich text (docs/content-import.md § 3.3). Inline styles,
// fonts, empty paragraphs and layout go; headings, paragraphs, lists, bold, italics, links and
// line breaks stay. A short heading becomes an H2 (it feeds the news contents rail); the old site
// also set whole paragraphs in <h3>, and those become paragraphs. Tables become a paragraph per
// row. Images inside the text are left out (the report lists them).

type Node = Record<string, unknown>

// The parts of cheerio's DOM nodes (domhandler) the conversion reads.
type AnyNode = { type: string; data?: string; children?: AnyNode[] }
type Element = AnyNode & { tagName: string; children: AnyNode[] }

export type LinkMapper = (href: string) => string

export type Converted = { root: Node; skippedImages: string[]; tables: number }

const element = { format: '', indent: 0, version: 1, direction: 'ltr' as const }

/** Bulgarian typography: „…“ quotes, no-break spaces inside numbers and before г. and лв. */
export function typeset(text: string): string {
  return text
    .replace(/ /g, ' ')
    .replace(/"([^"\n]+)"/g, '„$1“')
    .replace(/(\d) (\d{3})(?!\d)/g, '$1 $2')
    .replace(/(\d) (г\.|лв)/g, '$1 $2')
}

const textNode = (text: string, format: number) => ({
  type: 'text',
  text,
  format,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
})

const paragraph = (children: Node[]) => ({
  type: 'paragraph',
  ...element,
  textFormat: 0,
  textStyle: '',
  children,
})

const formats: Record<string, number> = { strong: 1, b: 1, em: 2, i: 2, u: 8 }
const blockTags = new Set([
  'p',
  'div',
  'section',
  'article',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'table',
  'thead',
  'tbody',
  'tr',
  'td',
  'th',
  'hr',
  'figure',
  'center',
])

export function htmlToLexical(html: string, mapLink: LinkMapper = (href) => href): Converted {
  const $ = cheerio.load(`<body>${html}</body>`)
  const skippedImages: string[] = []
  let tables = 0

  /** Inline content → Lexical inline nodes. */
  function inline(nodes: AnyNode[], format = 0): Node[] {
    const out: Node[] = []
    for (const node of nodes) {
      if (node.type === 'text') {
        const text = typeset((node.data ?? '').replace(/\s+/g, ' '))
        if (text) out.push(textNode(text, format))
        continue
      }
      if (node.type !== 'tag') continue
      const el = node as Element
      const tag = el.tagName.toLowerCase()
      if (tag === 'br') out.push({ type: 'linebreak', version: 1 })
      else if (tag === 'img') skippedImages.push($(el as never).attr('src') ?? '')
      else if (tag === 'a') {
        const href = $(el as never)
          .attr('href')
          ?.trim()
        const children = inline(el.children, format)
        if (!href || /^javascript:/i.test(href) || children.length === 0) out.push(...children)
        else {
          const url = mapLink(href)
          out.push({
            type: 'link',
            fields: { linkType: 'custom', url, newTab: /^https?:/i.test(url) },
            ...element,
            version: 3,
            children,
          })
        }
      } else out.push(...inline(el.children, format | (formats[tag] ?? 0)))
    }
    return out
  }

  /** Trims the whitespace at the edges of a run of inline nodes; drops it if nothing is left. */
  function clean(nodes: Node[]): Node[] {
    const items = [...nodes]
    while (items[0]?.type === 'linebreak') items.shift()
    while (items.at(-1)?.type === 'linebreak') items.pop()
    if (items[0]?.type === 'text')
      items[0] = { ...items[0], text: String(items[0].text).trimStart() }
    const last = items.at(-1)
    if (last?.type === 'text')
      items[items.length - 1] = { ...last, text: String(last.text).trimEnd() }
    const text = items
      .map((n) => (n.type === 'text' ? String(n.text) : n.type === 'link' ? 'x' : ''))
      .join('')
    return text.trim() ? items.filter((n) => n.type !== 'text' || n.text !== '') : []
  }

  /** Block content → Lexical block nodes; loose inline runs become paragraphs. */
  function blocks(nodes: AnyNode[]): Node[] {
    const out: Node[] = []
    let run: AnyNode[] = []
    const flush = () => {
      const children = clean(inline(run))
      if (children.length) out.push(paragraph(children))
      run = []
    }
    for (const node of nodes) {
      const tag = node.type === 'tag' ? (node as Element).tagName.toLowerCase() : ''
      if (!blockTags.has(tag)) {
        run.push(node)
        continue
      }
      flush()
      const el = node as Element
      if (/^h[1-6]$/.test(tag)) {
        const children = clean(inline(el.children))
        if (!children.length) continue
        const text = $(el as never)
          .text()
          .replace(/\s+/g, ' ')
          .trim()
        const isHeading = text.length <= 80 && !$(el as never).find('br').length
        out.push(
          isHeading ? { type: 'heading', tag: 'h2', ...element, children } : paragraph(children),
        )
      } else if (tag === 'ul' || tag === 'ol') {
        const items = $(el as never)
          .find('li')
          .toArray()
          .map((li) =>
            clean(
              inline(
                (li as unknown as Element).children.filter(
                  (c) => !(c.type === 'tag' && /^(ul|ol)$/i.test((c as Element).tagName)),
                ),
              ),
            ),
          )
          .filter((children) => children.length)
        if (items.length)
          out.push({
            type: 'list',
            ...element,
            listType: tag === 'ol' ? 'number' : 'bullet',
            tag,
            start: 1,
            children: items.map((children, i) => ({
              type: 'listitem',
              ...element,
              value: i + 1,
              children,
            })),
          })
      } else if (tag === 'blockquote') {
        const children = clean(inline(el.children))
        if (children.length) out.push({ type: 'quote', ...element, children })
      } else if (tag === 'table') {
        tables++
        $(el as never)
          .find('tr')
          .each((_, tr) => {
            const cells = $(tr as never)
              .find('td, th')
              .toArray()
              .map((cell) => clean(inline((cell as unknown as Element).children)))
              .filter((cell) => cell.length)
            const children = cells.flatMap((cell, i) => (i ? [textNode(' · ', 0), ...cell] : cell))
            if (children.length) out.push(paragraph(children))
          })
      } else if (tag === 'hr') continue
      else out.push(...blocks(el.children))
    }
    flush()
    return out
  }

  const children = blocks($('body').contents().toArray() as unknown as AnyNode[])
  return { root: { type: 'root', ...element, children }, skippedImages, tables }
}

/** The plain text of converted rich text, for excerpts and the search index. */
export function plainText(root: Node): string {
  const walk = (node: Node): string =>
    typeof node.text === 'string'
      ? node.text
      : ((node.children as Node[] | undefined) ?? [])
          .map(walk)
          .join(node.type === 'root' ? '\n' : '')
  return walk(root)
    .replace(/[ \t]+/g, ' ')
    .trim()
}
