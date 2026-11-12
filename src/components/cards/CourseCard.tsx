import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { CountBubble } from '@/components/patterns/CountBubble'
import { Halftone } from '@/components/visuals/Halftone'
import { Sticker } from '@/components/visuals/Sticker'
import { courseState } from '@/lib/course-state'
import { courseTags } from '@/lib/courses'
import { formatDateLong, formatPrice, startOfTodayInSofia } from '@/lib/format'
import { routes } from '@/lib/routes'
import type { SiteCourse } from '@/lib/course-state'
import styles from './CourseCard.module.css'

// Course card (62:229): sticker art on the 42% halftone (no photo; CLAUDE.md § 12), the level
// bubble when the course has a level, tags, a title that always reserves two lines, then its
// state (src/lib/course-state.ts): an upcoming group's start date and «Запиши се»; «В ход от …»
// and «Запитване»; «Няма насрочена дата», «Попитайте» instead of a price, and «Запитване» (the
// user, 02.11.2026). The shown group's price when it has one. The whole
// card is one link (the title's, stretched); the button is part of it, not a control of its own.
// Hover and keyboard focus deepen the shadow and lift the sticker as in State=Hover (62:202).

type CourseCardProps = {
  course: SiteCourse
  headingLevel?: 'h2' | 'h3'
  className?: string
}

export async function CourseCard({
  course,
  headingLevel: Heading = 'h3',
  className,
}: CourseCardProps) {
  const t = await getTranslations()
  const state = courseState(course, startOfTodayInSofia())
  const group = state.group
  const tags = courseTags(course, {
    audience: {
      students: t('courses.audience.students'),
      adults: t('courses.audience.adults'),
      companies: t('courses.audience.companies'),
    },
    format: { 'in-person': t('courses.format.inPerson'), online: t('courses.format.online') },
    voucher: t('courses.voucher'),
    foreigners: t('program.bulgarian.adults'),
  })

  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      <div className={styles.art}>
        <Halftone pattern="course-card" />
        <Sticker topic={course.topic} sizes="242px" className={styles.sticker} />
        {course.level && (
          <CountBubble
            size="small"
            number={course.level}
            label={t(course.levelUnit === 'grade' ? 'common.grade' : 'common.level')}
            className={styles.level}
          />
        )}
      </div>
      <div className={styles.content}>
        {tags.length > 0 && <p className={styles.tags}>{tags.join(' • ')}</p>}
        <Heading className={styles.title}>
          {course.slug ? (
            <Link href={routes.course(course.slug)} prefetch={false} className={styles.link}>
              {course.title}
            </Link>
          ) : (
            course.title
          )}
        </Heading>
        <p className={styles.start}>
          {state.status === 'none' ? (
            t('course.status.none')
          ) : (
            <span className={styles.date} data-status={state.status}>
              {t(state.status === 'running' ? 'course.status.runningSince' : 'course.startsOn', {
                date: formatDateLong(group!.start),
              })}
            </span>
          )}
        </p>
        <div className={styles.foot}>
          {state.pricing === 'free' && (
            <p className={[styles.price, styles.ask].join(' ')}>{t('course.free')}</p>
          )}
          {group && state.pricing !== 'none' && state.pricing !== 'free' && (
            <p className={styles.price}>
              {formatPrice(group.price!, group.currency ?? 'EUR')}
              {group.priceLabel && <span className={styles.note}>{group.priceLabel}</span>}
            </p>
          )}
          {state.status === 'none' && state.pricing !== 'free' && (
            <p className={[styles.price, styles.ask].join(' ')}>
              {t('course.askPrice')}
              <span className={styles.note}>{t('course.askPriceNote')}</span>
            </p>
          )}
          {course.slug && (
            <span aria-hidden="true" className={styles.enrol}>
              {state.enrolment === 'open' ? t('course.enrol') : t('course.inquire')}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
