import { CourseCard } from '@/components/cards/CourseCard'
import { SectionHeading } from '@/components/patterns/SectionHeading'
import { SwipeRow } from '@/components/patterns/SwipeRow'
import { Button } from '@/components/ui/Button'
import { getListedCourses } from '@/lib/cms'
import { courseFiltersQuery } from '@/lib/course-filters'
import { programCourseFilters, upcomingId } from '@/lib/programs'
import { routes } from '@/lib/routes'
import type { Course, Program } from '@/payload-types'
import styles from './UpcomingCourses.module.css'

// «Предстоящи курсове» on a program page (130:1993, 236:3479): up to four published courses of the
// program (src/lib/programs.ts), soonest first, and a link to all of them in the listing. Without
// a heading or without courses the section isn't shown.

export type Upcoming = { courses: Course[]; listing: string; shown: boolean }

export async function loadUpcoming(program: Program): Promise<Upcoming> {
  const filters = programCourseFilters(program)
  const listing = `${routes.courses()}${courseFiltersQuery(filters)}`
  if (!program.upcoming?.heading) return { courses: [], listing, shown: false }
  const { docs } = await getListedCourses(filters)
  return { courses: docs.slice(0, 4), listing, shown: docs.length > 0 }
}

export function UpcomingCourses({ program, upcoming }: { program: Program; upcoming: Upcoming }) {
  if (!upcoming.shown || !program.upcoming?.heading) return null
  return (
    <section id={upcomingId} className={styles.upcoming} aria-labelledby={`${upcomingId}-title`}>
      <SectionHeading id={`${upcomingId}-title`} title={program.upcoming.heading} />
      <SwipeRow columns={4} itemWidth={280} className={styles.courses}>
        {upcoming.courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </SwipeRow>
      {program.upcoming.linkLabel && (
        <Button href={upcoming.listing} variant="link" className={styles.all}>
          {program.upcoming.linkLabel}
        </Button>
      )}
    </section>
  )
}
