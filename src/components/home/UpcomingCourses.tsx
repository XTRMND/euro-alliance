import { getTranslations } from 'next-intl/server'
import { CourseCard } from '@/components/cards/CourseCard'
import { matchesUpcomingFilter, upcomingFilters } from '@/lib/courses'
import { routes } from '@/lib/routes'
import type { Course } from '@/payload-types'
import { SectionHead } from './SectionHead'
import { UpcomingTabs } from './UpcomingTabs'
import styles from './UpcomingCourses.module.css'

// «Предстоящи курсове» (48:227 / 115:439): published courses starting from today, soonest first,
// four at a time, with tabs for students, adults, voucher and online courses. A tab with no
// courses isn't shown, and with no upcoming courses the section isn't either.

export const upcomingPerTab = 4

export async function UpcomingCourses({ title, courses }: { title: string; courses: Course[] }) {
  if (courses.length === 0) return null
  const t = await getTranslations('home')

  const items = courses.map((course) => ({
    id: course.id,
    filters: upcomingFilters.filter((filter) => matchesUpcomingFilter(course, filter)),
    card: <CourseCard course={course} />,
  }))
  const tabs = upcomingFilters
    .filter((filter) => items.some((item) => item.filters.includes(filter)))
    .map((filter) => ({ filter, label: t(`upcoming.filters.${filter}`) }))

  return (
    <section className={styles.section} aria-labelledby="upcoming-title">
      <div className={styles.inner}>
        <SectionHead
          title={title}
          id="upcoming-title"
          link={{
            href: routes.courses(),
            label: (long) => t.rich('allCourses', { long }),
          }}
        />
        <UpcomingTabs
          label={t('upcoming.filterLabel')}
          tabs={tabs.length > 1 ? tabs : []}
          items={items}
          perTab={upcomingPerTab}
        />
      </div>
    </section>
  )
}
