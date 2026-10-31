import { Caveat } from 'next/font/google'
import localFont from 'next/font/local'

// Sofia Sans and Sofia Sans Extra Condensed are subset by scripts/build-fonts.sh: one variable
// WOFF2 per family with Cyrillic and Latin together and only the weights in use (73 KB instead of
// 133 KB in four files), which keeps text LCP inside the mobile budget. OFL: ./fonts/OFL.txt.
// next/font adds size-adjusted fallbacks against layout shift.

export const sofiaSans = localFont({
  src: './fonts/SofiaSans.woff2',
  weight: '400 700',
  display: 'swap',
  variable: '--font-sofia-sans',
  fallback: ['Arial', 'sans-serif'],
})

export const sofiaSansExtraCondensed = localFont({
  src: './fonts/SofiaSansExtraCondensed.woff2',
  weight: '700 900',
  display: 'swap',
  variable: '--font-sofia-sans-extra-condensed',
  fallback: ['Arial Narrow', 'Arial', 'sans-serif'],
})

// Handwriting is decoration and rare, so it isn't preloaded. Self-hosted at build time.
export const caveat = Caveat({
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
  variable: '--font-caveat',
  preload: false,
})

export const fontVariables = [sofiaSans, sofiaSansExtraCondensed, caveat]
  .map((font) => font.variable)
  .join(' ')
