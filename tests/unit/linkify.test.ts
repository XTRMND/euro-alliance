import { describe, expect, it } from 'vitest'
import { linkify } from '@/lib/linkify'

describe('linkify', () => {
  it('links the phone number and the email address in a line of text', () => {
    expect(linkify('за да съгласуваме обучението: 0886 601 108, office@example.test')).toEqual([
      { kind: 'text', text: 'за да съгласуваме обучението: ' },
      { kind: 'phone', text: '0886 601 108', href: 'tel:+359886601108' },
      { kind: 'text', text: ', ' },
      { kind: 'email', text: 'office@example.test', href: 'mailto:office@example.test' },
    ])
  })

  it('reads international and landline numbers', () => {
    expect(linkify('+359 886 601 108')[0]).toMatchObject({ href: 'tel:+359886601108' })
    expect(linkify('тел. 02 915 3 518')[1]).toMatchObject({ href: 'tel:+35929153518' })
  })

  it('leaves other numbers alone', () => {
    for (const text of [
      'Споразумение № ДОб-3-00501 #3 от 6 ноември 2025 г.',
      '2021–2027, 300 учебни часа',
      'ЕИК 115302753',
    ]) {
      expect(linkify(text)).toEqual([{ kind: 'text', text }])
    }
  })

  it('keeps a sentence’s full stop out of the email address', () => {
    expect(linkify('Пишете на office@example.test.')).toEqual([
      { kind: 'text', text: 'Пишете на ' },
      { kind: 'email', text: 'office@example.test', href: 'mailto:office@example.test' },
      { kind: 'text', text: '.' },
    ])
  })
})
