'use client'

import { useEffect, useRef, useState } from 'react'
import { Globe } from '@/components/visuals/Globe'
import styles from './GlobeSlot.module.css'

// The contact page's globe (docs/contact-offices.md § 4): decoration in the room left under the
// wizard when the offices beside it are taller, from 1024px. The slot takes that room by CSS and
// never adds height of its own; the globe is drawn only while the slot is at least 140px tall
// (below that, as on the wizard's longer steps, it isn't rendered and its script doesn't run).
// It follows the wizard as it changes step, and turns as the homepage's does.

const MIN_HEIGHT = 140

export function GlobeSlot({ className }: { className?: string }) {
  const frame = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!frame.current) return
    const resizing = new ResizeObserver(([entry]) => {
      setShown(entry.contentRect.height >= MIN_HEIGHT)
    })
    resizing.observe(frame.current)
    return () => resizing.disconnect()
  }, [])

  return (
    <div className={[styles.slot, className].filter(Boolean).join(' ')} aria-hidden="true">
      <div ref={frame} className={styles.frame}>
        {shown && <Globe className={styles.globe} />}
      </div>
    </div>
  )
}
