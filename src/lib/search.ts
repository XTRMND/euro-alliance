import config from '@payload-config'
import { getPayload } from 'payload'
import { type SearchHit, searchRecords } from './search-match'
import { getSearchRecords } from './search-records'
import { searchTerms } from './search-text'

// The site search (docs/cms-schema.md § 8, docs/motion.md § 11), straight over the published
// content (docs/admin-redesign.md, decision 8: no index collection). It matches as the index's
// PostgreSQL query did: every word of the query as written, lowercased, as the start of a word of
// the page («англ» finds «английски»), or, for typos, the query close enough to a run of words of
// the title or excerpt by their trigrams («англйски»). Ranked by both, newest first on a tie.

export type { SearchHit }

export async function searchSite(query: string): Promise<SearchHit[]> {
  if (searchTerms(query).length === 0) return []
  return searchRecords(await getSearchRecords(await getPayload({ config })), query)
}
