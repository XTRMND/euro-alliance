import type { CSSProperties } from 'react'
import styles from './FigureCard.module.css'

// Figure card (259:410): a key figure and a short uppercase label, in «в цифри» rows. Only
// official numbers. The number is navy, not Figma's sand: sand text on white is 2.3:1 and fails
// WCAG even at this size (CLAUDE.md § 5, open item in § 12). A figure in words («десетки
// хиляди», 194:2839) is set smaller, as in Figma.
//
// A figure never leaves its card: it's set at Figma's size where its longest unbreakable part
// fits the card, and smaller where it doesn't («2010-2016» in a 150px card). CSS can't measure
// text, so the card gets the part's length (`--chars`) and works the size out from its own width.

export function FigureCard({ figure, label }: { figure: string; label: string }) {
  const words = /\p{L}{3,}/u.test(figure)
  const text = figureText(figure)
  return (
    <div className={styles.card}>
      <p
        className={[styles.figure, words && styles.words].filter(Boolean).join(' ')}
        style={{ '--chars': longestPart(text) } as CSSProperties}
      >
        {text}
      </p>
      <p className={styles.label}>{label}</p>
    </div>
  )
}

/** The figure as set: a number's thousands stay on one line («40 000»). */
export function figureText(figure: string): string {
  return figure.trim().replace(/(?<=\d) (?=\d)/g, ' ')
}

/** The length of the longest part of a figure that can't wrap. */
export function longestPart(text: string): number {
  return Math.max(1, ...text.split(/[ \t\n]+/).map((part) => [...part].length))
}
