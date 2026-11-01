import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { easeRotation, targetRotation } from '@/components/visuals/globe/rotation'
import { STRIP_SPEED, stripCopies, stripDuration } from '@/lib/motion'

describe('stripDuration', () => {
  it('moves at 18 px/s: one language set of Figma (873.6px) takes about 48 s', () => {
    expect(stripDuration(873.6)).toBeCloseTo(48.53, 2)
    expect(873.6 / stripDuration(873.6)).toBe(18)
  })

  it('keeps the speed whatever the distance', () => {
    for (const distance of [342, 1328, 2656, 5000]) {
      expect(distance / stripDuration(distance)).toBeCloseTo(STRIP_SPEED, 10)
    }
  })

  it('is 0 before anything is measured', () => {
    expect(stripDuration(0)).toBe(0)
    expect(stripDuration(Number.NaN)).toBe(0)
  })

  it('matches --strip-speed in tokens.css', () => {
    const tokens = readFileSync('src/styles/tokens.css', 'utf8')
    expect(tokens).toMatch(new RegExp(`--strip-speed: ${STRIP_SPEED};`))
  })
})

describe('stripCopies', () => {
  it('makes each half of the track at least as wide as the strip', () => {
    expect(stripCopies(1280, 873.6)).toBe(2)
    expect(stripCopies(342, 873.6)).toBe(1)
    expect(stripCopies(2560, 873.6)).toBe(3)
    expect(stripCopies(1280, 1328)).toBe(1)
  })

  it('falls back to one copy before the set is measured', () => {
    expect(stripCopies(1280, 0)).toBe(1)
  })
})

describe('globe rotation', () => {
  it('starts at −24° and turns 0.22° per scrolled pixel', () => {
    expect(targetRotation(0)).toBe(-24)
    expect(targetRotation(100)).toBeCloseTo(-46, 10)
  })

  it('eases towards the target, never past it, and stops exactly on it', () => {
    let rotation = -24
    const target = targetRotation(500)
    let frames = 0
    let done = false
    while (!done) {
      const step = easeRotation(rotation, target)
      expect(Math.abs(target - step.rotation)).toBeLessThan(Math.abs(target - rotation))
      rotation = step.rotation
      done = step.done
      frames++
    }
    expect(rotation).toBe(target)
    // 110° closes 12% per frame until under 0.05°: 0.88ⁿ × 110 < 0.05 at n = 61, about a
    // second at 60 fps.
    expect(frames).toBe(61)
  })

  it('is done at once when nothing moved', () => {
    expect(easeRotation(-24, -24)).toEqual({ rotation: -24, done: true })
  })
})
