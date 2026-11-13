import type { Course, Group, Price } from '@/payload-types'
import { resolvePrice } from './price'

// The state of a course, from its groups (the user's model of 02.11.2026; the board of states is
// 126:1940). A course is what the centre teaches; its dates belong to its groups:
// - a group whose start is today or later is upcoming: its date and «Запиши се»;
// - a group that has started is running («В ход») until its end date; without an end date it
//   stays running (the import estimates one for the old groups: scripts/import/old-course.ts);
//   people may ask to join it;
// - a group whose end date has passed is over and isn't shown;
// - a course with no upcoming or running group has no date: «Няма насрочена дата».
// The group a card or a page shows is the soonest upcoming one, else the latest to have started.
// Enrolment is open only for an upcoming group with free seats (or no seat count); otherwise the
// button asks about joining. Few seats: 1 or 2 free, highlighted. Price: a voucher course shows
// the voucher's value; a regular price above the price makes a promotion (struck through). The
// price is the group's own, or else the course's base price (src/lib/price.ts). A free
// course (the farmers' courses) shows «Безплатно» instead of a price, and always an inquiry.

export const fewSeatsBelow = 3

export type CourseGroup = Group

/**
 * A course as the site reads it (src/lib/course-query.ts): its groups, records of the groups
 * collection, as a list. In the admin they're a join field.
 */
export type SiteCourse = Omit<Course, 'groups' | 'prices'> & {
  groups: CourseGroup[]
  /** The course's base price and its groups' own prices (src/lib/price.ts). */
  prices: Price[]
}

export type GroupStatus = 'upcoming' | 'running' | 'ended'

export type CourseStatus = 'upcoming' | 'running' | 'none'

export const courseStatuses = ['upcoming', 'running', 'none'] as const

type StatefulCourse = Pick<SiteCourse, 'groups' | 'voucherEligible' | 'free'> & {
  prices?: Price[] | null
}

/** `today` is midnight in Bulgaria as an ISO string (startOfTodayInSofia). */
export function groupStatus(group: Pick<CourseGroup, 'start' | 'end'>, today: string): GroupStatus {
  if (group.start >= today) return 'upcoming'
  if (group.end && group.end < today) return 'ended'
  return 'running'
}

/** The groups that aren't over: upcoming (soonest first), then running (latest start first). */
export function currentGroups(
  course: StatefulCourse,
  today: string,
): { group: CourseGroup; status: Exclude<GroupStatus, 'ended'> }[] {
  const groups = (course.groups ?? []).map((group) => ({
    group,
    status: groupStatus(group, today),
  }))
  const upcoming = groups
    .filter((item) => item.status === 'upcoming')
    .sort((a, b) => a.group.start.localeCompare(b.group.start))
  const running = groups
    .filter((item) => item.status === 'running')
    .sort((a, b) => b.group.start.localeCompare(a.group.start))
  return [...upcoming, ...running] as { group: CourseGroup; status: 'upcoming' | 'running' }[]
}

export type CourseState = {
  status: CourseStatus
  /** The group the card, the ticket and the enrol bar show. */
  group?: CourseGroup
  /** The price they show: the group's own, or else the course's base price. */
  price?: Price
  /** Open: an upcoming group with seats, «Запиши се». Otherwise an inquiry about joining. */
  enrolment: 'open' | 'inquiry'
  pricing: 'free' | 'voucher' | 'promotion' | 'regular' | 'none'
  /** Free seats when the CMS has a number. */
  seats?: number
  fewSeats: boolean
}

export function courseState(course: StatefulCourse, today: string): CourseState {
  const first = currentGroups(course, today)[0]
  const group = first?.group
  const status: CourseStatus = first?.status ?? 'none'
  const seats = typeof group?.seats === 'number' ? group.seats : undefined
  const price = resolvePrice(course.prices, group)

  return {
    status,
    group,
    price,
    enrolment: !course.free && status === 'upcoming' && seats !== 0 ? 'open' : 'inquiry',
    pricing: course.free
      ? 'free'
      : !price
        ? 'none'
        : course.voucherEligible
          ? 'voucher'
          : typeof price.regularPrice === 'number' && price.regularPrice > price.price
            ? 'promotion'
            : 'regular',
    seats,
    fewSeats: status === 'upcoming' && seats !== undefined && seats > 0 && seats < fewSeatsBelow,
  }
}

const statusRank: Record<CourseStatus, number> = { upcoming: 0, running: 1, none: 2 }

/**
 * The order of every course list: upcoming courses (the soonest group first), then running ones
 * (the latest to have started first), then courses without a date (by title).
 */
export function compareCourses(
  a: { course: Pick<Course, 'title'>; state: CourseState },
  b: { course: Pick<Course, 'title'>; state: CourseState },
): number {
  const rank = statusRank[a.state.status] - statusRank[b.state.status]
  if (rank) return rank
  if (a.state.status === 'upcoming') return a.state.group!.start.localeCompare(b.state.group!.start)
  if (a.state.status === 'running') return b.state.group!.start.localeCompare(a.state.group!.start)
  return a.course.title.localeCompare(b.course.title, 'bg')
}

/** Courses with their states, in the list order. */
export function withStates<C extends StatefulCourse & Pick<Course, 'title'>>(
  courses: C[],
  today: string,
): { course: C; state: CourseState }[] {
  return courses
    .map((course) => ({ course, state: courseState(course, today) }))
    .sort(compareCourses)
}
