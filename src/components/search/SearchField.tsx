import { getTranslations } from 'next-intl/server'
import searchRing from '@/assets/search-ring.svg'
import { queryParams, routes } from '@/lib/routes'
import styles from './SearchField.module.css'

// Search field (217:358): a GET form to the search page, so it works without JavaScript and every
// search is an address the back button returns to. Default, Focused (a 2px navy border) and Filled
// (the query in navy) come from the input itself.

export async function SearchField({ query, className }: { query?: string; className?: string }) {
  const t = await getTranslations('search')
  return (
    <form
      role="search"
      action={routes.search()}
      method="get"
      className={[styles.field, className].filter(Boolean).join(' ')}
    >
      {/* Low priority, so React doesn't preload it on every page (the 404 page has the field). */}
      {/* eslint-disable-next-line @next/next/no-img-element -- a 16px decorative SVG */}
      <img
        src={searchRing.src}
        alt=""
        width={16}
        height={16}
        className={styles.icon}
        fetchPriority="low"
      />
      <input
        type="search"
        name={queryParams.search}
        defaultValue={query}
        placeholder={t('placeholder')}
        aria-label={t('label')}
        maxLength={100}
        className={styles.input}
      />
      <button type="submit" className={styles.submit}>
        {t('submit')}
      </button>
    </form>
  )
}
