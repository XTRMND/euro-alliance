import { telHref } from './format'

// Phone numbers and email addresses in a line of CMS text («за да съгласуваме вашето обучение:
// 0886 601 108, office@euro-alliance.net»), so the client writes plain text and the reader gets
// links. Bulgarian numbers only: +359 or 0, then 8 or 9 digits, spaces or dashes between.

export type TextPart =
  { kind: 'text'; text: string } | { kind: 'phone' | 'email'; text: string; href: string }

const pattern =
  /(?<email>[\w.+-]+@[\w-]+(?:\.[\w-]+)+)|(?<![\d+])(?<phone>(?:\+359|0)(?:[  -]?\d){8,9})(?!\d)/g

export function linkify(text: string): TextPart[] {
  const parts: TextPart[] = []
  let last = 0
  for (const match of text.matchAll(pattern)) {
    const index = match.index
    if (index > last) parts.push({ kind: 'text', text: text.slice(last, index) })
    const { email, phone } = match.groups ?? {}
    if (email) parts.push({ kind: 'email', text: email, href: `mailto:${email}` })
    else if (phone) parts.push({ kind: 'phone', text: phone, href: telHref(phone) })
    last = index + match[0].length
  }
  if (last < text.length) parts.push({ kind: 'text', text: text.slice(last) })
  return parts
}
