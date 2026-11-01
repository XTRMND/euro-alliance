import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { formatDateLong } from '@/lib/format'
import { routes } from '@/lib/routes'
import type { News } from '@/payload-types'
import styles from './ArticleSidebar.module.css'

// Beside the article (183:2610): «Актуални новини», the three latest without this one, and
// «Сподели» with Facebook's share link (no script, no cookie until the visitor goes there).

type ArticleSidebarProps = {
  latest: Pick<News, 'id' | 'title' | 'slug' | 'date'>[]
  url: string
}

export async function ArticleSidebar({ latest, url }: ArticleSidebarProps) {
  const t = await getTranslations('news')
  return (
    <aside className={styles.sidebar}>
      {latest.length > 0 && (
        <section className={styles.latest} aria-labelledby="latest-news">
          <h2 id="latest-news" className={styles.latestTitle}>
            {t('latest')}
          </h2>
          <ul className={styles.items}>
            {latest.map((news) => (
              <li key={news.id} className={styles.item}>
                <time dateTime={news.date} className={styles.date}>
                  {formatDateLong(news.date)}
                </time>
                {news.slug ? (
                  <Link
                    href={routes.newsArticle(news.slug)}
                    prefetch={false}
                    className={styles.title}
                  >
                    {news.title}
                  </Link>
                ) : (
                  <span className={styles.title}>{news.title}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className={styles.share}>
        <span className={styles.shareLabel}>{t('share')}</span>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener"
          className={styles.facebook}
          aria-label={`${t('shareFacebook')} (${t('newWindow')})`}
        >
          <span aria-hidden="true">f</span>
        </a>
      </div>
    </aside>
  )
}
