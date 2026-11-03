'use client'

import { useEffect, useRef } from 'react'

// The one-time fade-up of a section below the first screen (docs/motion.md § 2). Marks the parent
// of this (hidden) element `data-reveal="waiting"` while it's out of view, then `"shown"` the
// first time it comes into view; landing.module.css's `.revealCopy` and `.revealArt` do the rest.
// A section already on screen, a browser without JavaScript and reduced motion get no motion: the
// section is never hidden.

export function RevealOnScroll() {
  const marker = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = marker.current?.parentElement
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let first = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!first) section.dataset.reveal = 'shown'
          observer.disconnect()
        } else if (first) {
          // Hide it only if none of it is on screen (the bottom 10% doesn't count as in view yet).
          // Inside a `content-visibility: auto` group that isn't laid out the box is empty.
          const { top, bottom, height } = entry.boundingClientRect
          if (height === 0 || bottom <= 0 || top >= window.innerHeight) {
            section.dataset.reveal = 'waiting'
          } else observer.disconnect()
        }
        first = false
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return <span ref={marker} hidden />
}
