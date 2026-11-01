'use client'

import { useEffect, useRef } from 'react'
import styles from './Globe.module.css'

// The homepage's halftone globe (docs/motion.md § 4). Decoration: the canvas is aria-hidden and
// any text on it (the «7 ЕЗИКА» bubble) is HTML placed by the parent. Its square box is reserved
// by CSS, and the drawing code with its land mask loads in a chunk of its own after hydration,
// so it never competes with the LCP.

export function Globe({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false
    let unmount: (() => void) | undefined
    void import('./globe/render').then(({ mountGlobe }) => {
      if (!cancelled && canvas.current) unmount = mountGlobe(canvas.current)
    })
    return () => {
      cancelled = true
      unmount?.()
    }
  }, [])

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className={[styles.globe, className].filter(Boolean).join(' ')}
    />
  )
}
