import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { routes } from '@/lib/routes'
import styles from './Pagination.module.css'

// Pagination of the news listing: Page number (181:371) links, the current page marked (not a
// link), «Следваща» after them and «Предишна» before them from page 2 (not in Figma). Links, not
// buttons: each page has its URL (/novini?stranitsa=2).
export async function Pagination({ page, pages }: { page: number; pages: number }) {
  if (pages < 2) return null
  const t = await getTranslations('news.pagination')
  return (
    <nav aria-label={t('label')} className={styles.pagination}>
      {page > 1 && (
        <Link href={routes.news(page - 1)} prefetch={false} className={styles.step}>
          {t('previous')}
        </Link>
      )}
      <ol className={styles.numbers}>
        {Array.from({ length: pages }, (_, i) => i + 1).map((number) => (
          <li key={number}>
            {number === page ? (
              <span className={styles.number} aria-current="page">
                <span className="sr-only">{t('page', { n: number })}</span>
                <span aria-hidden="true">{number}</span>
              </span>
            ) : (
              <Link
                href={routes.news(number)}
                prefetch={false}
                className={styles.number}
                aria-label={t('page', { n: number })}
              >
                {number}
              </Link>
            )}
          </li>
        ))}
      </ol>
      {page < pages && (
        <Link href={routes.news(page + 1)} prefetch={false} className={styles.step}>
          {t('next')}
        </Link>
      )}
    </nav>
  )
}
