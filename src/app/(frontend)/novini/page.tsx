import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { NewsCard } from '@/components/cards/NewsCard'
import { NewsFeature } from '@/components/news/NewsFeature'
import { Pagination } from '@/components/news/Pagination'
import { PageHero } from '@/components/patterns/PageHero'
import { InquiryBand } from '@/components/shell/InquiryBand'
import { getNewsList } from '@/lib/cms'
import { newsPage, newsPageCount } from '@/lib/news'
import landing from '@/styles/landing.module.css'
import styles from './page.module.css'

// News (183:2437 / 188:2196): the hero, the newest as the lead story (page 1), then «Всички
// новини», six a page, with the pagination. A page past the last is a 404. The lead story lands
// from 60px lower («Prototype · Новини landing», 188:4851) without fading: its photo is the
// likely LCP element.

type Params = PageProps<'/novini'>

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('news')
  return { title: t('breadcrumb'), description: t('lead') }
}

export default async function NewsPage({ searchParams }: Params) {
  const { stranitsa } = await searchParams
  const page = stranitsa === undefined ? 1 : Number(stranitsa)
  const [all, t] = await Promise.all([getNewsList(), getTranslations('news')])
  const pages = newsPageCount(all.length)
  if (!Number.isInteger(page) || page < 1 || page > pages) notFound()
  const { feature, grid } = newsPage(all, page)

  return (
    <>
      <PageHero
        breadcrumb={[{ label: t('breadcrumb') }]}
        title={t('title')}
        highlight={t('titleHighlight')}
        lead={t('lead')}
      />
      {feature ? (
        <div className={[styles.feature, landing.rise].join(' ')}>
          <NewsFeature news={feature} />
        </div>
      ) : (
        page === 1 && <p className={styles.empty}>{t('empty')}</p>
      )}
      {grid.length > 0 && (
        <section className={styles.all} aria-labelledby="all-news">
          <h2 id="all-news" className={styles.allTitle}>
            {t('all')}
          </h2>
          <ul className={styles.grid}>
            {grid.map((news) => (
              <li key={news.id}>
                <NewsCard
                  news={news}
                  tint="news"
                  sizes="(min-width: 1024px) 405px, (min-width: 768px) 46vw, 92vw"
                />
              </li>
            ))}
          </ul>
          <Pagination page={page} pages={pages} />
        </section>
      )}
      <InquiryBand />
    </>
  )
}
