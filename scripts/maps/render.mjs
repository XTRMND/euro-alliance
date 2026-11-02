// The contact page's office maps (Location card 125:302), rendered from OpenStreetMap data: vector
// tiles from OpenFreeMap (free, commercial use allowed, no key) drawn by MapLibre in headless
// Chromium at twice the pixel density, so the image is sharp on 2× screens with the street names at
// their normal size. The same area as Figma's snapshots (800 × 460 at zoom 16, centred on the
// office), coloured like them: paper streets, blue-grey land and buildings, sand commercial areas,
// navy names; no POI icons. Written to src/seed/contact/*-map.webp (1600 × 920). Attribution
// (required): © OpenStreetMap contributors, OpenMapTiles, OpenFreeMap; the card shows it.
//   node scripts/maps/render.mjs
import { writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const offices = [
  { name: 'plovdiv', lat: 42.1585573, lon: 24.7394618 },
  { name: 'sofia', lat: 42.6940008, lon: 23.3288525 },
]

const colors = {
  land: '#E9ECF1',
  building: '#CCD4E0',
  commercial: '#E4D7BE',
  park: '#DCE0D6',
  water: '#BCC4D2',
  road: '#F7F3EC',
  roadMajor: '#FFFFFF',
  rail: '#B9C1CE',
  text: '#183169',
  halo: '#F7F3EC',
}

const page = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet">
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<style>html,body,#map{margin:0;width:800px;height:460px}</style></head><body><div id="map"></div></body></html>`

const recolor = (colors) => {
  const map = window.map
  for (const layer of map.getStyle().layers) {
    const id = layer.id
    const source = layer['source-layer'] ?? ''
    const set = (property, value) => {
      try {
        map.setPaintProperty(id, property, value)
      } catch {}
    }
    if (layer.type === 'background') set('background-color', colors.land)
    else if (layer.type === 'fill') {
      if (source === 'building') set('fill-color', colors.building)
      else if (source === 'water') set('fill-color', colors.water)
      else if (/park|wood|grass|landcover/.test(id + source)) set('fill-color', colors.park)
      else if (/commercial|retail|industrial|landuse/.test(id)) set('fill-color', colors.commercial)
      else set('fill-color', colors.land)
      set('fill-outline-color', 'rgba(0,0,0,0)')
    } else if (layer.type === 'fill-extrusion') {
      // Buildings, flat: no height, the building colour.
      set('fill-extrusion-color', colors.building)
      set('fill-extrusion-height', 0)
      set('fill-extrusion-base', 0)
      set('fill-extrusion-opacity', 1)
    } else if (layer.type === 'line') {
      if (source === 'transportation' && /rail|transit/.test(id)) set('line-color', colors.rail)
      else if (source === 'transportation')
        set(
          'line-color',
          /motorway|trunk|primary|secondary/.test(id) ? colors.roadMajor : colors.road,
        )
      else if (source === 'water' || source === 'waterway') set('line-color', colors.water)
      else if (/boundary/.test(id)) map.setLayoutProperty(id, 'visibility', 'none')
    } else if (layer.type === 'symbol') {
      if (/poi|housenumber/.test(id) || layer.layout?.['icon-image']) {
        map.setLayoutProperty(
          id,
          'visibility',
          /road|street|transportation_name/.test(id) ? 'visible' : 'none',
        )
      }
      // The local name only (Bulgarian), not «Ivan Rilski Иван Рилски».
      if (layer.layout?.['text-field']) {
        map.setLayoutProperty(id, 'text-field', ['coalesce', ['get', 'name:bg'], ['get', 'name']])
      }
      set('text-color', colors.text)
      set('text-halo-color', colors.halo)
      set('text-halo-width', 1.4)
    }
  }
}

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 800, height: 460 },
  deviceScaleFactor: 2,
})
const tab = await context.newPage()
await tab.setContent(page, { waitUntil: 'networkidle' })
for (const office of offices) {
  await tab.evaluate(
    ({ lon, lat }) =>
      new Promise((resolve) => {
        window.map?.remove()
        document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'map' }))
        window.map = new window.maplibregl.Map({
          container: document.getElementById('map'),
          style: 'https://tiles.openfreemap.org/styles/liberty',
          center: [lon, lat],
          // MapLibre's tiles are 512 px: its zoom 15 is the 256 px tiles' zoom 16, Figma's snapshots.
          zoom: 15,
          interactive: false,
          attributionControl: false,
          fadeDuration: 0,
          canvasContextAttributes: { preserveDrawingBuffer: true },
          preserveDrawingBuffer: true,
        })
        window.map.once('style.load', () => resolve())
      }),
    office,
  )
  await tab.evaluate(recolor, colors)
  await tab.evaluate(() => new Promise((resolve) => window.map.once('idle', resolve)))
  const png = await tab.locator('#map').screenshot()
  const out = `src/seed/contact/${office.name}-map.webp`
  const { width, height } = await sharp(png).metadata()
  await writeFile(out, await sharp(png).webp({ quality: 88 }).toBuffer())
  console.log(`${out}: ${width} × ${height}`)
}
await browser.close()
