import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// The admin's stylesheet copies the site's tokens it uses (importing tokens.css there would add
// a stylesheet to every public page). The copies must say what the originals say.

const declarations = (file: string) =>
  new Map(
    [...readFileSync(file, 'utf8').matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gm)].map((match) => [
      match[1],
      match[2].replace(/\s+/g, ' ').trim(),
    ]),
  )

describe('the admin’s tokens', () => {
  const site = declarations('src/styles/tokens.css')
  const admin = declarations('src/app/(payload)/custom.css')
  const copied = [...admin.keys()].filter(
    (name) => /^--(color|radius|type)-/.test(name) && site.has(name),
  )

  it('copies every colour token of the site, and the type and shape it uses', () => {
    const colours = [...site.keys()].filter((name) => name.startsWith('--color-'))
    expect(copied).toEqual(expect.arrayContaining(colours))
    expect(copied).toEqual(expect.arrayContaining(['--radius-button', '--type-h3', '--type-label']))
  })

  it.each(copied)('%s is the site’s value', (name) => {
    expect(admin.get(name)).toBe(site.get(name))
  })
})
