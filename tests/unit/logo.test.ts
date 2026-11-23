import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// The logo is the client's own file (23.11.2026), kept as supplied. It's shown as an <img>, so it
// must scale by its viewBox and carry nothing that runs or loads.

const assets = path.resolve(__dirname, '../../src/assets')
const files = ['logo-light.svg', 'logo-dark.svg', 'logo-light-en.svg', 'logo-dark-en.svg']

/** The sizes the admin sets by hand (Graphics, Login, NavPreview). */
const fixedSizes = [
  [210, 56],
  [120, 32],
]

describe('the logo files', () => {
  for (const file of files) {
    const svg = readFileSync(path.join(assets, file), 'utf8')

    it(`${file} keeps its proportions`, () => {
      expect(svg).not.toContain('preserveAspectRatio="none"')
      expect(svg).toMatch(/viewBox="0 0 [\d.]+ [\d.]+"/)
    })

    it(`${file} has no scripts and no outside references`, () => {
      expect(svg).not.toMatch(/<script|<foreignObject|<image|<use|\son\w+\s*=|href\s*=|url\(/i)
    })
  }

  it('the admin’s fixed sizes follow the Bulgarian logo’s proportions', () => {
    for (const file of ['logo-light.svg', 'logo-dark.svg']) {
      const [, width, height] = readFileSync(path.join(assets, file), 'utf8').match(
        /viewBox="0 0 ([\d.]+) ([\d.]+)"/,
      )!
      for (const [w, h] of fixedSizes) {
        expect(Math.abs(w! / (Number(width) / Number(height)) - h!)).toBeLessThan(1)
      }
    }
  })
})
