import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CourseDetails } from '@/components/courses/CourseDetails'
import { CourseHero } from '@/components/courses/CourseHero'
import { EnrolBar } from '@/components/courses/EnrolBar'
import { Button } from '@/components/ui/Button'
import { type CourseGroup, type SiteCourse, courseState } from '@/lib/course-state'
import { destinations } from '@/lib/destinations'
import { routes } from '@/lib/routes'
import styles from '../patterns/page.module.css'

// The course page's parts (PR 10) in every state of board 126:1940, with obviously fake courses
// (year 2099) that never reach the CMS. Development only: served with DEV_PAGES=true.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Курс', robots: { index: false, follow: false } }

const today = '2099-01-01T00:00:00.000Z'

const group: CourseGroup = {
  id: 1,
  course: 1,
  updatedAt: '',
  createdAt: '',
  start: '2099-03-01T12:00:00.000Z',
  days: 'тестови дни',
  hours: '10:00–12:00',
  format: 'online',
  price: 100,
  currency: 'EUR',
  priceLabel: 'тестов етикет',
  seats: 5,
}

const base: SiteCourse = {
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
  duration: 'Тестов хорариум в два реда, за да се види пренасянето.',
  program: 'Тестова програма',
  document: 'Тестов документ',
  included: 'Тестово включено',
  groups: [group],
  updatedAt: '',
  createdAt: '',
}

const withGroup = (changes: Partial<CourseGroup>): SiteCourse => ({
  ...base,
  groups: [{ ...group, ...changes }],
})

const states: { name: string; course: SiteCourse }[] = [
  { name: 'Промоция', course: withGroup({ regularPrice: 120 }) },
  { name: 'Редовна цена', course: base },
  {
    name: 'С ваучер',
    course: { ...withGroup({ priceLabel: null }), voucherEligible: true },
  },
  { name: 'Малко места', course: withGroup({ seats: 2 }) },
  { name: 'Няма места', course: withGroup({ seats: 0 }) },
  { name: 'В ход', course: withGroup({ start: '2098-12-01T12:00:00.000Z' }) },
  { name: 'Няма насрочена дата', course: { ...base, groups: [] } },
  { name: 'Безплатно', course: { ...base, groups: [], free: true } },
  {
    name: 'Липсващи полета',
    course: {
      ...base,
      audience: null,
      program: null,
      included: null,
      groups: [
        {
          ...group,
          id: 2,
          days: null,
          hours: null,
          format: null,
          price: null,
          priceLabel: null,
          seats: null,
        },
      ],
    },
  },
]

const action = (course: SiteCourse) => {
  const state = courseState(course, today)
  const closed = state.enrolment === 'inquiry'
  return (
    <Button href={routes.enrol(base.slug!)} variant={closed ? 'secondary' : 'primary'}>
      {!closed
        ? 'Запиши се'
        : state.status === 'upcoming' && state.seats === 0
          ? 'Уведоми ме за следващия курс'
          : 'Запитване'}
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
      <EnrolBar price="100 €" note="тестов етикет" action={action(base)} />
    </>
  )
}
