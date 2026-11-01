'use client'

import { useEffect, useId, useState } from 'react'
import styles from './ArticleContents.module.css'

// The article's contents (183:2574 / 188:2385), from its H2s. From 1024px a sticky rail of TOC
// items (185:366): the section being read is Active (navy), the ones passed are Read (sand), the
// rest Default. Below it, a «Съдържание · 2 мин. четене» disclosure (its open state isn't in
// Figma: the same items) and a 4px reading progress bar at the top of the screen. The header
// isn't sticky, so the bar sits at the very top, not under it.

type ArticleContentsProps = {
  items: { id: string; text: string }[]
  /** The article text's id, for the progress bar. */
  articleId: string
  labels: { contents: string; readingTime: string }
}

export function ArticleContents({ items, articleId, labels }: ArticleContentsProps) {
  const id = useId()
  const [active, setActive] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const update = () => {
      const threshold = window.innerHeight * 0.3
      let current = -1
      items.forEach((item, i) => {
        const heading = document.getElementById(item.id)
        if (heading && heading.getBoundingClientRect().top < threshold) current = i
      })
      setActive(current)
      const article = document.getElementById(articleId)
      if (article) {
        const box = article.getBoundingClientRect()
        const read = (window.innerHeight - box.top) / box.height
        setProgress(Math.min(1, Math.max(0, read)))
      }
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [items, articleId])

  const list = (onPick?: () => void) => (
    <ol className={styles.items}>
      {items.map((item, i) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={styles.item}
            data-state={i === active ? 'active' : i < active ? 'read' : undefined}
            aria-current={i === active ? 'location' : undefined}
            onClick={onPick}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  )

  return (
    <>
      <nav className={styles.rail} aria-labelledby={`${id}-rail`}>
        <p id={`${id}-rail`} className={styles.meta}>
          <span className={styles.label}>{labels.contents}</span>
          <span>{labels.readingTime}</span>
        </p>
        {list()}
      </nav>
      <nav className={styles.box} aria-labelledby={`${id}-box`}>
        <button
          type="button"
          id={`${id}-box`}
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={`${id}-list`}
          onClick={() => setOpen(!open)}
        >
          <span>
            {labels.contents} · {labels.readingTime}
          </span>
          <span className={styles.sign} aria-hidden="true">
            {open ? '−' : '+'}
          </span>
        </button>
        <div id={`${id}-list`} hidden={!open}>
          {list(() => setOpen(false))}
        </div>
      </nav>
      <div className={styles.progress} aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
    </>
  )
}
