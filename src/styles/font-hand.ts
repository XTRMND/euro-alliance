// Caveat, the notebook's handwriting: one subset WOFF2 (scripts/build-fonts.sh), declared in
// globals.css. It isn't preloaded (PR 23, the user's choice of 02.11.2026): 127 KB fetched with the
// page counted towards the language pages' LCP (3.7 s on CI), and next/font's Google subsets came
// to 152 KB. Instead --font-hand names Caveat only once the page has loaded, so the font is fetched
// after the LCP: the notebook's text shows a generic cursive for a moment, then Caveat. The text
// is positioned absolutely, so the swap moves nothing.

/** The inline script that marks <html> once the page has loaded (globals.css turns Caveat on). */
export const handFontScript = `addEventListener('load',function(){document.documentElement.setAttribute('data-hand-font','')})`
