import { markTerms } from '@/lib/search-text'
import styles from './SearchResult.module.css'

/** `text` with the search terms in <mark> (docs/motion.md § 11). */
export function Marked({ text, terms }: { text: string; terms: string[] }) {
  return markTerms(text, terms).map((segment, i) =>
    segment.mark ? (
      <mark key={i} className={styles.mark}>
        {segment.text}
      </mark>
    ) : (
      segment.text
    ),
  )
}
