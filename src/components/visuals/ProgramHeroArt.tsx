import type { CSSProperties } from 'react'
import notebookShadow from '@/assets/halftone/notebook-shadow.svg'
import { Flag, type FlagLanguage } from './Flag'
import { Halftone } from './Halftone'
import styles from './ProgramHeroArt.module.css'
import { Tape } from './Tape'

// Program hero art (131:311), language programme pages only (CLAUDE.md § 6): a vocabulary
// notebook page with three first phrases in the language and their translations (one
// highlighted), the flag sticker and tape, a halftone shadow, and an optional sticky note. All
// text is live text from the CMS. Laid out in Figma's 560 × 460 frame and scaled to its column.

export type NotebookPhrase = { phrase: string; translation: string }

export type NotebookNote = {
  title: string
  steps: string[]
  /** How many steps, from the first, are ticked off. */
  done?: number
}

type ProgramHeroArtProps = {
  title: string
  phrases: NotebookPhrase[]
  /** BCP 47 code of the phrases' language, e.g. `en`. */
  lang: string
  flag: FlagLanguage
  /** Index of the highlighted phrase; Figma highlights the third. */
  highlight?: number
  note?: NotebookNote
  className?: string
}

export function ProgramHeroArt({
  title,
  phrases,
  lang,
  flag,
  highlight = 2,
  note,
  className,
}: ProgramHeroArtProps) {
  return (
    <div className={[styles.art, className].filter(Boolean).join(' ')}>
      {/* The shadow's dots are a CSS mask, which counts as the hero's largest image: preloaded, so
          it doesn't wait for the stylesheet (in CORS mode, as masks are fetched). */}
      <link
        rel="preload"
        as="image"
        href={notebookShadow.src}
        crossOrigin="anonymous"
        fetchPriority="high"
      />
      <div className={styles.stage}>
        <Halftone pattern="notebook-shadow" className={styles.shadow} />
        <div className={styles.page}>
          <span aria-hidden="true" className={styles.holes}>
            <span />
            <span />
            <span />
          </span>
          {title && <p className={styles.title}>{title}</p>}
          <ul className={styles.phrases}>
            {phrases.slice(0, 3).map(({ phrase, translation }, index) => (
              <li key={index} style={{ '--row': index } as CSSProperties}>
                <span
                  lang={lang}
                  className={[styles.phrase, index === highlight && styles.highlighted]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {phrase}
                </span>
                <span className={styles.translation}>{translation}</span>
              </li>
            ))}
          </ul>
        </div>
        <Flag language={flag} className={styles.flag} />
        <Tape className={styles.tape} />
        {note && (
          <div className={styles.note}>
            <p className={styles.noteTitle}>{note.title}</p>
            <ul className={styles.steps}>
              {note.steps.slice(0, 3).map((step, index) => {
                const done = index < (note.done ?? 0)
                return (
                  <li key={index} className={done ? styles.done : undefined}>
                    <TickBox checked={done} />
                    {step}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

/** The hand-drawn box; a ticked one has the tick spilling out of it (133:336). */
function TickBox({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden="true" className={styles.box}>
      {checked && (
        <svg viewBox="0 0 19.4 18.4" className={styles.tick}>
          <rect x="1" y="5" width="12.4" height="12.4" rx="1.2" />
          <path d="M1.2 11.2 6.2 17.2 18.2 1.2" />
        </svg>
      )}
    </span>
  )
}
