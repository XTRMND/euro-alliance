// Caveat, the notebook's handwriting: one subset WOFF2 (scripts/build-fonts.sh) at a fixed URL,
// declared in globals.css. A declared font costs nothing until text uses it, and the components
// that write by hand render <HandFontPreload />, so it loads on their pages alone and early, at
// High priority beside the styles. Found late in the CSS instead, it was fetched at the highest
// priority and held up the first paint of the language pages. (react-dom's preload() only sends
// a font as a hint in the RSC payload, too late; a rendered <link> is hoisted into the <head>.)
export const handFontUrl = '/fonts/Caveat.woff2'

export function HandFontPreload() {
  return (
    <link rel="preload" href={handFontUrl} as="font" type="font/woff2" crossOrigin="anonymous" />
  )
}
