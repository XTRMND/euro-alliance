// Compacts a halftone exported from Figma (one <path> per dot, 140–530 KB) into a few KB with the
// same dot centres and radii, rounded to 0.01 px. Each dot is a zero-length stroke with a round
// cap, grouped by radius (one <path> per stroke width), with relative moves. The output is a
// shape only (black dots, no opacity, no clip): components use it as a CSS mask and take the
// colour and opacity from tokens. Run: node scripts/compact-dots.mjs <figma-export.svg> <out.svg>
import { readFile, writeFile } from 'node:fs/promises'

const [input, output] = process.argv.slice(2)
if (!input || !output) {
  console.error('usage: node scripts/compact-dots.mjs <figma-export.svg> <out.svg>')
  process.exit(1)
}

const svg = await readFile(input, 'utf8')
const [, width, height] = svg.match(/width="([\d.]+)" height="([\d.]+)"/) ?? []
if (!width || !height) throw new Error('No width and height on the root <svg>')

// Figma writes each dot as four cubic arcs starting at (cx + r, cy); the first ends at (cx, cy + r).
const dots = [...svg.matchAll(/<path d="M([-\d.e]+) ([-\d.e]+)C([^"]*?)Z"/g)].map((m) => {
  const cy = Number(m[2])
  const [, , , , cx, endY] = m[3].match(/[-\d.e]+/g).map(Number)
  return { cx, cy, r: endY - cy }
})
if (dots.length === 0) throw new Error('No dots found')

const num = (n) =>
  String(Math.round(n * 100) / 100)
    .replace(/^0\./, '.')
    .replace(/^-0\./, '-.')

const byWidth = new Map()
for (const dot of dots) {
  const key = num(2 * (Math.round(dot.r * 100) / 100))
  if (!byWidth.has(key)) byWidth.set(key, [])
  byWidth.get(key).push(dot)
}

const paths = [...byWidth]
  .map(([strokeWidth, group]) => {
    group.sort((a, b) => a.cy - b.cy || a.cx - b.cx)
    let d = ''
    let x = 0
    let y = 0
    for (const { cx, cy } of group) {
      d += d ? `m${num(cx - x)} ${num(cy - y)}h0` : `M${num(cx)} ${num(cy)}h0`
      x = cx
      y = cy
    }
    return `<path stroke-width="${strokeWidth}" d="${d}"/>`
  })
  .join('')

await writeFile(
  output,
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g fill="none" stroke="#000" stroke-linecap="round">${paths}</g></svg>\n`,
)
console.log(`${output}: ${dots.length} dots in ${byWidth.size} sizes`)
