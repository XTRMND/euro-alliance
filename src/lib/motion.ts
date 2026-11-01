// Motion arithmetic shared by components and their tests (docs/motion.md).

/** --strip-speed in tokens.css: both strips move at 18 px/s. */
export const STRIP_SPEED = 18

/** Seconds for a strip to travel `distance` px at `speed` px/s. */
export function stripDuration(distance: number, speed = STRIP_SPEED): number {
  if (!(distance > 0) || !(speed > 0)) return 0
  return distance / speed
}

/**
 * How many copies of the item set make up half the track. The track holds two equal halves and
 * moves by one half per loop, so each half has to be at least as wide as the strip.
 */
export function stripCopies(stripWidth: number, setWidth: number): number {
  if (!(setWidth > 0)) return 1
  return Math.max(1, Math.ceil(stripWidth / setWidth))
}
