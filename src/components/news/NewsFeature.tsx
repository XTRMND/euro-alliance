import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { DuotoneImage } from '@/components/visuals/DuotoneImage'
import { formatDateLong } from '@/lib/format'
import { routes } from '@/lib/routes'
import type { Media, News } from '@/payload-types'
import styles from './NewsFeature.module.css'

// News feature (181:365): the lead story on the news listing. The cover in its 30% tint, taped,
// clearing to colour on hover; the date on a sand chip, the title, the excerpt and «Прочети
// новината». One link: the title's, stretched over the card. Below 1024px it's a News card with
// the excerpt under it (188:2219): no chip, tape or «Прочети новината».

type NewsFeatureProps = {
  news: Pick<News, 'title' | 'slug' | 'date' | 'cover' | 'excerpt'>
}

export async function NewsFeature({ news }: NewsFeatureProps) {
  const t = await getTranslations('news')
  const cover = typeof news.cover === 'object' ? (news.cover as Media | null) : null
  return (
    <article className={['duotone-hover', styles.feature].join(' ')} data-clear-on-centre="">
      {cover && (
        <div className={styles.media}>
          <DuotoneImage
            media={cover}
            tint="news"
            sizes="(min-width: 1024px) 680px, 92vw"
            clearOnHover
            eager
          />
          <span className={styles.tape} aria-hidden="true" />
        </div>
      )}
      <div className={styles.text}>
        <time dateTime={news.date} className={styles.date}>
          {formatDateLong(news.date)}
        </time>
        <h2 className={styles.title}>
          {news.slug ? (
            <Link href={routes.newsArticle(news.slug)} prefetch={false} className={styles.link}>
              {news.title}
            </Link>
          ) : (
            news.title
          )}
        </h2>
        {news.excerpt && <p className={styles.excerpt}>{news.excerpt}</p>}
        <span className={styles.more} aria-hidden="true">
          {t('readMore')}
        </span>
      </div>
    </article>
  )
}
