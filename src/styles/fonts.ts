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

// Caveat, the handwriting, is declared in globals.css and turned on after load (./font-hand.ts).

export const fontVariables = [sofiaSans, sofiaSansExtraCondensed]
  .map((font) => font.variable)
  .join(' ')
