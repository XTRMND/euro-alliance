import { getTranslations } from 'next-intl/server'
import { CourseCard } from '@/components/cards/CourseCard'
import { withStates } from '@/lib/course-state'
import { matchesUpcomingFilter, upcomingFilters } from '@/lib/courses'
import { startOfTodayInSofia } from '@/lib/format'
import { RevealOnScroll } from '@/components/visuals/RevealOnScroll'
import { routes } from '@/lib/routes'
import type { SiteCourse } from '@/lib/course-state'
import landing from '@/styles/landing.module.css'
import { SectionHead } from './SectionHead'
import { UpcomingTabs } from './UpcomingTabs'
import styles from './UpcomingCourses.module.css'

// «Предстоящи курсове» (48:227 / 115:439): the courses with an upcoming group (the soonest
// first), then those running (src/lib/course-state.ts), four at a time, with tabs for students,
// adults, voucher and online courses. Never a single card (the user, 02.11.2026): a tab with
// fewer than two courses isn't shown, and with fewer than two the section isn't either.

export const upcomingPerTab = 4

/**
 * The section's courses: upcoming, then running, in the list order; none when fewer than two.
 * The page asks first, so a hidden section leaves no deferred wrapper (its stand-in height
 * collapsing as it nears the screen shifted the inquiry band: CLS).
 */
export function upcomingCourses(courses: SiteCourse[], today: string): SiteCourse[] {
  const dated = withStates(courses, today)
    .filter(({ state }) => state.status !== 'none')
    .map(({ course }) => course)
  return dated.length < 2 ? [] : dated
}

export async function UpcomingCourses({
  title,
  courses,
}: {
  title: string
  courses: SiteCourse[]
}) {
  const dated = upcomingCourses(courses, startOfTodayInSofia())
  if (dated.length === 0) return null
  const t = await getTranslations('home')

  const items = dated.map((course) => ({
    id: course.id,
    filters: upcomingFilters.filter((filter) => matchesUpcomingFilter(course, filter)),
    card: <CourseCard course={course} />,
  }))
  const tabs = upcomingFilters
    .filter((filter) => items.filter((item) => item.filters.includes(filter)).length > 1)
    .map((filter) => ({ filter, label: t(`upcoming.filters.${filter}`) }))

  return (
    <section className={styles.section} aria-labelledby="upcoming-title">
      <RevealOnScroll />
      <div className={[styles.inner, landing.revealItems].join(' ')}>
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
