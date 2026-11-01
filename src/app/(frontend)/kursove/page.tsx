import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { CourseCard } from '@/components/cards/CourseCard'
import { CourseListing } from '@/components/courses/CourseListing'
import { PageHero } from '@/components/patterns/PageHero'
import { InquiryBand } from '@/components/shell/InquiryBand'
import { getCourseMonths, getListedCourses } from '@/lib/cms'
import { activeFilterCount, parseCourseFilters } from '@/lib/course-filters'
import { courseAudiences, courseCategoryValues, courseFormats } from '@/lib/courses'
import { formatMonth } from '@/lib/format'

// Courses (80:880 / 116:557): the listing with its filters in the URL (src/lib/course-filters.ts).
// The language filter lists the six languages of the Figma filters; БЕЛ courses are found under
// «Езици» and the students audience.

const filterLanguages = ['english', 'german', 'french', 'spanish', 'italian', 'russian'] as const

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('courses')
  return { title: t('title'), description: t('lead') }
}

export default async function CoursesPage({ searchParams }: PageProps<'/kursove'>) {
  const filters = parseCourseFilters(await searchParams)
  const [{ docs, totalDocs }, months, t] = await Promise.all([
    getListedCourses(filters),
    getCourseMonths(),
    getTranslations(),
  ])

  return (
    <>
      <PageHero
        breadcrumb={[{ label: t('courses.breadcrumb') }]}
        title={t('courses.title')}
        highlight={t('courses.titleHighlight')}
        lead={t('courses.lead')}
      />
      <CourseListing
        filters={filters}
        total={totalDocs}
        cards={docs.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
        options={{
          audience: courseAudiences.map((value) => ({
            value,
            label: t(`courses.audience.${value}`),
          })),
          category: courseCategoryValues.map((value) => ({
            value,
            label: t(`courses.category.${value}`),
          })),
          language: filterLanguages.map((value) => ({ value, label: t(`languages.${value}`) })),
          format: courseFormats.map((value) => ({
            value,
            label: t(value === 'online' ? 'courses.format.online' : 'courses.format.inPerson'),
          })),
          months: months.map((value) => ({ value, label: formatMonth(value) })),
        }}
        labels={{
          filtersTitle: t('courses.filters.title'),
          filtersOpen: t('courses.filters.open'),
          filtersSelected: t('courses.filters.selected', { count: activeFilterCount(filters) }),
          audience: t('courses.filters.audience'),
          category: t('courses.filters.category'),
          language: t('courses.filters.language'),
          format: t('courses.filters.format'),
          funding: t('courses.filters.funding'),
          voucher: t('courses.filters.voucher'),
          start: t('courses.filters.start'),
          anyMonth: t('courses.filters.anyMonth'),
          reset: t('courses.filters.reset'),
          resetShort: t('courses.filters.resetShort'),
          apply: t('courses.filters.apply', { count: totalDocs }),
          sortLabel: t('courses.sort.label'),
          sort: { soonest: t('courses.sort.soonest'), price: t('courses.sort.price') },
          count: t('courses.count', { count: totalDocs }),
          showMore: t('courses.showMore'),
          shown: t('courses.shown', { shown: docs.length, total: totalDocs }),
          empty: t('courses.empty'),
        }}
      />
      <InquiryBand />
    </>
  )
}
