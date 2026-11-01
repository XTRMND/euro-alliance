import { describe, expect, it } from 'vitest'
import { legalDescription, legalOutline } from '@/lib/legal'

const paragraph = (text: string) => ({ type: 'paragraph', children: [{ type: 'text', text }] })

describe('legalOutline', () => {
  it('uses the contents label, or the heading without one', () => {
    expect(
      legalOutline([
        { heading: 'Какви бисквитки използваме', tocLabel: 'Какви използваме' },
        { heading: 'Лични данни', tocLabel: null },
      ]),
    ).toEqual([
      { id: 'kakvi-izpolzvame', text: 'Какви използваме' },
      { id: 'lichni-danni', text: 'Лични данни' },
    ])
  })

  it('numbers ids that repeat', () => {
    expect(legalOutline([{ heading: 'Test A' }, { heading: 'Test A' }]).map((i) => i.id)).toEqual([
      'test-a',
      'test-a-2',
    ])
  })
})

describe('legalDescription', () => {
  it('is the first paragraph of the first section', () => {
    const body = { root: { type: 'root', children: [paragraph('Test text.')] } }
    expect(legalDescription([{ body }])).toBe('Test text.')
  })

  it('cuts a long paragraph at a word, within 160 characters', () => {
    const body = { root: { type: 'root', children: [paragraph('дума '.repeat(60).trim())] } }
    const description = legalDescription([{ body }])!
    expect(description.length).toBeLessThanOrEqual(160)
    expect(description.endsWith('дума…')).toBe(true)
  })

  it('is undefined without text', () => {
    expect(legalDescription([])).toBeUndefined()
  })
})
