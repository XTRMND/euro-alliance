// Writes the flag stickers (Course sticker 50:274, «<Language> flag») to src/assets/flags as
// SVG, from the Figma geometry: the die-cut disc with its navy shadow, the flag in a 172px circle
// in its real colours, and the light grain. Figma draws the grain as ~1,700 dot paths (200 KB);
// here it's two dot patterns with the same spacing and opacity. Run: node scripts/build-flags.mjs
import { mkdir, writeFile } from 'node:fs/promises'

const out = new URL('../src/assets/flags/', import.meta.url)

// Horizontal or vertical bands, top to bottom or left to right, in the 172px flag box.
const bands = {
  bulgarian: { dir: 'h', colours: ['#ffffff', '#00966e', '#d62612'] },
  german: { dir: 'h', colours: ['#000000', '#dd0000', '#ffce00'] },
  russian: { dir: 'h', colours: ['#ffffff', '#0039a6', '#d52b1e'] },
  french: { dir: 'v', colours: ['#0055a4', '#ffffff', '#ef4135'] },
  italian: { dir: 'v', colours: ['#009246', '#ffffff', '#ce2b37'] },
  // Spain: red, yellow (double width), red; no coat of arms, as in Figma.
  spanish: { dir: 'h', colours: ['#aa151b', '#f1bf00', '#aa151b'], sizes: [43.5, 86, 43.5] },
}

function bandRects({ dir, colours, sizes = [57.33, 57.33, 57.34] }) {
  let at = 14
  return colours
    .map((colour, i) => {
      const size = sizes[i]
      const rect =
        dir === 'h'
          ? `<rect x="14" y="${at}" width="172" height="${size + 0.5}" fill="${colour}"/>`
          : `<rect x="${at}" y="14" width="${size + 0.5}" height="172" fill="${colour}"/>`
      at += size
      return rect
    })
    .join('')
}

// Union Jack as Figma draws it inside the circle: saltires at ±26.57° (a 2:1 flag), the red
// saltires offset 2px left and 4px up/down, crosses 37.4px (white) and 22.4px (red) wide.
function unionJack() {
  const band = (cx, cy, angle, width, colour) =>
    `<rect x="${cx - 300}" y="${cy - width / 2}" width="600" height="${width}" fill="${colour}" transform="rotate(${angle} ${cx} ${cy})"/>`
  return [
    '<rect x="14" y="14" width="172" height="172" fill="#012169"/>',
    band(100, 100, -26.57, 22.4, '#ffffff'),
    band(100, 100, 26.57, 22.4, '#ffffff'),
    band(98, 96, -26.57, 7.48, '#c8102e'),
    band(98, 104, 26.57, 7.48, '#c8102e'),
    '<rect x="14" y="81.3" width="172" height="37.4" fill="#ffffff"/>',
    '<rect x="81.3" y="14" width="37.4" height="172" fill="#ffffff"/>',
    '<rect x="14" y="88.8" width="172" height="22.4" fill="#c8102e"/>',
    '<rect x="88.8" y="14" width="22.4" height="172" fill="#c8102e"/>',
  ].join('')
}

function sticker(flag) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="224" height="224" viewBox="-12 -6 224 224">
<defs>
<filter id="shadow" x="-12" y="-6" width="224" height="224" filterUnits="userSpaceOnUse"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#173069" flood-opacity="0.3"/></filter>
<clipPath id="circle"><circle cx="100" cy="100" r="86"/></clipPath>
<pattern id="grain-a" width="6.6" height="6.6" patternUnits="userSpaceOnUse"><circle cx="1.8" cy="1.8" r="1.35"/></pattern>
<pattern id="grain-b" width="6.6" height="6.6" patternUnits="userSpaceOnUse" x="3.2" y="3.2"><circle cx="1.8" cy="1.8" r="1.5"/></pattern>
</defs>
<circle cx="100" cy="100" r="98" fill="#ffffff" filter="url(#shadow)"/>
<g clip-path="url(#circle)">${flag}<rect x="12" y="12" width="176" height="176" fill="url(#grain-a)" opacity="0.08"/><rect x="12" y="12" width="176" height="176" fill="url(#grain-b)" opacity="0.05"/></g>
</svg>
`
}

await mkdir(out, { recursive: true })
await writeFile(new URL('english.svg', out), sticker(unionJack()))
for (const [name, spec] of Object.entries(bands)) {
  await writeFile(new URL(`${name}.svg`, out), sticker(bandRects(spec)))
}
console.log('flags written')
