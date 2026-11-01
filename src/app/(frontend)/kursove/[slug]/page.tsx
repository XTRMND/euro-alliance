import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { CourseCard } from '@/components/cards/CourseCard'
import { CourseCarousel } from '@/components/courses/CourseCarousel'
import { CourseDetails } from '@/components/courses/CourseDetails'
import { CourseHero } from '@/components/courses/CourseHero'
import { EnrolBar } from '@/components/courses/EnrolBar'
import { EnrolButton } from '@/components/courses/EnrolButton'
import { TrackCourseView } from '@/components/courses/TrackCourseView'
import { InquiryBand } from '@/components/shell/InquiryBand'
import { Button } from '@/components/ui/Button'
import { getCourse, getRelatedCourses } from '@/lib/cms'
import { courseState } from '@/lib/course-state'
import { courseTags } from '@/lib/courses'
import { formatPrice, startOfTodayInSofia } from '@/lib/format'
import { anchors, routes } from '@/lib/routes'
import styles from './page.module.css'

// Course (81:1226 / 117:895), in the states of board 126:1940 (src/lib/course-state.ts). The
// enrolment section with the contact wizard (91:1462) arrives with the wizard in PR 11; until
// then «Запиши се» opens the wizard's page with the course preselected.

export async function generateMetadata({
  params,
}: PageProps<'/kursove/[slug]'>): Promise<Metadata> {
  const course = await getCourse((await params).slug)
  if (!course) return {}
  return { title: course.title, description: course.description ?? undefined }
}

export default async function CoursePage({ params }: PageProps<'/kursove/[slug]'>) {
  const { slug } = await params
  const course = await getCourse(slug)
  if (!course) notFound()

  const [related, t] = await Promise.all([getRelatedCourses(course), getTranslations()])
  const state = courseState(course, startOfTodayInSofia())
  const closed = state.enrolment === 'closed'
  const voucher = state.pricing === 'voucher'

  const audience = course.audience ? t(`courses.audience.${course.audience}`) : undefined
  const format =
    course.format &&
    t(course.format === 'online' ? 'courses.format.online' : 'courses.format.inPerson')
  const tags = courseTags(course, {
    audience: {
      students: t('courses.audience.students'),
      adults: t('courses.audience.adults'),
      companies: t('courses.audience.companies'),
    },
    format: { 'in-person': t('courses.format.inPerson'), online: t('courses.format.online') },
    voucher: t('courses.voucher'),
  })
  // «Провери нивото си»: the certificates section of the course's language page, where one exists.
  const levelCheckHref =
    course.language &&
    (course.audience === 'students' ||
      (course.audience === 'adults' && course.language !== 'russian'))
      ? `${routes.languageProgram(course.language, course.audience as 'students')}#${anchors.certificates}`
      : undefined

  const enrol = (className?: string) =>
    closed ? (
      <EnrolButton
        href={routes.enrol(slug)}
        label={t('course.notify')}
        event={null}
        variant="secondary"
        className={className}
      />
    ) : (
      <EnrolButton
        href={routes.enrol(slug, voucher)}
        label={voucher ? t('course.enrolVoucher') : t('course.enrol')}
        event={{
          course: slug,
          language: course.language ?? undefined,
          audience: course.audience ?? undefined,
          level: course.level ?? undefined,
        }}
        className={className}
      />
    )

  return (
    <>
      <TrackCourseView
        course={slug}
        language={course.language ?? undefined}
        audience={course.audience ?? undefined}
        level={course.level ?? undefined}
      />
      <CourseHero
        breadcrumb={[
          { label: t('courses.breadcrumb'), href: routes.courses() },
          { label: course.title },
        ]}
        tags={tags}
        title={course.title}
        level={course.level}
        levelLabel={t('common.level')}
        description={course.description}
        topic={course.topic}
        enrol={closed ? null : enrol()}
        ask={
          <Button href={routes.enrol(slug)} variant="link">
            {t('course.ask')}
          </Button>
        }
      />
      <div className={styles.content}>
        <CourseDetails
          course={course}
          state={state}
          participants={[audience, course.audienceNote].filter(Boolean).join(' ') || undefined}
          format={format || undefined}
          levelCheckHref={levelCheckHref}
          action={enrol()}
        />
      </div>
      {related.length > 0 && (
        <CourseCarousel
          title={t('course.related')}
          all={{ href: routes.courses(), label: t('course.allCourses') }}
          labels={{ previous: t('course.previous'), next: t('course.next') }}
          cards={related.map((item) => (
            <CourseCard key={item.id} course={item} />
          ))}
        />
      )}
      <InquiryBand />
      <EnrolBar
        price={
          state.pricing === 'none'
            ? undefined
            : formatPrice(course.price!, course.currency ?? 'EUR')
        }
        note={closed ? t('course.closedNote') : course.priceNote}
        action={enrol()}
      />
    </>
  )
}
