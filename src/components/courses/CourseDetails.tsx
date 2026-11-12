import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { Ticket, ticket } from '@/components/patterns/Ticket'
import { Button } from '@/components/ui/Button'
import type { CourseState } from '@/lib/course-state'
import { formatDateLong, formatPrice } from '@/lib/format'
import type { SiteCourse } from '@/lib/course-state'
import type { Office } from '@/payload-types'
import styles from './CourseDetails.module.css'

// Details ticket (91:1412 / 117:956): three groups of facts (Кога, Къде и за кого, Какво
// получавате) and the stub with the price and enrolment, in the states of board 126:1940. The
// dates, place and price are the shown group's (src/lib/course-state.ts): the soonest upcoming
// one, else the latest running; a course without one says «Няма насрочена дата». Every empty
// field is left out, and a group with no fields isn't shown (State: Липсващи полета).

type CourseDetailsProps = {
  course: SiteCourse
  state: CourseState
  /** The audience as on the card, e.g. «Ученици 12 клас». */
  participants?: string
  format?: string
  /** «Провери нивото си»: the certificates section of the course's language page. */
  levelCheckHref?: string
  /** The enrol or notify button (it tracks its clicks). */
  action: ReactNode
}

type Field = { label: string; value?: ReactNode }

// The ticket's shell is the Ticket pattern; this fills its groups and its stub.

export async function CourseDetails({
  course,
  state,
  participants,
  format,
  levelCheckHref,
  action,
}: CourseDetailsProps) {
  const t = await getTranslations('course')
  const group = state.group
  const price = state.price
  const currency = price?.currency ?? 'EUR'
  const closed = state.enrolment === 'inquiry'
  const office = typeof group?.office === 'object' ? (group.office as Office | null) : null

  const groups: { title: string; fields: Field[] }[] = [
    {
      title: t('when'),
      fields: [
        {
          label: t('field.start'),
          value: group
            ? state.status === 'running'
              ? t('status.runningSince', { date: formatDateLong(group.start) })
              : formatDateLong(group.start)
            : t('status.none'),
        },
        { label: t('field.end'), value: group?.end && formatDateLong(group.end) },
        { label: t('field.days'), value: group?.days },
        { label: t('field.hours'), value: group?.hours },
        { label: t('field.duration'), value: course.duration },
      ],
    },
    {
      title: t('where'),
      fields: [
        { label: t('field.format'), value: format },
        {
          label: t('field.office'),
          value: office && [office.name, office.address].filter(Boolean).join(', '),
        },
        { label: t('field.participants'), value: participants },
      ],
    },
    {
      title: t('what'),
      fields: [
        {
          label: t('field.level'),
          value: (course.levelName || course.level) && (
            <>
              {course.levelName || course.level}
              {levelCheckHref && (
                <Button href={levelCheckHref} variant="link" className={styles.levelCheck}>
                  {t('checkLevel')}
                </Button>
              )}
            </>
          ),
        },
        { label: t('field.program'), value: course.program },
        { label: t('field.document'), value: course.document },
        { label: t('field.included'), value: course.included },
      ],
    },
  ]
  const shown = groups
    .map((group) => ({ ...group, fields: group.fields.filter((field) => field.value) }))
    .filter((group) => group.fields.length > 0)

  const label = price?.label || (state.pricing === 'voucher' ? t('voucherValue') : undefined)
  const note = state.status === 'upcoming' && state.seats === 0 ? t('closedNote') : label

  return (
    <Ticket
      groups={shown}
      stubClassName={styles.stub}
      // Muted only for a full upcoming group; a running group's price still applies to joining it.
      stubProps={{ 'data-closed': (state.status === 'upcoming' && state.seats === 0) || undefined }}
      stub={
        <>
          {state.pricing === 'free' && (
            <>
              <p className={ticket.label}>{t('field.price')}</p>
              <p className={styles.price}>
                <span className={styles.amount}>{t('free')}</span>
              </p>
            </>
          )}
          {state.pricing !== 'none' && state.pricing !== 'free' && (
            <>
              <p className={ticket.label}>{t('field.price')}</p>
              <p className={styles.price}>
                <span className={styles.amount}>{formatPrice(price!.price, currency)}</span>
                {note && <span className={styles.note}>{note}</span>}
              </p>
              {!closed && state.pricing === 'promotion' && (
                <p className={styles.extra}>
                  {t.rich('regularPrice', {
                    price: formatPrice(price!.regularPrice!, currency),
                    old: (chunks) => <s>{chunks}</s>,
                  })}
                </p>
              )}
              {!closed && state.pricing === 'voucher' && (
                <p className={styles.extra}>{t('voucherNote')}</p>
              )}
              {price?.note && <p className={styles.extra}>{price.note}</p>}
            </>
          )}
          {state.status === 'none' && state.pricing === 'none' && (
            <>
              <p className={ticket.label}>{t('field.price')}</p>
              <p className={styles.price}>
                <span className={styles.amount}>{t('askPrice')}</span>
                <span className={styles.note}>{t('askPriceNote')}</span>
              </p>
            </>
          )}
          {action}
          {closed && state.seats === 0 && <p className={styles.seats}>{t('noSeats')}</p>}
          {!closed && state.seats !== undefined && state.seats > 0 && (
            <p className={[styles.seats, state.fewSeats && styles.few].filter(Boolean).join(' ')}>
              {state.fewSeats
                ? t('fewSeats', { count: state.seats })
                : t('seats', { count: state.seats })}
            </p>
          )}
        </>
      }
    />
  )
}
