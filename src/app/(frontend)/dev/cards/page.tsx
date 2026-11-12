import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CourseCard } from '@/components/cards/CourseCard'
import { NewsCard } from '@/components/cards/NewsCard'
import { ProgramCard } from '@/components/cards/ProgramCard'
import { CourseGrid } from '@/components/patterns/CourseGrid'
import { SwipeRow } from '@/components/patterns/SwipeRow'
import { courseTopics } from '@/lib/courses'
import { destinations } from '@/lib/destinations'
import type { SiteCourse } from '@/lib/course-state'
import type { Media } from '@/payload-types'
import fixtureColour from '../patterns/_fixtures/fixture-colour.jpg'
import fixtureTint from '../patterns/_fixtures/fixture-home-news.jpg'
import styles from '../patterns/page.module.css'

// The homepage cards (PR 8): Course card (62:229), Program card (56:280) and News card (62:240),
// in the rows they sit in. Development only: served with DEV_PAGES=true and never indexed. Course
// and news values are obviously fake test data (the year 2099) that can never reach the CMS;
// program card copy is Figma's. The photo is the generated test fixture, tinted by the pipeline.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Карти',
  robots: { index: false, follow: false },
}

const groupBase = { course: 1, updatedAt: '', createdAt: '' }

const course = (id: number, fields: Partial<SiteCourse>): SiteCourse => ({
  id,
  title: `Тестов курс ${id}`,
  slug: `testov-kurs-${id}`,
  category: 'languages',
  topic: 'english',
  updatedAt: '',
  createdAt: '',
  groups: [],
  ...fields,
})

const courses = [
  course(1, {
    audience: 'adults',
    format: 'online',
    level: 'B2',
    groups: [
      {
        ...groupBase,
        id: 1,
        start: '2099-01-15T12:00:00.000Z',
        price: 100,
        priceLabel: 'тестов етикет',
      },
    ],
  }),
  course(2, {
    title: 'Тестов курс с дълго заглавие, което не се побира на два реда в картата',
    topic: 'german',
    audience: 'adults',
    voucherEligible: true,
    level: 'A1–B1',
    groups: [
      {
        ...groupBase,
        id: 2,
        start: '2099-02-01T12:00:00.000Z',
        price: 100.5,
      },
    ],
  }),
  course(3, {
    topic: 'exam-prep',
    audience: 'students',
    audienceNote: '12 клас',
    format: 'in-person',
    groups: [{ ...groupBase, id: 3, start: '2099-03-01T12:00:00.000Z' }],
  }),
  course(4, { topic: 'computer', cardTag: 'Тестов етикет' }),
]

// One card per course sticker, so the e2e test can hover each and check it stays inside the card.
const everySticker = courseTopics.map((topic, index) =>
  course(100 + index, { title: `Тестов курс ${topic}`, slug: `testov-kurs-${topic}`, topic }),
)

const photo = {
  url: fixtureColour.src,
  width: fixtureColour.width,
  height: fixtureColour.height,
  alt: 'Тестова снимка',
  tints: { docs: [{ tint: 'homeNews', url: fixtureTint.src }] },
} as unknown as Media

const news = [1, 2, 3].map((id) => ({
  title: `Тестова новина ${id}`,
  slug: `testova-novina-${id}`,
  date: `2099-0${id}-01T12:00:00.000Z`,
  cover: id === 3 ? null : photo,
}))

export default function CardsPage() {
  if (process.env.DEV_PAGES !== 'true') notFound()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Карти</h1>

      <section aria-label="Course card" className={styles.section}>
        <CourseGrid>
          {courses.map((item) => (
            <CourseCard key={item.id} course={item} headingLevel="h2" />
          ))}
        </CourseGrid>
      </section>

      <section aria-label="Course card, every sticker" className={styles.section}>
        <CourseGrid>
          {everySticker.map((item) => (
            <CourseCard key={item.id} course={item} headingLevel="h2" />
          ))}
        </CourseGrid>
      </section>

      <section aria-label="Program card" className={styles.section}>
        <SwipeRow columns={4} itemWidth={276} gap={{ row: 48, column: 18 }}>
          <ProgramCard
            index={1}
            title="Езици за ученици"
            text="От 1 до 12 клас, в малки групи и индивидуално, по училищните програми."
            linkLabel="Виж програмите"
            href={destinations.languagesStudents.href}
            sticker="student"
            tilt={1.2}
            headingLevel="h2"
          />
          <ProgramCard
            index={3}
            title="Изпити и сертификати"
            text="Cambridge, ДЗИ и НВО, входни тестове за ниво и признаване на езикови умения."
            linkLabel="Провери нивото си"
            href={destinations.certificates.href}
            sticker="exams"
            tilt={0.5}
            headingLevel="h2"
          />
          <ProgramCard
            index={8}
            title="Компютърни курсове"
            linkLabel="Виж курсовете"
            href={destinations.computerCourses.href}
            sticker="computer"
            tilt={0.6}
            headingLevel="h2"
          />
        </SwipeRow>
      </section>

      <section aria-label="News card" className={styles.section}>
        <SwipeRow columns={3} itemWidth={290}>
          {news.map((item) => (
            <NewsCard
              key={item.slug}
              news={item}
              tint="homeNews"
              sizes="(min-width: 1024px) 420px, 290px"
              headingLevel="h2"
            />
          ))}
        </SwipeRow>
      </section>
    </div>
  )
}
