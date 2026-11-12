import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { CourseCard } from '@/components/cards/CourseCard'
import { CourseCarousel } from '@/components/courses/CourseCarousel'
import { CourseDetails } from '@/components/courses/CourseDetails'
import { CourseHero } from '@/components/courses/CourseHero'
import { EnrolBar } from '@/components/courses/EnrolBar'
import { EnrolButton } from '@/components/courses/EnrolButton'
import { EnrolSection, enrolAnchor } from '@/components/courses/EnrolSection'
import { TrackCourseView } from '@/components/courses/TrackCourseView'
import { InquiryBand } from '@/components/shell/InquiryBand'
import { Button } from '@/components/ui/Button'
import { getCourse, getOffices, getRelatedCourses } from '@/lib/cms'
import { CourseGroups } from '@/components/courses/CourseGroups'
import { courseState, currentGroups } from '@/lib/course-state'
import { courseTags } from '@/lib/courses'
import { formatDateLong, formatPrice, startOfTodayInSofia } from '@/lib/format'
import { resolvePrice } from '@/lib/price'
import { anchors, routes } from '@/lib/routes'
import type { Price } from '@/payload-types'
import styles from './page.module.css'
import { pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { courseLd } from '@/lib/structured-data'

// Course (81:1226 / 117:895), in the states of board 126:1940 (src/lib/course-state.ts), with
// «Запишете се» (91:1462): the contact wizard at Step 2 with the course chosen; «Попитайте за
// записване» when the course is running or has no date. The enrol buttons scroll to it. A course
// with more than one upcoming or running group lists them under the ticket (not in Figma).

export async function generateMetadata({
  params,
}: PageProps<'/kursove/[slug]'>): Promise<Metadata> {
  const course = await getCourse((await params).slug)
  if (!course) return {}
  return pageMetadata({
    title: course.title,
    description: course.description,
    path: routes.course(course.slug ?? (await params).slug),
    meta: course.meta,
  })
}

export default async function CoursePage({ params }: PageProps<'/kursove/[slug]'>) {
  const { slug } = await params
  const course = await getCourse(slug)
  if (!course) notFound()

  const [related, offices, t] = await Promise.all([
    getRelatedCourses(course),
    getOffices(),
    getTranslations(),
  ])
  const today = startOfTodayInSofia()
  const state = courseState(course, today)
  const closed = state.enrolment === 'inquiry'
  const voucher = state.pricing === 'voucher'
  const groups = currentGroups(course, today)
  // «495 € промоция», in the list of groups.
  const priceLine = (price?: Price) =>
    price
      ? [formatPrice(price.price, price.currency), price.label].filter(Boolean).join(' ')
      : undefined
  const formatLabel = (value?: string | null) =>
    value ? t(value === 'online' ? 'courses.format.online' : 'courses.format.inPerson') : undefined

  const audience = course.audience ? t(`courses.audience.${course.audience}`) : undefined
  const format = formatLabel(state.group?.format ?? course.format)
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
        href={`#${enrolAnchor}`}
        label={
          state.status === 'upcoming' && state.seats === 0
            ? t('course.notify')
            : t('course.inquire')
        }
        event={null}
        variant="secondary"
        className={className}
      />
    ) : (
      <EnrolButton
        href={`#${enrolAnchor}`}
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
      <JsonLd data={courseLd(course, today)} />
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
        levelLabel={t(course.levelUnit === 'grade' ? 'common.grade' : 'common.level')}
        description={course.description}
        topic={course.topic}
        enrol={closed ? null : enrol()}
        ask={
          <Button href={`#${enrolAnchor}`} variant="link">
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
        {groups.length > 1 && (
          <CourseGroups
            title={t('course.groups')}
            groups={groups.map(({ group, status }) => ({
              id: String(group.id),
              label: group.name,
              start:
                status === 'running'
                  ? t('course.status.runningSince', { date: formatDateLong(group.start) })
                  : t('course.startsOn', { date: formatDateLong(group.start) }),
              details: [
                [group.days, group.hours].filter(Boolean).join(' '),
                formatLabel(group.format),
                typeof group.office === 'object' ? group.office?.name : undefined,
                priceLine(resolvePrice(course.prices, group)),
              ].filter((detail): detail is string => Boolean(detail)),
            }))}
          />
        )}
        <EnrolSection
          title={closed ? t('course.inquireTitle') : undefined}
          course={course}
          office={offices.find((office) => office.role === 'courses')}
          path={routes.course(slug)}
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
          state.pricing === 'free'
            ? t('course.free')
            : state.price
              ? formatPrice(state.price.price, state.price.currency)
              : state.status === 'none'
                ? t('course.askPrice')
                : undefined
        }
        note={
          state.status === 'upcoming' && state.seats === 0
            ? t('course.closedNote')
            : state.status === 'running'
              ? t('course.status.running')
              : state.price?.label
        }
        action={enrol()}
      />
    </>
  )
}
