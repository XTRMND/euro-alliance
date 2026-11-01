'use client'

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'
import { STRIP_SPEED, stripCopies, stripDuration } from '@/lib/motion'
import styles from './Marquee.module.css'

// The moving strip behind Marquee / Languages (63:524) and Marquee / Logos (63:711), per
// docs/motion.md § 3. The track is two equal halves of N copies of the item set and moves by one
// half per loop, so the loop is seamless; N is measured so a half is never narrower than the
// strip. Only the first set is exposed; the copies are aria-hidden and inert. Speed is
// --strip-speed px/s whatever the content or viewport. It pauses on hover and focus, while it's
// off screen, and with the pause button (WCAG 2.2.2); with reduced motion it stays still.
// Nothing moves until the first measurement, so the server-rendered strip starts at rest.

type MarqueeProps = {
  /** One set of <li> items. */
  children: ReactNode
  labels: { pause: string; play: string }
  className?: string
}

export function Marquee({ children, labels, className }: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null)
  const firstSet = useRef<HTMLUListElement>(null)
  // One copy (two sets) fills the strip on every screen we measured, so the server renders that
  // and the measure only adds copies on very wide strips: less to hydrate, no relayout on mobile.
  const [copies, setCopies] = useState(1)
  const [duration, setDuration] = useState<number>()
  const [offScreen, setOffScreen] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const strip = root.current
    const set = firstSet.current
    if (!strip || !set) return

    const speed = Number(getComputedStyle(strip).getPropertyValue('--strip-speed')) || STRIP_SPEED
    const measure = () => {
      const setWidth = set.getBoundingClientRect().width
      const n = stripCopies(strip.clientWidth, setWidth)
      setCopies(n)
      setDuration(stripDuration(n * setWidth, speed))
    }
    const resize = new ResizeObserver(measure)
    resize.observe(strip)
    resize.observe(set)

    const visibility = new IntersectionObserver(([entry]) => setOffScreen(!entry.isIntersecting))
    visibility.observe(strip)

    return () => {
      resize.disconnect()
      visibility.disconnect()
    }
  }, [])

  return (
    <div
      ref={root}
      className={[styles.marquee, className].filter(Boolean).join(' ')}
      data-ready={duration ? '' : undefined}
      data-offscreen={offScreen ? '' : undefined}
      data-paused={paused ? '' : undefined}
      style={duration ? ({ '--strip-duration': `${duration}s` } as CSSProperties) : undefined}
    >
      <div className={styles.viewport}>
        <div className={styles.track}>
          <ul ref={firstSet} className={styles.set}>
            {children}
          </ul>
          {Array.from({ length: copies * 2 - 1 }, (_, index) => (
            <ul key={index} className={styles.set} aria-hidden="true" inert>
              {children}
            </ul>
          ))}
        </div>
      </div>
      <button
        type="button"
        className={styles.toggle}
        aria-label={paused ? labels.play : labels.pause}
        onClick={() => setPaused((value) => !value)}
      />
    </div>
  )
}
