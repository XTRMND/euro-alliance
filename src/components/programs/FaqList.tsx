'use client'

import { type ReactNode, useId, useState } from 'react'
import styles from './FaqList.module.css'

// FAQ item (129:335): an accordion. Each question is a button that opens its answer (rendered on
// the server, it may hold links); the first one starts open, as in Figma.

export function FaqList({ items }: { items: { question: string; answer: ReactNode }[] }) {
  const id = useId()
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]))

  return (
    <div className={styles.list}>
      {items.map((item, i) => {
        const expanded = open.has(i)
        return (
          <div key={i} className={styles.item}>
            <h3 className={styles.heading}>
              <button
                type="button"
                className={styles.question}
                aria-expanded={expanded}
                aria-controls={`${id}-${i}`}
                onClick={() =>
                  setOpen((current) => {
                    const next = new Set(current)
                    if (next.has(i)) next.delete(i)
                    else next.add(i)
                    return next
                  })
                }
              >
                <span>{item.question}</span>
                <span className={styles.toggle} aria-hidden="true">
                  {expanded ? '−' : '+'}
                </span>
              </button>
            </h3>
            <div id={`${id}-${i}`} className={styles.answer} hidden={!expanded}>
              {item.answer}
            </div>
          </div>
        )
      })}
    </div>
  )
}
