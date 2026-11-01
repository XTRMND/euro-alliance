import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { CountBubble } from '@/components/patterns/CountBubble'
import { Halftone } from '@/components/visuals/Halftone'
import { Sticker } from '@/components/visuals/Sticker'
import { courseTags } from '@/lib/courses'
import { formatDateLong, formatPrice } from '@/lib/format'
import { routes } from '@/lib/routes'
import type { Course } from '@/payload-types'
import styles from './CourseCard.module.css'

// Course card (62:229): sticker art on the 42% halftone (no photo; CLAUDE.md § 12), the level
// bubble when the course has a level, tags, a title that always reserves two lines, the start
// date and the price when they're set. The whole card is one link (the title's, stretched); the
// «Запиши се» button is part of it, not a control of its own. Hover and keyboard focus deepen the
// shadow and lift the sticker as in State=Hover (62:202).

type CourseCardProps = {
  course: Course
  headingLevel?: 'h2' | 'h3'
  className?: string
}

export async function CourseCard({
  course,
  headingLevel: Heading = 'h3',
  className,
}: CourseCardProps) {
  const t = await getTranslations()
  const tags = courseTags(course, {
    audience: {
      students: t('courses.audience.students'),
      adults: t('courses.audience.adults'),
      companies: t('courses.audience.companies'),
    },
    format: { 'in-person': t('courses.format.inPerson'), online: t('courses.format.online') },
    voucher: t('courses.voucher'),
  })

  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      <div className={styles.art}>
        <Halftone pattern="course-card" />
        <Sticker topic={course.topic} sizes="186px" className={styles.sticker} />
        {course.level && (
          <CountBubble
            size="small"
            number={course.level}
            label={t('common.level')}
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
        {course.startDate && (
          <p className={styles.start}>
            {t('course.startsOn', { date: formatDateLong(course.startDate) })}
          </p>
        )}
        <div className={styles.foot}>
          {typeof course.price === 'number' && (
            <p className={styles.price}>
              {formatPrice(course.price, course.currency ?? 'EUR')}
              {course.priceNote && <span className={styles.note}>{course.priceNote}</span>}
            </p>
          )}
          {course.slug && (
            <span aria-hidden="true" className={styles.enrol}>
              {t('course.enrol')}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
