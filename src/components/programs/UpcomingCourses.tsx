import { CourseCard } from '@/components/cards/CourseCard'
import { SectionHeading } from '@/components/patterns/SectionHeading'
import { CourseGrid } from '@/components/patterns/CourseGrid'
import { Button } from '@/components/ui/Button'
import { getListedCourses } from '@/lib/cms'
import { courseFiltersQuery } from '@/lib/course-filters'
import { programCourseFilters, upcomingId } from '@/lib/programs'
import { routes } from '@/lib/routes'
import type { Course, Program } from '@/payload-types'
import styles from './UpcomingCourses.module.css'

// «Курсове по …» on a program page (130:1993, 236:3479): every published course of the program
// (src/lib/programs.ts) with its state, upcoming first, then running, then without a date
// (src/lib/course-state.ts; «Предстоящи курсове по …» until 02.11.2026), and a link to them in the
// listing. Without a heading or without courses the section isn't shown.

export type Upcoming = { courses: Course[]; listing: string; shown: boolean }

export async function loadUpcoming(program: Program): Promise<Upcoming> {
  const filters = programCourseFilters(program)
  const listing =
    program.upcoming?.linkScope === 'languages'
      ? routes.courses('languages')
      : `${routes.courses()}${courseFiltersQuery(filters)}`
  if (!program.upcoming?.heading) return { courses: [], listing, shown: false }
  const { docs } = await getListedCourses(filters)
  return { courses: docs, listing, shown: docs.length > 0 }
}

export function UpcomingCourses({ program, upcoming }: { program: Program; upcoming: Upcoming }) {
  if (!upcoming.shown || !program.upcoming?.heading) return null
  return (
    <section id={upcomingId} className={styles.upcoming} aria-labelledby={`${upcomingId}-title`}>
      <SectionHeading id={`${upcomingId}-title`} title={program.upcoming.heading} />
      <CourseGrid>
        {upcoming.courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </CourseGrid>
      {program.upcoming.linkLabel && (
        <Button href={upcoming.listing} variant="link" className={styles.all}>
          {program.upcoming.linkLabel}
        </Button>
      )}
    </section>
  )
}
