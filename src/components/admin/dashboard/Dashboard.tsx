import { Link } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'
import {
  type Inbox,
  coursesCount,
  dayAndMonth,
  inboxLabels,
  inboxOf,
  initialsOf,
  timeAgo,
  todayLine,
} from '@/lib/admin-dashboard'
import { courseTags } from '@/lib/courses'
import { formatDateLong, startOfTodayInSofia } from '@/lib/format'
import styles from './dashboard.module.css'

// «Admin · 01 Табло» (359:969): one card at the full height. The overview's three figures, the
// latest inquiries beside the groups that start soon (only these two lists grow; their rows are
// 64px), and the shortcuts. Everything is read from the CMS; an empty list says so.

const statusLabels: Record<string, string> = {
  new: 'Нова',
  'in-progress': 'В работа',
  contract: 'Договор',
  closed: 'Приключено',
}
const topicLabels: Record<string, string> = {
  course: 'Курс',
  voucher: 'Обучение с ваучер',
  translation: 'Превод',
  levelTest: 'Тест за ниво',
  corporate: 'Фирмено обучение',
  other: 'Друго',
}
const tagLabels = {
  audience: { students: 'Ученици', adults: 'Възрастни', companies: 'Фирми' },
  format: { 'in-person': 'Присъствено', online: 'Онлайн' },
  voucher: 'С ваучер',
  foreigners: 'За чужденци',
}

const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className={styles.chevron}>
    <path
      d="M6 4l4 4-4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export async function Dashboard({ payload }: AdminViewServerProps) {
  const admin = payload.config.routes.admin
  const list = (slug: string, query = '') => `${admin}/collections/${slug}${query}`
  const today = startOfTodayInSofia()
  const until = new Date(today)
  until.setUTCDate(until.getUTCDate() + 30)

  const [fresh, latest, starting, news] = await Promise.all([
    payload.find({
      collection: 'inquiries',
      where: { status: { equals: 'new' } },
      select: { topic: true, office: true },
      depth: 0,
      pagination: false,
    }),
    payload.find({ collection: 'inquiries', sort: '-createdAt', limit: 12, depth: 1 }),
    payload.find({
      collection: 'groups',
      where: { start: { greater_than_equal: today } },
      sort: 'start',
      limit: 12,
      depth: 1,
      locale: 'bg',
    }),
    payload.count({ collection: 'news', where: { _status: { equals: 'published' } } }),
  ])
  const perInbox = (inbox: Inbox) => fresh.docs.filter((doc) => inboxOf(doc) === inbox).length
  const within30 = await payload.find({
    collection: 'groups',
    where: {
      and: [
        { start: { greater_than_equal: today } },
        { start: { less_than_equal: until.toISOString() } },
      ],
    },
    select: { course: true },
    depth: 0,
    pagination: false,
  })
  const coursesSoon = new Set(within30.docs.map((group) => group.course)).size

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.titles}>
          <h1 className={styles.title}>Табло</h1>
          <p className={styles.date}>{todayLine()}</p>
        </div>
        <Link href={list('prices')} className={styles.secondary}>
          Цени
        </Link>
        <Link href={list('news/create')} className={styles.secondary}>
          + Нова новина
        </Link>
        <Link href={list('courses/create')} className={styles.primary}>
          + Нов курс
        </Link>
      </header>

      <div className={styles.card}>
        <dl className={styles.overview}>
          <div className={styles.figure}>
            <dt>Нови запитвания</dt>
            <dd>{fresh.docs.length}</dd>
            <dd className={styles.note}>
              {(['courses', 'plovdiv', 'sofia'] as const)
                .map((inbox) => `${inboxLabels[inbox]} ${perInbox(inbox)}`)
                .join(' · ')}
            </dd>
          </div>
          <div className={styles.figure}>
            <dt>Започват до 30 дни</dt>
            <dd>{coursesSoon}</dd>
            <dd className={styles.note}>
              {coursesCount(coursesSoon)} до {formatDateLong(until)}
            </dd>
          </div>
          <div className={styles.figure}>
            <dt>Новини</dt>
            <dd>{news.totalDocs}</dd>
            <dd className={styles.note}>
              {news.totalDocs === 1 ? 'публикувана статия' : 'публикувани статии'}
            </dd>
          </div>
        </dl>

        <div className={styles.lists}>
          <section className={styles.listCell} aria-labelledby="dashboard-inquiries">
            <div className={styles.listHeader}>
              <h2 id="dashboard-inquiries">Последни запитвания</h2>
              <Link href={list('inquiries')} className={styles.more}>
                Всички
                <Chevron />
              </Link>
            </div>
            {latest.docs.length === 0 ? (
              <p className={styles.empty}>Още няма запитвания.</p>
            ) : (
              <ul className={styles.rows}>
                {latest.docs.map((inquiry) => {
                  const course = typeof inquiry.course === 'object' ? inquiry.course : null
                  return (
                    <li key={inquiry.id}>
                      <Link href={list(`inquiries/${inquiry.id}`)} className={styles.row}>
                        <span className={styles.avatar} aria-hidden="true">
                          {initialsOf(inquiry.name)}
                        </span>
                        <span className={styles.text}>
                          <span className={styles.name}>{inquiry.name}</span>
                          <span className={styles.sub}>
                            {inboxLabels[inboxOf(inquiry)]} ·{' '}
                            {course?.title ??
                              (inquiry.topic ? (topicLabels[inquiry.topic] ?? inquiry.topic) : '')}
                          </span>
                        </span>
                        <span className={styles.time}>{timeAgo(inquiry.createdAt)}</span>
                        <span
                          className={styles.pill}
                          data-tone={inquiry.status === 'new' ? 'solid' : 'neutral'}
                        >
                          {statusLabels[inquiry.status] ?? inquiry.status}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className={styles.listCell} aria-labelledby="dashboard-starting">
            <div className={styles.listHeader}>
              <h2 id="dashboard-starting">Започват скоро</h2>
              <Link href={list('courses')} className={styles.more}>
                Всички курсове
                <Chevron />
              </Link>
            </div>
            {starting.docs.length === 0 ? (
              <p className={styles.empty}>Няма групи с предстояща дата.</p>
            ) : (
              <ul className={styles.rows}>
                {starting.docs.map((group) => {
                  const course = typeof group.course === 'object' ? group.course : null
                  const { day, month } = dayAndMonth(group.start)
                  const tags = course
                    ? courseTags(
                        {
                          language: course.language,
                          audience: course.audience,
                          audienceNote: course.audienceNote,
                          cardTag: course.cardTag,
                          voucherEligible: course.voucherEligible,
                          format: group.format ?? course.format,
                        },
                        tagLabels,
                      )
                    : []
                  return (
                    <li key={group.id}>
                      <Link
                        href={course ? list(`courses/${course.id}`) : list(`groups/${group.id}`)}
                        className={styles.row}
                      >
                        <span className={styles.day}>
                          <span>{day}</span>
                          <span>{month}</span>
                          <span className={styles.srOnly}> {formatDateLong(group.start)}</span>
                        </span>
                        <span className={styles.text}>
                          <span className={styles.name}>{course?.title ?? group.title}</span>
                          <span className={styles.sub}>{tags.join(' • ')}</span>
                        </span>
                        <Chevron />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        <h2 className={styles.sectionHeader}>Често редактирани</h2>
        <ul className={styles.shortcuts}>
          {[
            ['Езикови курсове', 'Курсове', list('courses', '?where[category][equals]=languages')],
            ['Новини', 'Всички статии', list('news')],
            ['За нас', 'Документи и лицензи', list('documents')],
            ['Сайт', 'Правни страници', list('legal-pages')],
          ].map(([section, label, href]) => (
            <li key={href}>
              <Link href={href} className={styles.shortcut}>
                <span className={styles.text}>
                  <span className={styles.section}>{section}</span>
                  <span className={styles.name}>{label}</span>
                </span>
                <Chevron />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
