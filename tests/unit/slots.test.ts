import { describe, expect, it } from 'vitest'
import { bannerShows, fillsSlot, newsSlots } from '@/lib/media/slots'

describe('news covers in their slots', () => {
  it('fill a slot only when at least as big, never enlarged', () => {
    expect(fillsSlot({ width: 900, height: 600 }, newsSlots.card)).toBe(true)
    expect(fillsSlot({ width: 405, height: 247 }, newsSlots.card)).toBe(false)
    expect(fillsSlot({ width: 900, height: 600 }, newsSlots.lead)).toBe(true)
    expect(fillsSlot({ width: 900, height: 600 }, newsSlots.banner)).toBe(false)
    expect(fillsSlot({ width: 2048, height: 1536 }, newsSlots.banner)).toBe(true)
  })

  it('count a picture without known dimensions as filling', () => {
    expect(fillsSlot({ width: null, height: null }, newsSlots.banner)).toBe(true)
  })

  it('keep a cover with text in it out of the banner', () => {
    expect(bannerShows({ width: 2048, height: 1536, textInImage: true })).toBe(false)
    expect(bannerShows({ width: 2048, height: 1536, textInImage: false })).toBe(true)
  })
})
