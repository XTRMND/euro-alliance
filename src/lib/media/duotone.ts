import sharp from 'sharp'
import {
  duotoneRamp,
  heroBlend,
  maxTintWidth,
  tints,
  type RGB,
  type Tint,
  type TintMethod,
} from './tints'

/** Duotone colour for every 8-bit luminance value, as packed RGB triples. */
function buildRamp(): Uint8ClampedArray {
  const { shadow, mid, highlight, midAt, gamma } = duotoneRamp
  const ramp = new Uint8ClampedArray(256 * 3)
  for (let luma = 0; luma < 256; luma++) {
    const t = (luma / 255) ** gamma
    const [from, to, k] =
      t <= midAt ? [shadow, mid, t / midAt] : [mid, highlight, (t - midAt) / (1 - midAt)]
    for (let c = 0; c < 3; c++) ramp[luma * 3 + c] = from[c] + (to[c] - from[c]) * k
  }
  return ramp
}

const ramp = buildRamp()

/**
 * Tints raw RGB pixels in place.
 * - `duotone`: the colour photo with the duotone layer on top at `percent` opacity.
 * - `blend`: Figma's screen and multiply layers, each at `percent` opacity.
 */
export function tintPixels(pixels: Uint8Array, method: TintMethod, percent: number): Uint8Array {
  const a = percent / 100
  const screen = heroBlend.screen.map((v) => v / 255) as unknown as RGB
  const multiply = heroBlend.multiply.map((v) => v / 255) as unknown as RGB

  for (let i = 0; i < pixels.length; i += 3) {
    if (method === 'duotone') {
      const luma = Math.round(0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2])
      for (let c = 0; c < 3; c++) {
        pixels[i + c] = Math.round(pixels[i + c] + (ramp[luma * 3 + c] - pixels[i + c]) * a)
      }
    } else {
      for (let c = 0; c < 3; c++) {
        const x = pixels[i + c] / 255
        const screened = x + (1 - (1 - x) * (1 - screen[c]) - x) * a
        pixels[i + c] = Math.round((screened + (screened * multiply[c] - screened) * a) * 255)
      }
    }
  }
  return pixels
}

/** Returns the tinted JPEG for an uploaded photo. EXIF is dropped; orientation is applied first. */
export async function tintImage(input: Buffer, tint: Tint): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .rotate()
    .resize({ width: maxTintWidth, withoutEnlargement: true })
    .toColourspace('srgb')
    .flatten({ background: '#ffffff' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { method, percent } = tints[tint]
  tintPixels(data, method, percent)

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
}
