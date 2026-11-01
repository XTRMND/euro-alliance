// Scroll-driven rotation of the homepage globe (docs/motion.md § 4): it turns 0.22° per scrolled
// pixel from −24°, eased, and stops once it's within 0.05° of where the scroll put it.

export const GLOBE_START = -24
export const DEGREES_PER_PX = 0.22
const EASING = 0.12
const SETTLED = 0.05

/** The rotation (degrees of longitude) for a scroll position. */
export function targetRotation(scrollY: number): number {
  return GLOBE_START - scrollY * DEGREES_PER_PX
}

/** One animation frame towards the target; `done` when it has arrived. */
export function easeRotation(current: number, target: number): { rotation: number; done: boolean } {
  const rotation = current + (target - current) * EASING
  if (Math.abs(target - rotation) > SETTLED) return { rotation, done: false }
  return { rotation: target, done: true }
}
