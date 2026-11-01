import { sql } from '@payloadcms/db-postgres'
import config from '@payload-config'
import { getPayload } from 'payload'
import type { SearchType } from './search-index'
import { prefixQuery, searchTerms } from './search-text'

// The site search (docs/cms-schema.md § 8, docs/motion.md § 11): PostgreSQL full-text search over
// the index with the `simple` configuration (no Bulgarian dictionary: every word as written,
// lowercased), each word matched as a prefix («англ» finds «английски»), and trigram similarity on
// the title and excerpt for typos («англйски»). Ranked by both, newest first on a tie.

export type SearchHit = {
  id: number
  type: SearchType
  title: string
  path: string | null
  excerpt: string | null
  text: string | null
  url: string
  sourceId: number | null
}

// The indexed text; the same expression as the migration's GIN index (search_document_idx).
const documentSql = sql.raw(
  `to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("path", '') || ' ' || coalesce("excerpt", '') || ' ' || coalesce("text", ''))`,
)

/** Typo tolerance: how close the query must be to a word sequence of the title or excerpt. */
const similarity = 0.5

type Row = {
  id: number
  type: SearchType
  title: string
  path: string | null
  excerpt: string | null
  text: string | null
  url: string
  source_id: string | number | null
}

export async function searchSite(query: string): Promise<SearchHit[]> {
  const terms = searchTerms(query)
  if (terms.length === 0) return []
  const phrase = terms.join(' ')
  const tsquery = sql`to_tsquery('simple', ${prefixQuery(terms)})`
  const payload = await getPayload({ config })
  const db = payload.db as unknown as {
    drizzle: { execute: (query: unknown) => Promise<{ rows: Row[] }> }
  }
  const { rows } = await db.drizzle.execute(sql`
    select id, type, title, path, excerpt, text, url, source_id
    from search
    where ${documentSql} @@ ${tsquery}
      or word_similarity(${phrase}, coalesce(title, '') || ' ' || coalesce(excerpt, '')) > ${similarity}
    order by
      ts_rank(${documentSql}, ${tsquery})
        + word_similarity(${phrase}, coalesce(title, '')) desc,
      published_at desc nulls last
    limit 60
  `)
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    path: row.path,
    excerpt: row.excerpt,
    text: row.text,
    url: row.url,
    sourceId: row.source_id === null ? null : Number(row.source_id),
  }))
}
