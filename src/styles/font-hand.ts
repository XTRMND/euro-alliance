// Caveat, the notebook's handwriting: one subset WOFF2 (scripts/build-fonts.sh), declared in
// globals.css. It isn't preloaded (PR 23, the user's choice of 02.11.2026): 127 KB fetched with the
// page counted towards the language pages' LCP (3.7 s on CI), and next/font's Google subsets came
// to 152 KB. Instead the handwriting names Caveat only once the page has loaded, so the font is
// fetched after the LCP: the notebook's text shows a generic cursive for a moment, then Caveat. The
// text is positioned absolutely, so the swap moves nothing. The switch is an attribute on <html>
// that only the handwriting's own rules read (`html[data-hand-font] .note`), so it restyles those
// elements alone: a custom property on <html> restyled and repainted the whole page at the load
// event, and Chrome then recorded a card's halftone as the LCP element (PR 23).

/** Set on `window` by the script, which runs once (HeadScripts may run it again). */
export const handFontScriptFlag = 'eaHandFontScript'

/** The inline script that marks <html> once the page has loaded (globals.css turns Caveat on). */
export const handFontScript = `(function(){if(window.${handFontScriptFlag})return;window.${handFontScriptFlag}=1;var on=function(){document.documentElement.setAttribute('data-hand-font','')};if(document.readyState==='complete')on();else addEventListener('load',on)})()`
