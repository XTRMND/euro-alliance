import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { CourseCard } from '@/components/cards/CourseCard'
import { NewsCard } from '@/components/cards/NewsCard'
import { Highlight } from '@/components/patterns/Highlight'
import { SwipeRow } from '@/components/patterns/SwipeRow'
import { SearchField } from '@/components/search/SearchField'
import { SearchResult } from '@/components/search/SearchResult'
import { SearchTabs } from '@/components/search/SearchTabs'
import { Button } from '@/components/ui/Button'
import { getCoursesByIds, getNewsByIds } from '@/lib/cms'
import { queryParams, routes, type SearchTab, searchTabFromParam } from '@/lib/routes'
import { searchSite } from '@/lib/search'
import { searchTerms, snippetOf } from '@/lib/search-text'
import landing from '@/styles/landing.module.css'
import styles from './page.module.css'

// Search (219:2913 / 226:2920): «Резултати за «…»», the field, the tabs with their counts, then
// the courses as Course cards, the pages as Search results and the news as News cards. Without a
// query, the field alone; without results, a note and the main sections (neither is in Figma).
// The results aren't indexed by search engines.

type SearchPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const param = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 100) ?? ''

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const [t, params] = await Promise.all([getTranslations('search'), searchParams])
  const query = param(params[queryParams.search])
  return {
    title: query ? `${t('results')} «${query}»` : t('title'),
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const [t, params] = await Promise.all([getTranslations('search'), searchParams])
  const query = param(params[queryParams.search])
  const tab = searchTabFromParam(param(params[queryParams.searchTab]))
  const terms = searchTerms(query)
  const hits = terms.length > 0 ? await searchSite(query) : []

  const ids = (type: string) =>
    hits.flatMap((hit) => (hit.type === type && hit.sourceId !== null ? [hit.sourceId] : []))
  const [courses, news] = await Promise.all([
    getCoursesByIds(ids('course')),
    getNewsByIds(ids('news')),
  ])
  const pages = hits.filter((hit) => hit.type === 'page')
  const counts: Record<SearchTab, number> = {
    all: courses.length + pages.length + news.length,
    courses: courses.length,
    pages: pages.length,
    news: news.length,
  }

  return (
    <>
      <div className={styles.hero}>
        <h1 className={[styles.title, landing.rise].join(' ')}>
          {query ? (
            <>
              {t('results')} <Highlight>«{query}»</Highlight>
            </>
          ) : (
            t('title')
          )}
        </h1>
        <SearchField query={query} className={landing.copy} />
      </div>

      {query && counts.all === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyText}>{t('noResults', { query })}</p>
          <nav aria-label={t('suggestions')}>
            <ul className={styles.suggestions}>
              {[
                { href: routes.courses(), label: t('path.courses') },
                { href: routes.courses('languages'), label: t('path.languages') },
                { href: routes.translations(), label: t('path.translations') },
                { href: routes.news(), label: t('path.news') },
                { href: routes.about(), label: t('path.about') },
              ].map((item) => (
                <li key={item.href}>
                  <Button href={item.href} variant="link">
                    {item.label}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {counts.all > 0 && (
        <SearchTabs
          tabs={(['all', 'courses', 'pages', 'news'] as const).map((key) => ({
            key,
            label: t(`tab.${key}`),
            count: counts[key],
          }))}
          initial={tab}
          query={query}
          label={t('tabs')}
        >
          {courses.length > 0 && (
            <section
              data-type="courses"
              aria-labelledby="search-courses"
              className={styles.section}
            >
              <h2 id="search-courses" className={styles.heading}>
                {t('tab.courses')}
              </h2>
              <SwipeRow columns={4} itemWidth={280} gap={{ column: 24 }}>
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </SwipeRow>
            </section>
          )}
          {pages.length > 0 && (
            <section data-type="pages" aria-labelledby="search-pages" className={styles.section}>
              <h2 id="search-pages" className={styles.heading}>
                {t('tab.pages')}
              </h2>
              <ul className={styles.results}>
                {pages.map((hit) => (
                  <li key={hit.id}>
                    <SearchResult
                      href={hit.url}
                      path={hit.path}
                      title={hit.title}
                      snippet={snippetOf(hit, terms)}
                      terms={terms}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {news.length > 0 && (
            <section data-type="news" aria-labelledby="search-news" className={styles.section}>
              <h2 id="search-news" className={styles.heading}>
                {t('tab.news')}
              </h2>
              <ul className={styles.news}>
                {news.map((item) => (
                  <li key={item.id}>
                    <NewsCard
                      news={item}
                      tint="news"
                      sizes="(min-width: 1024px) 420px, (min-width: 768px) 50vw, 92vw"
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </SearchTabs>
      )}
    </>
  )
}
