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

  it('copies every colour token of the site, and the button’s radius', () => {
    const colours = [...site.keys()].filter((name) => name.startsWith('--color-'))
    expect(copied).toEqual(expect.arrayContaining([...colours, '--radius-button']))
  })

  it('sets the site’s Heading/H3 and Label/M in px (Payload’s root font size isn’t 16px)', () => {
    // 1.8125rem and 1rem on the site.
    expect(site.get('--type-h3')).toMatch(/^700 1\.8125rem \/ 1 /)
    expect(site.get('--type-label')).toMatch(/^600 1rem \/ 1\.2 /)
    expect(admin.get('--admin-type-title')).toMatch(/^700 29px \/ 1 /)
    expect(admin.get('--admin-type-label')).toMatch(/^600 16px \/ 1\.2 /)
  })

  it.each(copied)('%s is the site’s value', (name) => {
    expect(admin.get(name)).toBe(site.get(name))
  })
})
