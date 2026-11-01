import type { ReactNode } from 'react'
import styles from './Highlight.module.css'

// The sand highlighter (CLAUDE.md § 6): one phrase per headline, never more.

export function Highlight({ children }: { children: ReactNode }) {
  return <span className={styles.highlight}>{children}</span>
}

/** Renders `text` with `phrase` highlighted, if the phrase appears in it. */
export function withHighlight(text: string, phrase?: string | null): ReactNode {
  if (!phrase) return text
  const at = text.indexOf(phrase)
  if (at === -1) return text
  return (
    <>
      {text.slice(0, at)}
      <Highlight>{phrase}</Highlight>
      {text.slice(at + phrase.length)}
    </>
  )
}
