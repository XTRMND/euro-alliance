import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { tintImage, tintPixels } from '@/lib/media/duotone'

const tint = (rgb: number[], method: 'duotone' | 'blend', percent: number) =>
  Array.from(tintPixels(Uint8Array.from(rgb), method, percent))

describe('duotone tint', () => {
  it('maps black to navy and white to paper at full strength', () => {
    expect(tint([0, 0, 0], 'duotone', 100)).toEqual([24, 49, 105])
    expect(tint([255, 255, 255], 'duotone', 100)).toEqual([247, 243, 236])
  })

  it('puts sand in the midtones', () => {
    // Luminance 148 sits at the ramp's sand stop.
    expect(tint([148, 148, 148], 'duotone', 100)).toEqual([192, 170, 129])
  })

  it('lays the duotone over the colour at the tint percentage', () => {
    // 30 % of the way from black to navy.
    expect(tint([0, 0, 0], 'duotone', 30)).toEqual([7, 15, 32])
    expect(tint([255, 255, 255], 'duotone', 30)).toEqual([253, 251, 249])
  })

  it('leaves the photo alone at 0 %', () => {
    expect(tint([200, 30, 90], 'duotone', 0)).toEqual([200, 30, 90])
  })
})

describe('hero blend tint', () => {
  it('screens navy into the shadows and multiplies sand into the highlights', () => {
    expect(tint([0, 0, 0], 'blend', 88)).toEqual([19, 37, 70])
    expect(tint([255, 255, 255], 'blend', 88)).toEqual([233, 219, 193])
  })

  it('treats each pixel independently', () => {
    expect(tint([0, 0, 0, 255, 255, 255], 'blend', 88)).toEqual([19, 37, 70, 233, 219, 193])
  })

  it('desaturates first, as Figma renders the hero photo', () => {
    // Pure red and a grey of the same luma come out the same.
    expect(tint([255, 0, 0], 'blend', 88)).toEqual(tint([76, 76, 76], 'blend', 88))
  })
})

describe('tintImage', () => {
  it('returns a JPEG no wider than 2880 px', async () => {
    const photo = await sharp({
      create: { width: 3200, height: 100, channels: 3, background: '#808080' },
    })
      .png()
      .toBuffer()

    const metadata = await sharp(await tintImage(photo, 'news')).metadata()

    expect(metadata.format).toBe('jpeg')
    expect(metadata.width).toBe(2880)
  })

  it('applies the EXIF orientation before tinting', async () => {
    const portrait = await sharp({
      create: { width: 40, height: 20, channels: 3, background: '#808080' },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer()

    const metadata = await sharp(await tintImage(portrait, 'about')).metadata()

    expect([metadata.width, metadata.height, metadata.orientation]).toEqual([20, 40, undefined])
  })
})
