import { LAND_MASK } from './landMask'
import { easeRotation, GLOBE_START, targetRotation } from './rotation'

// The halftone globe's drawing and scroll logic, ported from docs/reference/globe-demo.html
// (docs/motion.md § 4): a hexagonal dot grid on an orthographic globe tilted so Europe faces the
// viewer; navy land, sand Europe, Bulgaria in larger navy dots, faint sea; dots shrink towards
// the edge. It draws on resize and while the page scrolls with the globe in view, never on a
// loop. With reduced motion it is drawn once at −24° and never listens to scrolling.

const COLUMNS = 360
const ROWS = 180
const TILT = 0.42
const SEA_ALPHA = 0.13

let land: Uint8Array | undefined

function landMask(): Uint8Array {
  if (land) return land
  const bytes = atob(LAND_MASK)
  land = new Uint8Array(COLUMNS * ROWS)
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes.charCodeAt(i)
    for (let k = 0; k < 4; k++) {
      const j = i * 4 + k
      if (j < land.length) land[j] = (byte >> (2 * k)) & 3
    }
  }
  return land
}

/** 0 sea, 1 land, 2 Bulgaria. */
function cell(mask: Uint8Array, lat: number, lon: number): number {
  let x = Math.floor((lon + 180) % 360)
  if (x < 0) x += 360
  const y = Math.min(ROWS - 1, Math.max(0, Math.floor(90 - lat)))
  return mask[y * COLUMNS + x]
}

const inEurope = (lat: number, lon: number) => lat > 34 && lat < 72 && lon > -12 && lon < 42

/** Draws the globe into the canvas and keeps it turning with the scroll. Returns a cleanup. */
export function mountGlobe(canvas: HTMLCanvasElement): () => void {
  const context = canvas.getContext('2d')
  if (!context) return () => {}
  const ctx = context
  const mask = landMask()
  const style = getComputedStyle(canvas)
  const ink = style.getPropertyValue('--color-brand-primary-strong').trim()
  const sand = style.getPropertyValue('--color-brand-accent').trim()
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let size = 0
  let dpr = 1
  let current = still ? GLOBE_START : targetRotation(window.scrollY)
  let target = current
  let frame = 0

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)
    const radius = size * 0.46
    const centre = size / 2
    const d = Math.max(6, size / 46)
    const rowHeight = d * 0.866
    const cosTilt = Math.cos(TILT)
    const sinTilt = Math.sin(TILT)
    const sea = new Path2D()
    const navy = new Path2D()
    const europe = new Path2D()
    const dot = (path: Path2D, x: number, y: number, r: number) => {
      path.moveTo(centre + x + r, centre + y)
      path.arc(centre + x, centre + y, r, 0, Math.PI * 2)
    }

    for (let row = 0, y = -radius; y <= radius; y += rowHeight, row++) {
      for (let x = -radius + ((row % 2) * d) / 2; x <= radius; x += d) {
        const rr = x * x + y * y
        if (rr > radius * radius) continue
        // View space to globe space (tilted around x), then latitude and longitude.
        const X = x / radius
        const Y = -y / radius
        const Z = Math.sqrt(radius * radius - rr) / radius
        const Y2 = Y * cosTilt + Z * sinTilt
        const Z2 = -Y * sinTilt + Z * cosTilt
        const lat = (Math.asin(Math.max(-1, Math.min(1, Y2))) * 180) / Math.PI
        const lon = ((((Math.atan2(X, Z2) * 180) / Math.PI + current + 540) % 360) + 360) % 360
        const longitude = lon - 180
        const value = cell(mask, lat, longitude)
        const edge = 0.45 + 0.55 * Z
        if (value === 0) dot(sea, x, y, d * 0.16 * edge)
        else if (value === 2) dot(navy, x, y, d * 0.5 * edge)
        else dot(inEurope(lat, longitude) ? europe : navy, x, y, d * 0.4 * edge)
      }
    }

    ctx.fillStyle = ink
    ctx.globalAlpha = SEA_ALPHA
    ctx.fill(sea)
    ctx.globalAlpha = 1
    ctx.fill(navy)
    ctx.fillStyle = sand
    ctx.fill(europe)
  }

  function resize() {
    const box = canvas.getBoundingClientRect()
    dpr = Math.min(2, window.devicePixelRatio || 1)
    size = box.width
    canvas.width = Math.round(box.width * dpr)
    canvas.height = Math.round(box.height * dpr)
    draw()
  }

  function tick() {
    const step = easeRotation(current, target)
    current = step.rotation
    draw()
    frame = step.done ? 0 : requestAnimationFrame(tick)
  }

  function onScroll() {
    target = targetRotation(window.scrollY)
    if (!frame && target !== current) frame = requestAnimationFrame(tick)
  }

  const resizing = new ResizeObserver(resize)
  resizing.observe(canvas)

  // Listen to scrolling only while the globe is on screen; catch up when it comes back.
  const visibility = still
    ? undefined
    : new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', onScroll, { passive: true })
          onScroll()
        } else {
          window.removeEventListener('scroll', onScroll)
        }
      })
  visibility?.observe(canvas)

  return () => {
    resizing.disconnect()
    visibility?.disconnect()
    window.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(frame)
  }
}
