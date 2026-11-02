import type { Course } from '@/payload-types'

// The state of a course, from its groups (the user's model of 02.11.2026; the board of states is
// 126:1940). A course is what the centre teaches; its dates belong to its groups:
// - a group whose start is today or later is upcoming: its date and «Запиши се»;
// - a group that has started is running («В ход») until its end date; without an end date it
//   stays running (the old data has none, and none is guessed); people may ask to join it;
// - a group whose end date has passed is over and isn't shown;
// - a course with no upcoming or running group has no date: «Няма насрочена дата».
// The group a card or a page shows is the soonest upcoming one, else the latest to have started.
// Enrolment is open only for an upcoming group with free seats (or no seat count); otherwise the
// button asks about joining. Few seats: 1 or 2 free, highlighted. Price: a voucher course shows
// the voucher's value; a regular price above the price makes a promotion (struck through).

export const fewSeatsBelow = 3

export type CourseGroup = NonNullable<Course['groups']>[number]

export type GroupStatus = 'upcoming' | 'running' | 'ended'

export type CourseStatus = 'upcoming' | 'running' | 'none'

export const courseStatuses = ['upcoming', 'running', 'none'] as const

type StatefulCourse = Pick<Course, 'groups' | 'voucherEligible'>

/** `today` is midnight in Bulgaria as an ISO string (startOfTodayInSofia). */
export function groupStatus(
  group: Pick<CourseGroup, 'startDate' | 'endDate'>,
  today: string,
): GroupStatus {
  if (group.startDate >= today) return 'upcoming'
  if (group.endDate && group.endDate < today) return 'ended'
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
    .sort((a, b) => a.group.startDate.localeCompare(b.group.startDate))
  const running = groups
    .filter((item) => item.status === 'running')
    .sort((a, b) => b.group.startDate.localeCompare(a.group.startDate))
  return [...upcoming, ...running] as { group: CourseGroup; status: 'upcoming' | 'running' }[]
}

export type CourseState = {
  status: CourseStatus
  /** The group the card, the ticket and the enrol bar show. */
  group?: CourseGroup
  /** Open: an upcoming group with seats, «Запиши се». Otherwise an inquiry about joining. */
  enrolment: 'open' | 'inquiry'
  pricing: 'voucher' | 'promotion' | 'regular' | 'none'
  /** Free seats when the CMS has a number. */
  seats?: number
  fewSeats: boolean
}

export function courseState(course: StatefulCourse, today: string): CourseState {
  const first = currentGroups(course, today)[0]
  const group = first?.group
  const status: CourseStatus = first?.status ?? 'none'
  const seats = typeof group?.seats === 'number' ? group.seats : undefined
  const hasPrice = typeof group?.price === 'number'

  return {
    status,
    group,
    enrolment: status === 'upcoming' && seats !== 0 ? 'open' : 'inquiry',
    pricing: !hasPrice
      ? 'none'
      : course.voucherEligible
        ? 'voucher'
        : typeof group?.regularPrice === 'number' && group.regularPrice > group.price!
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
  if (a.state.status === 'upcoming')
    return a.state.group!.startDate.localeCompare(b.state.group!.startDate)
  if (a.state.status === 'running')
    return b.state.group!.startDate.localeCompare(a.state.group!.startDate)
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
