import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsCard } from '@/components/cards/NewsCard'
import { CardGrid } from '@/components/patterns/CardGrid'
import { NewsArticle } from '@/components/news/NewsArticle'
import { NewsFeature } from '@/components/news/NewsFeature'
import { Pagination } from '@/components/news/Pagination'
import { getHome } from '@/lib/cms'
import type { Media, News } from '@/payload-types'
import styles from '../patterns/page.module.css'

// The news pages' parts (PR 15) with obviously fake articles (year 2099) that never reach the
// CMS: a whole article with every body element, then the lead story, cards and the pagination. The
// cover is the homepage's classroom photo (seeded from Figma). Development only: served with
// DEV_PAGES=true.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Новини', robots: { index: false, follow: false } }

const text = (value: string) => ({
  type: 'text',
  text: value,
  format: 0,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
})
const paragraph = (value: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children: [text(value)],
})
const heading = (value: string) => ({
  type: 'heading',
  tag: 'h2',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [text(value)],
})
const block = (fields: Record<string, unknown>) => ({
  type: 'block',
  format: '',
  version: 2,
  fields: { id: String(Math.random()).slice(2), blockName: '', ...fields },
})

const body = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      heading('Тестов раздел едно'),
      paragraph(
        'Тестов абзац с достатъчно думи, за да се види пренасянето на редовете в колоната.',
      ),
      block({
        blockType: 'newsFigures',
        items: [
          { id: 'a', figure: '11', label: 'тестови числа' },
          { id: 'b', figure: '22', label: 'тестови неща' },
          { id: 'c', figure: '33+', label: 'тестови участници' },
        ],
        caption: 'Тестов надпис под числата.',
      }),
      heading('Тестов раздел две'),
      paragraph('Още един тестов абзац.'),
      { ...paragraph('Тестов цитат в един ред.'), type: 'quote' },
      heading('Тестов раздел три'),
      paragraph('Последен тестов абзац преди връзката.'),
      block({
        blockType: 'newsLinkCard',
        label: 'Тестова връзка',
        url: 'https://example.com/test',
        buttonLabel: 'Към теста',
      }),
    ],
  },
} as unknown as News['body']

export default async function DevNewsPage() {
  if (process.env.DEV_PAGES !== 'true') notFound()
  const home = await getHome()
  const cover = typeof home.hero?.photo === 'object' ? (home.hero.photo as Media | null) : null

  const fake = (n: number): News => ({
    id: n,
    title: `Тестова новина ${n} с по-дълго заглавие на два реда`,
    slug: `testova-novina-${n}`,
    date: `2099-0${(n % 9) + 1}-1${n % 9}T12:00:00.000Z`,
    cover,
    excerpt: 'Тестов откъс от новината в едно-две изречения, само за прегледа на страницата.',
    updatedAt: '2099-01-01T00:00:00.000Z',
    createdAt: '2099-01-01T00:00:00.000Z',
  })
  const article: News = {
    ...fake(1),
    shortTitle: 'Тестова новина',
    lead: 'Тестов въвеждащ абзац с по-едър шрифт.',
    body,
  }

  return (
    <>
      <NewsArticle
        article={article}
        latest={[fake(2), fake(3), fake(4)]}
        more={[fake(5), fake(6), fake(7)]}
        url="https://example.com/novini/testova-novina-1"
      />
      <div className={styles.page}>
        <section aria-label="News feature (181:365)" className={styles.section}>
          <NewsFeature news={fake(8)} />
        </section>
        <section aria-label="News card (62:240), Page number (181:371)" className={styles.section}>
          <CardGrid columns={3}>
            {[2, 3, 4].map((n) => (
              <NewsCard key={n} news={fake(n)} tint="news" sizes="405px" />
            ))}
          </CardGrid>
          <Pagination page={2} pages={3} />
        </section>
      </div>
    </>
  )
}
