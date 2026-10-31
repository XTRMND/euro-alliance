import { Caveat, Sofia_Sans, Sofia_Sans_Extra_Condensed } from 'next/font/google'

// Self-hosted at build time: no request to Google at runtime. All three are variable fonts, so
// one file per subset covers every weight. next/font adds size-adjusted fallbacks against layout
// shift.

export const sofiaSans = Sofia_Sans({
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
  variable: '--font-sofia-sans',
})

export const sofiaSansExtraCondensed = Sofia_Sans_Extra_Condensed({
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
  variable: '--font-sofia-sans-extra-condensed',
})

// Handwriting is decoration and rare, so it isn't preloaded.
export const caveat = Caveat({
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
  variable: '--font-caveat',
  preload: false,
})

export const fontVariables = [sofiaSans, sofiaSansExtraCondensed, caveat]
  .map((font) => font.variable)
  .join(' ')
