import { Link } from '@payloadcms/ui'
import type { ListViewServerProps, Where } from 'payload'
import {
  type Grouping,
  audienceLabels,
  categoryLabels,
  courseRow,
  groupCourses,
  groupingLabels,
  groupings,
} from '@/lib/admin-courses'
import type { SiteCourse } from '@/lib/course-state'
import { courseAudiences, courseCategoryValues } from '@/lib/courses'
import { startOfTodayInSofia } from '@/lib/format'
import { CourseGroups } from './CourseGroups'
import { NavSelect } from './NavSelect'
import { SearchIcon, listParams } from './shared'
import styles from './list.module.css'

// «Admin · 02 Езикови курсове · Курсове» (356:100): the courses of a programme branch (the menu's
// filter in the address), grouped (by language for the language courses), with each course's
// shown group: its start, its free seats and its price from «Цени». One card at the full height.

export async function CoursesList({ payload, searchParams }: ListViewServerProps) {
  const admin = payload.config.routes.admin
  const params = listParams(searchParams)
  const category = courseCategoryValues.find((value) => value === params.where.category)
  const voucher = params.where.voucherEligible === 'true'
  const audience = courseAudiences.find((value) => value === params.get('aud'))
  const query = params.get('q').trim()

  const branch = voucher ? 'Ваучери' : category ? categoryLabels[category] : 'Всички курсове'
  const fallback: Grouping = category === 'languages' ? 'language' : category ? 'none' : 'category'
  const grouping = groupings.find((value) => value === params.get('group')) ?? fallback

  const where: Where[] = [
    ...(category ? [{ category: { equals: category } }] : []),
    ...(voucher ? [{ voucherEligible: { equals: true } }] : []),
    ...(audience ? [{ audience: { equals: audience } }] : []),
    ...(query ? [{ title: { like: query } }] : []),
  ]
  const { docs } = await payload.find({
    collection: 'courses',
    where: { and: where },
    locale: 'bg',
    depth: 0,
    draft: true,
    joins: false,
    sort: 'title',
    pagination: false,
  })
  const ids = docs.map((course) => course.id)
  const of = { course: { in: ids } }
  const [groups, prices] = ids.length
    ? await Promise.all([
        payload.find({
          collection: 'groups',
          where: of,
          locale: 'bg',
          depth: 0,
          pagination: false,
        }),
        payload.find({
          collection: 'prices',
          where: of,
          locale: 'bg',
          depth: 0,
          pagination: false,
        }),
      ])
    : [{ docs: [] }, { docs: [] }]
  const today = startOfTodayInSofia()
  const courses = docs.map((course) => ({
    ...course,
    groups: groups.docs.filter((group) => group.course === course.id),
    prices: prices.docs.filter((price) => price.course === course.id),
  })) as (SiteCourse & { _status?: string | null })[]
  const rows = groupCourses(courses, grouping, (course) => courseRow(course, today))

  // The audiences this branch has courses for (the chips), whatever chip is on.
  const audiences = (['adults', 'students', 'companies'] as const).filter(
    (value) => value === audience || courses.some((course) => course.audience === value),
  )
  const groupedBy: Record<Grouping, string> = {
    language: ' · групирани по език',
    category: ' · групирани по програма',
    audience: ' · групирани по аудитория',
    none: '',
  }

  return (
    <div className={styles.screen} data-admin="list">
      <header className={styles.header}>
        <div className={styles.titles}>
          <h1 className={styles.title}>Курсове</h1>
          <p className={styles.subtitle}>
            {branch}
            {groupedBy[grouping]}
          </p>
        </div>
        <form className={styles.search} role="search" action={`${admin}/collections/courses`}>
          {params.hidden(['q'])}
          <SearchIcon />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Търси по заглавие…"
            aria-label="Търси по заглавие"
          />
        </form>
        <Link href={`${admin}/collections/courses/create`} className={styles.primary}>
          + Нов курс
        </Link>
      </header>

      <div className={styles.filters}>
        <Link
          href={params.href({ aud: undefined })}
          className={styles.chip}
          aria-current={audience ? undefined : 'true'}
        >
          Всички
        </Link>
        {audiences.map((value) => (
          <Link
            key={value}
            href={params.href({ aud: value })}
            className={styles.chip}
            aria-current={audience === value ? 'true' : undefined}
          >
            {audienceLabels[value]}
          </Link>
        ))}
        <span className={styles.spacer} />
        <NavSelect
          id="group-by"
          label="Групирай по"
          value={grouping}
          options={groupings
            // The branch itself is one programme: grouping by it would make one group.
            .filter((value) => value !== 'category' || !category)
            .map((value) => ({ value, label: groupingLabels[value] }))}
          hrefTemplate={params.href({ group: '{value}' })}
        />
      </div>

      <div className={styles.card} data-admin="card">
        <CourseGroups
          groups={rows}
          editBase={`${admin}/collections/courses`}
          empty={query ? `Няма курс с «${query}» в заглавието.` : 'Тук още няма курсове.'}
        />
      </div>
    </div>
  )
}

export default CoursesList
