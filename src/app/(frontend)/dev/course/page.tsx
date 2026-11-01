import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CourseDetails } from '@/components/courses/CourseDetails'
import { CourseHero } from '@/components/courses/CourseHero'
import { EnrolBar } from '@/components/courses/EnrolBar'
import { Button } from '@/components/ui/Button'
import { courseState } from '@/lib/course-state'
import { destinations } from '@/lib/destinations'
import { routes } from '@/lib/routes'
import type { Course } from '@/payload-types'
import styles from '../patterns/page.module.css'

// The course page's parts (PR 10) in every state of board 126:1940, with obviously fake courses
// (year 2099) that never reach the CMS. Development only: served with DEV_PAGES=true.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Курс', robots: { index: false, follow: false } }

const today = '2099-01-01T00:00:00.000Z'

const base: Course = {
  id: 1,
  title: 'Тестов курс B2',
  slug: 'testov-kurs-b2',
  category: 'languages',
  language: 'english',
  topic: 'english',
  audience: 'adults',
  format: 'online',
  level: 'B2',
  levelName: 'Тестово ниво',
  description: 'Тестово описание на курса в един ред.',
  startDate: '2099-03-01T12:00:00.000Z',
  days: 'тестови дни',
  hours: '10:00–12:00',
  duration: 'Тестов хорариум в два реда, за да се види пренасянето.',
  venue: 'Тестова учебна база',
  city: 'Тестов град',
  program: 'Тестова програма',
  document: 'Тестов документ',
  included: 'Тестово включено',
  price: 100,
  currency: 'EUR',
  priceNote: 'тестова бележка',
  seats: 5,
  updatedAt: '',
  createdAt: '',
}

const states: { name: string; course: Course }[] = [
  { name: 'Промоция', course: { ...base, regularPrice: 120 } },
  { name: 'Редовна цена', course: base },
  { name: 'С ваучер', course: { ...base, voucherEligible: true, priceNote: null } },
  { name: 'Малко места', course: { ...base, seats: 2 } },
  { name: 'Записването приключи', course: { ...base, seats: 0 } },
  {
    name: 'Липсващи полета',
    course: {
      ...base,
      days: null,
      hours: null,
      venue: null,
      city: null,
      audience: null,
      program: null,
      included: null,
      price: null,
      seats: null,
    },
  },
]

const action = (course: Course) => {
  const closed = courseState(course, today).enrolment === 'closed'
  return (
    <Button href={routes.enrol(base.slug!)} variant={closed ? 'secondary' : 'primary'}>
      {closed ? 'Уведоми ме за следващия курс' : 'Запиши се'}
    </Button>
  )
}

export default function CourseStatesPage() {
  if (process.env.DEV_PAGES !== 'true') notFound()

  return (
    <>
      <CourseHero
        breadcrumb={[{ label: 'Курсове', href: routes.courses() }, { label: base.title }]}
        tags={['Възрастни', 'Онлайн']}
        title={base.title}
        level={base.level}
        levelLabel="Ниво"
        description={base.description}
        topic="english"
        enrol={action(base)}
        ask={
          <Button href={routes.enrol(base.slug!)} variant="link">
            Задай въпрос
          </Button>
        }
      />
      <div className={styles.page}>
        {states.map(({ name, course }) => (
          <section key={name} aria-label={name} className={styles.section}>
            <CourseDetails
              course={course}
              state={courseState(course, today)}
              participants={course.audience ? 'Възрастни' : undefined}
              format="Онлайн"
              levelCheckHref={destinations.certificates.href}
              action={action(course)}
            />
          </section>
        ))}
      </div>
      <EnrolBar price="100 €" note="тестова бележка" action={action(base)} />
    </>
  )
}
