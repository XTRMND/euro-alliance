'use client'

import { useEffect, useId, useRef, useState } from 'react'
import styles from './ArticleContents.module.css'

// The article's contents (183:2574 / 188:2385), from its H2s. From 1024px a sticky rail of TOC
// items (185:366): the section being read is Active (navy), the ones passed are Read (sand), the
// rest Default. A section reached through its link stays Active until the reader scrolls
// themselves: after a short section, the next heading is near the top too. Below 1024px, a
// «Съдържание · 2 мин. четене» disclosure (its open state isn't in Figma: the same items) and a
// 4px reading progress bar at the top of the screen. The header isn't sticky, so the bar sits at
// the very top, not under it. The legal pages (218:2871) use the same contents without the
// reading time and the progress bar.

type ArticleContentsProps = {
  items: { id: string; text: string }[]
  /** The article text's id, for the progress bar; without it there's no bar. */
  articleId?: string
  labels: { contents: string; readingTime?: string }
}

const scrollKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

export function ArticleContents({ items, articleId, labels }: ArticleContentsProps) {
  const id = useId()
  const [active, setActive] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)
  /** The section whose link was followed, or -1. */
  const followed = useRef(-1)

  useEffect(() => {
    const update = () => {
      const threshold = window.innerHeight * 0.3
      let current = -1
      items.forEach((item, i) => {
        const heading = document.getElementById(item.id)
        if (heading && heading.getBoundingClientRect().top < threshold) current = i
      })
      setActive(followed.current === -1 ? current : followed.current)
      const article = articleId && document.getElementById(articleId)
      if (article) {
        const box = article.getBoundingClientRect()
        const read = (window.innerHeight - box.top) / box.height
        setProgress(Math.min(1, Math.max(0, read)))
      }
    }
    // A link in the address (a click, the back button, a shared link) marks its section.
    const follow = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1))
      followed.current = items.findIndex((item) => item.id === hash)
      update()
    }
    // Scrolling by hand lets the position decide again.
    const release = (event: Event) => {
      if (event instanceof KeyboardEvent && !scrollKeys.has(event.key)) return
      if (followed.current === -1) return
      followed.current = -1
      update()
    }
    follow()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    window.addEventListener('hashchange', follow)
    for (const type of ['wheel', 'touchmove', 'keydown']) {
      window.addEventListener(type, release, { passive: true })
    }
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('hashchange', follow)
      for (const type of ['wheel', 'touchmove', 'keydown']) {
        window.removeEventListener(type, release)
      }
    }
  }, [items, articleId])

  const pick = (i: number, onPick?: () => void) => () => {
    // The same link twice doesn't change the address, so no hashchange.
    followed.current = i
    setActive(i)
    onPick?.()
  }

  const list = (onPick?: () => void) => (
    <ol className={styles.items}>
      {items.map((item, i) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={styles.item}
            data-state={i === active ? 'active' : i < active ? 'read' : undefined}
            aria-current={i === active ? 'location' : undefined}
            onClick={pick(i, onPick)}
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
          {labels.readingTime && <span>{labels.readingTime}</span>}
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
            {labels.readingTime ? `${labels.contents} · ${labels.readingTime}` : labels.contents}
          </span>
          <span className={styles.sign} aria-hidden="true">
            {open ? '−' : '+'}
          </span>
        </button>
        <div id={`${id}-list`} hidden={!open}>
          {list(() => setOpen(false))}
        </div>
      </nav>
      {articleId && (
        <div className={styles.progress} aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      )}
    </>
  )
}
