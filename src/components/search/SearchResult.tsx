import Link from 'next/link'
import { Marked } from './Marked'
import styles from './SearchResult.module.css'

// Search result (217:368): the section path, the title and a snippet, one link. Hover (217:364)
// turns it into a white card with the title in brand blue; the text stays where it is.

type SearchResultProps = {
  href: string
  path?: string | null
  title: string
  snippet: string
  terms: string[]
}

export function SearchResult({ href, path, title, snippet, terms }: SearchResultProps) {
  return (
    <Link href={href} prefetch={false} className={styles.result}>
      {path && <span className={styles.path}>{path}</span>}
      <span className={styles.title}>
        <Marked text={title} terms={terms} />
      </span>
      {snippet && (
        <span className={styles.snippet}>
          <Marked text={snippet} terms={terms} />
        </span>
      )}
    </Link>
  )
}
