import { getTranslations } from 'next-intl/server'
import { NewsCard } from '@/components/cards/NewsCard'
import { SwipeRow } from '@/components/patterns/SwipeRow'
import { ClearOnCentre } from '@/components/visuals/ClearOnCentre'
import { routes } from '@/lib/routes'
import type { News } from '@/payload-types'
import { SectionHead } from './SectionHead'
import styles from './LatestNews.module.css'

// «Новини и проекти» (52:267 / 115:859): the latest published news, photos at Tint=Strong (55%).
// No news, no section.

type NewsItem = Pick<News, 'id' | 'title' | 'slug' | 'date' | 'cover'>

export async function LatestNews({ title, news }: { title: string; news: NewsItem[] }) {
  if (news.length === 0) return null
  const t = await getTranslations('home')

  return (
    <section className={styles.section} aria-labelledby="news-title">
      <div className={styles.inner}>
        <SectionHead
          title={title}
          id="news-title"
          link={{ href: routes.news(), label: (long) => t.rich('allNews', { long }) }}
        />
        <SwipeRow columns={3} itemWidth={290} gap={{ column: 24 }}>
          {news.map((item) => (
            <NewsCard
              key={item.id}
              news={item}
              tint="homeNews"
              sizes="(min-width: 1024px) 420px, (min-width: 768px) 50vw, 290px"
            />
          ))}
        </SwipeRow>
        <ClearOnCentre />
      </div>
    </section>
  )
}
