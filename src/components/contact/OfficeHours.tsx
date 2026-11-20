import { getLocale, getTranslations } from 'next-intl/server'
import {
  activeHours,
  formatLine,
  type HoursLabels,
  hoursLines,
  type HoursRow,
  hoursSummary,
  seasonDates,
  type OfficeHours as Hours,
  seasonOf,
  validRows,
  weekdays,
} from '@/lib/office-hours'
import styles from './OfficeHours.module.css'

// An office's working hours (Trello #10), wherever the office is shown. `full` lists the regular
// week and the season's week with its dates (the Office card); otherwise only the week that
// applies today, which changes by itself on the season's first and last day. An office without
// hours shows nothing. `ticket` is the Office card's stub (docs/contact-offices.md § 3): the weeks
// side by side, the days in a muted column of their own, days off muted too.

type Translator = Awaited<ReturnType<typeof getTranslations<'hours'>>>

export function hoursLabels(t: Translator): HoursLabels {
  return {
    days: Object.fromEntries(weekdays.map((day) => [day, t(`days.${day}`)])) as HoursLabels['days'],
    and: t('and'),
    closedOne: t('closedOne'),
    closedMany: t('closedMany'),
  }
}

/** Today's week in one line («пон–чет 8:30–18:00 · пет …»), for the tightest places. */
export async function officeHoursSummary(hours: Hours | null | undefined): Promise<string> {
  return hoursSummary(activeHours(hours).rows, hoursLabels(await getTranslations('hours')))
}

export async function OfficeHours({
  hours,
  full = false,
  ticket = false,
  className,
}: {
  hours: Hours | null | undefined
  full?: boolean
  ticket?: boolean
  className?: string
}) {
  const [t, locale] = await Promise.all([getTranslations('hours'), getLocale()])
  const labels = hoursLabels(t)
  const season = seasonOf(hours)
  const active = activeHours(hours)
  const seasonTitle = (range: NonNullable<typeof season>) => t('season', seasonDates(range, locale))

  const weeks: { title: string; rows: HoursRow[] }[] = full
    ? [
        { title: t('title'), rows: validRows(hours?.regular) },
        ...(season ? [{ title: seasonTitle(season), rows: validRows(hours?.seasonal?.rows) }] : []),
      ]
    : [{ title: active.season ? seasonTitle(active.season) : t('title'), rows: active.rows }]
  const shown = weeks.filter((week) => week.rows.length > 0)
  if (shown.length === 0) return null

  return (
    <div className={[styles.hours, ticket && styles.ticket, className].filter(Boolean).join(' ')}>
      {shown.map((week) => (
        <div key={week.title} className={styles.week}>
          <p className={styles.title}>{week.title}</p>
          <dl className={styles.lines}>
            {hoursLines(week.rows)
              .map((line) => ({ ...formatLine(line, labels), closed: !line.opens }))
              .map(({ days, hours: time, closed }) => (
                <div key={days} className={styles.line}>
                  <dt>{days}</dt>
                  <dd className={closed ? styles.closed : undefined}>{time}</dd>
                </div>
              ))}
          </dl>
        </div>
      ))}
    </div>
  )
}
