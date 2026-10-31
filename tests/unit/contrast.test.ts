import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio, minimumContrast } from '@/lib/contrast'

// Colours as they are in tokens.css, so a token change is checked too.
const css = readFileSync('src/styles/tokens.css', 'utf8')
const colour = Object.fromEntries(
  [...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, hex]) => [name, hex]),
)

type Size = keyof typeof minimumContrast

// Every text/background pair the components use. Add a row when a component uses a new pair.
// Sand text on light backgrounds is not allowed (CLAUDE.md § 5) and is not listed: Figure card
// (259:410) and List row (259:2318) do it in Figma, an open item in CLAUDE.md § 12.
const pairs: [text: string, background: string, size: Size, where: string][] = [
  ['text-primary', 'bg-warm', 'normal', 'body text on paper'],
  ['text-primary', 'bg-page', 'normal', 'body text on cards'],
  ['text-primary', 'brand-accent-subtle', 'normal', 'text on the sand tint'],
  ['text-muted', 'bg-warm', 'normal', 'leads and secondary text on paper'],
  ['text-muted', 'bg-page', 'normal', 'secondary text on cards'],
  ['brand-primary', 'bg-warm', 'normal', 'links and kickers on paper'],
  ['brand-primary', 'bg-page', 'normal', 'links and dates on cards'],
  ['brand-primary', 'brand-primary-subtle', 'normal', 'Secondary button, hover'],
  ['brand-primary', 'brand-accent-subtle', 'normal', 'Link button, hover'],
  ['brand-primary-strong', 'bg-warm', 'normal', 'headings on paper'],
  ['brand-primary-strong', 'bg-page', 'normal', 'headings on cards'],
  ['brand-primary-strong', 'brand-accent', 'normal', 'highlighter, chips and ticks'],
  ['brand-primary-strong', 'brand-accent-subtle', 'normal', 'text on the sand tint'],
  ['text-on-brand', 'brand-primary', 'normal', 'primary buttons'],
  ['text-on-brand', 'brand-primary-strong', 'normal', 'navy cards, bubbles, footer'],
  ['brand-accent', 'brand-primary-strong', 'normal', 'sand on navy: count bubble, inquiry band'],
]

describe('text contrast (WCAG AA)', () => {
  it('reads every colour token', () => {
    expect(Object.keys(colour)).toHaveLength(12)
  })

  it.each(pairs)('%s on %s (%s): %s', (text, background, size) => {
    expect(colour[text], `--color-${text}`).toBeDefined()
    expect(colour[background], `--color-${background}`).toBeDefined()
    expect(contrastRatio(colour[text], colour[background])).toBeGreaterThanOrEqual(
      minimumContrast[size],
    )
  })
})

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1)
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
  })
})
