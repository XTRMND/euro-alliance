// Photo tints, composited once at upload (docs/cms-schema.md § 4). After changing anything here,
// run `pnpm media:regen` to rebuild the stored tints.

export type RGB = readonly [number, number, number]

/**
 * The duotone layer of News card (62:240), Polaroid (259:582) and Torn window (259:588): photo
 * luminance mapped navy → sand → paper. Fitted to the Figma images within RMSE 6/255.
 */
export const duotoneRamp = {
  shadow: [24, 49, 105] as RGB, // brand/primary-strong #183169
  mid: [192, 170, 129] as RGB, // brand/accent #C0AA81
  highlight: [247, 243, 236] as RGB, // bg/warm #F7F3EC
  midAt: 0.48,
  gamma: 1.34,
}

/** The Home hero's layers (57:301): navy in screen mode, then sand in multiply mode. */
export const heroBlend = {
  screen: [24, 49, 105] as RGB, // brand/primary-strong #183169
  multiply: [230, 214, 184] as RGB, // #E6D6B8, used only here in Figma
}

export type TintMethod = 'duotone' | 'blend'

export const tints = {
  hero: { percent: 88, method: 'blend' },
  homeNews: { percent: 55, method: 'duotone' },
  about: { percent: 45, method: 'duotone' },
  news: { percent: 30, method: 'duotone' },
} as const satisfies Record<string, { percent: number; method: TintMethod }>

export type Tint = keyof typeof tints

export const tintNames = Object.keys(tints) as Tint[]

/** Tints are stored at most this wide; next/image serves smaller widths from them. */
export const maxTintWidth = 2880
