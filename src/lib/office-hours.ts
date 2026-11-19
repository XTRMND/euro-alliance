// An office's working hours (Trello #10): the regular week and, optionally, a season of the year
// with its own week («лятно работно време», 15 юни – 1 септември), which takes over between its
// dates by itself. Rows say when the office is open; a day no row covers is a day off.

export const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type Weekday = (typeof weekdays)[number]

export type HoursRow = {
  from: Weekday
  /** The last day of the row; empty for a single day. */
  to?: Weekday | null
  /** «08:30» */
  opens: string
  closes: string
}

export type Season = { startDay: number; startMonth: number; endDay: number; endMonth: number }

/** As the CMS holds them: the months are select values («6»). */
export type OfficeHours = {
  regular?: HoursRow[] | null
  seasonal?:
    (Partial<{ [K in keyof Season]: number | string | null }> & { rows?: HoursRow[] | null }) | null
}

export const timePattern = /^([01]?\d|2[0-3]):[0-5]\d$/

/** «08:30» → «8:30», as the client writes hours. */
export const formatTime = (time: string) => time.replace(/^0(?=\d:)/, '')

/** The days a row covers, in the week's order (a row may run over the weekend: сб → пн). */
export function daysOf(row: Pick<HoursRow, 'from' | 'to'>): Weekday[] {
  const start = weekdays.indexOf(row.from)
  const end = row.to ? weekdays.indexOf(row.to) : start
  if (start < 0 || end < 0) return []
  const length = ((end - start + 7) % 7) + 1
  return Array.from({ length }, (_, i) => weekdays[(start + i) % 7])
}

/** The season's dates, when all four are set and are real days. */
export function seasonOf(hours: OfficeHours | null | undefined): Season | null {
  const seasonal = hours?.seasonal
  const [startDay, startMonth, endDay, endMonth] = [
    seasonal?.startDay,
    seasonal?.startMonth,
    seasonal?.endDay,
    seasonal?.endMonth,
  ].map((value) => Number(value ?? 0))
  const real = (day: number, month: number) =>
    Number.isInteger(day) &&
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= 31
  if (!real(startDay, startMonth) || !real(endDay, endMonth)) return null
  if (validRows(seasonal?.rows).length === 0) return null
  return { startDay, startMonth, endDay, endMonth }
}

/** Month and day in Sofia, as one number: 15 June → 615. */
function sofiaMonthDay(now: Date): number {
  const [, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Sofia' })
    .format(now)
    .split('-')
    .map(Number)
  return month * 100 + day
}

/** Whether `now` is inside the season, both ends included; a season may run over New Year. */
export function inSeason(season: Season, now = new Date()): boolean {
  const today = sofiaMonthDay(now)
  const start = season.startMonth * 100 + season.startDay
  const end = season.endMonth * 100 + season.endDay
  return start <= end ? today >= start && today <= end : today >= start || today <= end
}

/** The week that applies now: the season's between its dates, the regular one otherwise. */
export function activeHours(
  hours: OfficeHours | null | undefined,
  now = new Date(),
): { rows: HoursRow[]; season: Season | null } {
  const season = seasonOf(hours)
  if (season && inSeason(season, now)) return { rows: validRows(hours!.seasonal!.rows), season }
  return { rows: validRows(hours?.regular), season: null }
}

export function validRows(rows: HoursRow[] | null | undefined): HoursRow[] {
  return (rows ?? []).filter(
    (row) =>
      weekdays.includes(row.from) && timePattern.test(row.opens) && timePattern.test(row.closes),
  )
}

export type HoursLine = { days: Weekday[]; opens?: string; closes?: string }

/**
 * The week as lines: each row, then the days off, neighbours together («съб и нед»). No rows, no
 * lines: an office without hours shows nothing.
 */
export function hoursLines(rows: HoursRow[]): HoursLine[] {
  const open = validRows(rows)
  if (open.length === 0) return []
  const covered = new Set(open.flatMap(daysOf))
  const off: Weekday[][] = []
  for (const day of weekdays) {
    if (covered.has(day)) continue
    const last = off.at(-1)
    if (last && weekdays.indexOf(last.at(-1)!) === weekdays.indexOf(day) - 1) last.push(day)
    else off.push([day])
  }
  return [
    ...open.map((row) => ({ days: daysOf(row), opens: row.opens, closes: row.closes })),
    ...off.map((days) => ({ days })),
  ]
}

export type HoursLabels = {
  days: Record<Weekday, string>
  and: string
  closedOne: string
  closedMany: string
}

/** «пон–чет», «съб и нед», «нед». */
export function formatDays(days: Weekday[], labels: HoursLabels): string {
  const names = days.map((day) => labels.days[day])
  if (names.length <= 1) return names[0] ?? ''
  if (names.length === 2) return `${names[0]} ${labels.and} ${names[1]}`
  return `${names[0]}–${names.at(-1)}`
}

/** A line as shown: «пон–чет» and «8:30–18:00», or «нед» and «почивен ден». */
export function formatLine(line: HoursLine, labels: HoursLabels): { days: string; hours: string } {
  return {
    days: formatDays(line.days, labels),
    hours:
      line.opens && line.closes
        ? `${formatTime(line.opens)}–${formatTime(line.closes)}`
        : line.days.length === 1
          ? labels.closedOne
          : labels.closedMany,
  }
}

/** The week in one line, for tight places: «пон–чет 8:30–18:00 · пет 8:30–17:00 · …». */
export function hoursSummary(rows: HoursRow[], labels: HoursLabels): string {
  return hoursLines(rows)
    .map((line) => formatLine(line, labels))
    .map(({ days, hours }) => `${days} ${hours}`)
    .join(' · ')
}

/** The season's first and last day as written: «15 юни», «1 септември». */
export function seasonDates(season: Season, locale = 'bg'): { from: string; to: string } {
  const format = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' })
  const day = (month: number, date: number) =>
    format.format(new Date(Date.UTC(2024, month - 1, date)))
  return {
    from: day(season.startMonth, season.startDay),
    to: day(season.endMonth, season.endDay),
  }
}

const schemaDays: Record<Weekday, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

const padded = (time: string) => time.padStart(5, '0')
const iso = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

/**
 * schema.org OpeningHoursSpecification: the regular week, and the season's week with the dates
 * of its next occurrence (the one running now, or the one to come).
 */
export function openingHoursSpecification(
  hours: OfficeHours | null | undefined,
  now = new Date(),
): Record<string, unknown>[] | undefined {
  const spec = (row: HoursRow, validity: Record<string, string> = {}) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: daysOf(row).map((day) => `https://schema.org/${schemaDays[day]}`),
    opens: padded(row.opens),
    closes: padded(row.closes),
    ...validity,
  })
  const regular = validRows(hours?.regular).map((row) => spec(row))
  const season = seasonOf(hours)
  if (!season) return regular.length ? regular : undefined

  const year = Number(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Sofia', year: 'numeric' }).format(now),
  )
  const today = sofiaMonthDay(now)
  const start = season.startMonth * 100 + season.startDay
  const end = season.endMonth * 100 + season.endDay
  const wraps = start > end
  // The year the season (running or next) starts in.
  const startYear = wraps ? (today <= end ? year - 1 : year) : today > end ? year + 1 : year
  const validity = {
    validFrom: iso(startYear, season.startMonth, season.startDay),
    validThrough: iso(wraps ? startYear + 1 : startYear, season.endMonth, season.endDay),
  }
  return [...regular, ...validRows(hours!.seasonal!.rows).map((row) => spec(row, validity))]
}
