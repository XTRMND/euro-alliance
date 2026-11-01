// The states of a course page (Курс / Състояния, 126:1940), derived from the course's fields.
// The rules (listed in PR 10 for the user to confirm):
// - Enrolment is closed when the course has started (its start date is before today in
//   Bulgaria) or has no free seats (seats = 0). Closed: the price is muted, «записването
//   приключи», and the button asks to be told about the next course.
// - Few seats: 1 or 2 free seats, and the count is highlighted («Остават само 2 места»).
// - Price: a voucher course shows its price as the voucher's value and enrols through the
//   voucher step; otherwise a regular price above the price makes it a promotion (the regular
//   price is shown struck through); otherwise the price is the regular one. No price, no price.
// - Seats are shown only when the CMS has a number.

export const fewSeatsBelow = 3

type StatefulCourse = {
  startDate?: string | null
  seats?: number | null
  price?: number | null
  regularPrice?: number | null
  voucherEligible?: boolean | null
}

export type CourseState = {
  enrolment: 'open' | 'closed'
  pricing: 'voucher' | 'promotion' | 'regular' | 'none'
  /** Free seats when the CMS has a number. */
  seats?: number
  fewSeats: boolean
}

/** `today` is midnight in Bulgaria as an ISO string (startOfTodayInSofia). */
export function courseState(course: StatefulCourse, today: string): CourseState {
  const started = Boolean(course.startDate && course.startDate < today)
  const seats = typeof course.seats === 'number' ? course.seats : undefined
  const full = seats === 0
  const hasPrice = typeof course.price === 'number'

  return {
    enrolment: started || full ? 'closed' : 'open',
    pricing: !hasPrice
      ? 'none'
      : course.voucherEligible
        ? 'voucher'
        : typeof course.regularPrice === 'number' && course.regularPrice > course.price!
          ? 'promotion'
          : 'regular',
    seats,
    fewSeats: !started && seats !== undefined && seats > 0 && seats < fewSeatsBelow,
  }
}
