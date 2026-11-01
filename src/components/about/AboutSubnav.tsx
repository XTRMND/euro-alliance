'use client'

import { useEffect, useState } from 'react'
import styles from './AboutSubnav.module.css'

// About subnav (189:349): the page's sections as in-page links. The section in view is Active
// (navy, a sand underline), «История» before any scroll as in Figma. A scroller on a phone, the
// active item kept in view. Not sticky (Figma). Hover and focus get the active underline.

type AboutSubnavProps = {
  label: string
  items: { id: string; label: string }[]
}

export function AboutSubnav({ label, items }: AboutSubnavProps) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const update = () => {
      let current = items[0]?.id
      for (const item of items) {
        const section = document.getElementById(item.id)
        if (section && section.getBoundingClientRect().top < window.innerHeight * 0.35) {
          current = item.id
        }
      }
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [items])

  return (
    <nav aria-label={label} className={styles.subnav}>
      <ul className={styles.items}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={styles.item}
              aria-current={item.id === active ? 'true' : undefined}
              data-label={item.label}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
