import { getTranslations } from 'next-intl/server'
import { NewsCard } from '@/components/cards/NewsCard'
import { Breadcrumb } from '@/components/patterns/Breadcrumb'
import { SwipeRow } from '@/components/patterns/SwipeRow'
import { InquiryBand } from '@/components/shell/InquiryBand'
import { DuotoneImage } from '@/components/visuals/DuotoneImage'
import { formatDateLong } from '@/lib/format'
import { bannerShows } from '@/lib/media/slots'
import { newsOutline, nodeText, readingMinutes, type LexicalBody } from '@/lib/news'
import { routes } from '@/lib/routes'
import type { Media, News } from '@/payload-types'
import landing from '@/styles/landing.module.css'
import { ArticleBody } from './ArticleBody'
import { ArticleContents } from './ArticleContents'
import { ArticleSidebar } from './ArticleSidebar'
import styles from './NewsArticle.module.css'

// A news article (183:2574 / 188:2385): the hero (breadcrumb, date chip, H1, the cover in its 30%
// tint, unless it's smaller than the banner or has text in it: src/lib/media/slots.ts), then the
// contents rail, the text and the sidebar side by side from 1280px (the sidebar under the text
// from 1024, everything stacked below with the contents box), and «Още новини».
// Landing from «Prototype · Новина landing» (188:4957): the copy fades up; the cover, the likely
// LCP element, only rises.

type Card = Pick<News, 'id' | 'title' | 'slug' | 'date' | 'cover'>

type NewsArticleProps = {
  article: News
  latest: Card[]
  more: Card[]
  /** The article's absolute address, for sharing. */
  url: string
}

export async function NewsArticle({ article, latest, more, url }: NewsArticleProps) {
  const t = await getTranslations('news')
  const media = typeof article.cover === 'object' ? (article.cover as Media | null) : null
  const cover = media && bannerShows(media) ? media : null
  const outline = newsOutline(article.body as LexicalBody)
  const minutes = readingMinutes(
    article.lead,
    article.body ? nodeText((article.body as NonNullable<LexicalBody>).root) : null,
  )
  const textId = 'article-text'

  return (
    <>
      <div className={styles.hero}>
        <div className={[styles.heroCopy, landing.copy].join(' ')}>
          <Breadcrumb
            items={[
              { label: t('breadcrumb'), href: routes.news() },
              { label: article.shortTitle || article.title },
            ]}
            className={styles.breadcrumb}
          />
          <time dateTime={article.date} className={styles.date}>
            {formatDateLong(article.date)}
          </time>
        </div>
        <h1 className={[styles.title, landing.rise].join(' ')}>{article.title}</h1>
        {cover && (
          <div className={[styles.cover, landing.rise].join(' ')}>
            <DuotoneImage
              media={cover}
              tint="news"
              sizes="(min-width: 1440px) 1280px, 92vw"
              eager
            />
          </div>
        )}
      </div>
      <div className={styles.layout} data-outline={outline.length > 1 || undefined}>
        {outline.length > 1 && (
          <div className={styles.contents}>
            <ArticleContents
              items={outline}
              articleId={textId}
              labels={{
                contents: t('contents'),
                readingTime: t('readingTime', { minutes }),
              }}
            />
          </div>
        )}
        <ArticleBody
          id={textId}
          lead={article.lead}
          body={article.body}
          headingIds={outline.map((item) => item.id)}
        />
        <div className={styles.sidebar}>
          <ArticleSidebar latest={latest} url={url} />
        </div>
      </div>
      {more.length > 0 && (
        <section className={styles.more} aria-labelledby="more-news">
          <h2 id="more-news" className={styles.moreTitle}>
            {t('related')}
          </h2>
          <SwipeRow columns={3} itemWidth={280} gap={{ column: 32 }}>
            {more.map((news) => (
              <NewsCard
                key={news.id}
                news={news}
                tint="news"
                sizes="(min-width: 1024px) 405px, 280px"
              />
            ))}
          </SwipeRow>
        </section>
      )}
      <InquiryBand />
    </>
  )
}
