import Link from 'next/link'
import { DuotoneImage } from '@/components/visuals/DuotoneImage'
import { formatDateLong } from '@/lib/format'
import type { Tint } from '@/lib/media/tints'
import { routes } from '@/lib/routes'
import type { Media, News } from '@/payload-types'
import styles from './NewsCard.module.css'

// News card (62:240): the cover in its duotone tint (Tint=Strong, 55%, on the homepage; Light,
// 30%, on the news pages), the date and the title. The photo clears to full colour on hover and
// keyboard focus, and on touch screens while the card is in the middle of the screen
// (ClearOnCentre). No cover, no image: never a placeholder. The whole card is the title's link.

type NewsCardProps = {
  news: Pick<News, 'title' | 'slug' | 'date' | 'cover'>
  tint: Extract<Tint, 'homeNews' | 'news'>
  /** next/image `sizes` for the cover. */
  sizes: string
  headingLevel?: 'h2' | 'h3'
  className?: string
}

export function NewsCard({
  news,
  tint,
  sizes,
  headingLevel: Heading = 'h3',
  className,
}: NewsCardProps) {
  const cover = typeof news.cover === 'object' ? (news.cover as Media | null) : null

  return (
    <article
      className={['duotone-hover', styles.card, className].filter(Boolean).join(' ')}
      data-clear-on-centre=""
    >
      {cover && (
        <div className={styles.media}>
          <DuotoneImage media={cover} tint={tint} sizes={sizes} clearOnHover />
        </div>
      )}
      <p className={styles.date}>
        <time dateTime={news.date}>{formatDateLong(news.date)}</time>
      </p>
      <Heading className={styles.title}>
        {news.slug ? (
          <Link href={routes.newsArticle(news.slug)} prefetch={false} className={styles.link}>
            {news.title}
          </Link>
        ) : (
          news.title
        )}
      </Heading>
    </article>
  )
}
