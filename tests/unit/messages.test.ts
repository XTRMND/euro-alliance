import { describe, expect, it } from 'vitest'
import bg from '@/messages/bg.json'
import en from '@/messages/en.json'

// docs/i18n.md § 1: bg.json and en.json have the same keys. (Using a key that isn't in bg.json
// fails the typecheck through the next-intl types in src/global.d.ts.)

function keys(messages: object, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? keys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

describe('messages', () => {
  it('have the same keys in Bulgarian and English', () => {
    expect(keys(en).sort()).toEqual(keys(bg).sort())
  })

  it('have no empty Bulgarian strings', () => {
    const empty = keys(bg).filter((key) => {
      const value = key
        .split('.')
        .reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], bg)
      return typeof value !== 'string' || value.trim() === ''
    })
    expect(empty).toEqual([])
  })
})
