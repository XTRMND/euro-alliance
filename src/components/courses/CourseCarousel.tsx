'use client'

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import styles from './CourseCarousel.module.css'

// «Подобни курсове» (81:1359 / 117:1154): a row of Course cards that scrolls sideways, with ‹ ›
// buttons from 768px (in-page actions, so buttons) and swiping below. A button is disabled at
// its end of the row.

type CourseCarouselProps = {
  title: string
  all: { href: string; label: string }
  labels: { previous: string; next: string }
  cards: ReactNode[]
}

export function CourseCarousel({ title, all, labels, cards }: CourseCarouselProps) {
  const row = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const update = useCallback(() => {
    const element = row.current
    if (!element) return
    setEdges({
      start: element.scrollLeft <= 1,
      end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 1,
    })
  }, [])

  useEffect(() => {
    update()
    const element = row.current
    element?.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      element?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [update])

  const step = (direction: 1 | -1) => {
    const element = row.current
    const card = element?.querySelector('li')
    if (!element || !card) return
    const gap = parseFloat(getComputedStyle(element).columnGap) || 0
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    element.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: reduce ? 'auto' : 'smooth',
    })
  }

  return (
    <section className={styles.section} aria-labelledby="related-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 id="related-title" className={styles.title}>
            {title}
          </h2>
          <div className={styles.controls}>
            <Button href={all.href} variant="link">
              {all.label}
            </Button>
            <button
              type="button"
              className={styles.arrow}
              aria-label={labels.previous}
              disabled={edges.start}
              onClick={() => step(-1)}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              className={styles.arrow}
              aria-label={labels.next}
              disabled={edges.end}
              onClick={() => step(1)}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
        <ul ref={row} className={styles.row}>
          {cards.map((card, i) => (
            <li key={i} className={styles.item}>
              {card}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
