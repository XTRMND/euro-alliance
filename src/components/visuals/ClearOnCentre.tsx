'use client'

import { useEffect, useRef } from 'react'

// On touch screens, where there's no hover, a news photo clears to full colour while its card is
// in the middle of the screen (News card 62:240's description). Marks each `[data-clear-on-centre]`
// element inside the parent of this (hidden) element with `data-clear`; DuotoneImage does the rest.

export function ClearOnCentre() {
  const marker = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = marker.current?.parentElement
    if (!root || !window.matchMedia('(hover: none)').matches) return

    const cards = root.querySelectorAll<HTMLElement>('[data-clear-on-centre]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const card = entry.target as HTMLElement
          if (entry.isIntersecting) card.dataset.clear = ''
          else delete card.dataset.clear
        }
      },
      // The middle of the screen: 30% in from every edge.
      { rootMargin: '-30% -30% -30% -30%' },
    )
    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  return <span ref={marker} hidden />
}
