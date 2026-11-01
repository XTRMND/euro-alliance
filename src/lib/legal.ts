import { headingIds, type LexicalBody, nodeText } from './news'

// The legal pages' sections (src/collections/LegalPages.ts): each H2 gets an id from its contents
// label (Figma's labels are shorter than the headings), and the rail lists the labels.

type Section = { heading: string; tocLabel?: string | null }

/** The rail's items: each section's label (its heading when it has none) and its H2's id. */
export function legalOutline(sections: Section[]): { id: string; text: string }[] {
  const texts = sections.map(({ heading, tocLabel }) => (tocLabel?.trim() || heading).trim())
  const ids = headingIds(texts)
  return texts.map((text, i) => ({ id: ids[i], text }))
}

/** The first paragraph of the text, for the page's description: up to 160 characters. */
export function legalDescription(sections: { body?: unknown }[]): string | undefined {
  const body = sections[0]?.body as LexicalBody
  const first = body?.root.children?.find((node) => node.type === 'paragraph')
  const text = first ? nodeText(first).trim() : ''
  if (!text) return undefined
  return text.length <= 160 ? text : `${text.slice(0, 159).replace(/\s+\S*$/, '')}…`
}
