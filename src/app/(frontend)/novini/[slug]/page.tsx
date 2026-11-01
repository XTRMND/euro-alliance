import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsArticle } from '@/components/news/NewsArticle'
import { getNewsArticle, getNewsList } from '@/lib/cms'
import { newsAround } from '@/lib/news'
import { routes } from '@/lib/routes'

// A news article (183:2574 / 188:2385). Unpublished or missing articles are a 404.

type Params = PageProps<'/novini/[slug]'>

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const article = await getNewsArticle((await params).slug)
  if (!article) return {}
  return { title: article.title, description: article.excerpt ?? undefined }
}

export default async function NewsArticlePage({ params }: Params) {
  const { slug } = await params
  const [article, all] = await Promise.all([getNewsArticle(slug), getNewsList()])
  if (!article) notFound()
  // The related articles as listed, with their covers' tints.
  const related = (article.related ?? [])
    .map((news) => all.find((item) => item.id === (typeof news === 'object' ? news.id : news)))
    .filter((news) => news !== undefined)
  const { latest, more } = newsAround(all, article, related)
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  return (
    <NewsArticle
      article={article}
      latest={latest}
      more={more}
      url={`${site}${routes.newsArticle(slug)}`}
    />
  )
}
