import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import type { CourseState } from '@/lib/course-state'
import { formatDateLong, formatPrice } from '@/lib/format'
import type { Course } from '@/payload-types'
import styles from './CourseDetails.module.css'

// Details ticket (91:1412 / 117:956): three groups of facts (Кога, Къде и за кого, Какво
// получавате) and the stub with the price and enrolment, in the states of board 126:1940. Every
// empty field is left out, and a group with no fields isn't shown (State: Липсващи полета).

type CourseDetailsProps = {
  course: Course
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

export async function CourseDetails({
  course,
  state,
  participants,
  format,
  levelCheckHref,
  action,
}: CourseDetailsProps) {
  const t = await getTranslations('course')
  const currency = course.currency ?? 'EUR'
  const closed = state.enrolment === 'closed'

  const groups: { title: string; fields: Field[] }[] = [
    {
      title: t('when'),
      fields: [
        { label: t('field.start'), value: course.startDate && formatDateLong(course.startDate) },
        { label: t('field.days'), value: course.days },
        { label: t('field.hours'), value: course.hours },
        { label: t('field.duration'), value: course.duration },
      ],
    },
    {
      title: t('where'),
      fields: [
        { label: t('field.format'), value: format },
        { label: t('field.venue'), value: course.venue },
        { label: t('field.city'), value: course.city },
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

  const note = closed
    ? t('closedNote')
    : state.pricing === 'voucher'
      ? course.priceNote || t('voucherValue')
      : course.priceNote

  return (
    <div className={styles.ticket}>
      {shown.length > 0 && (
        <div className={styles.main}>
          {shown.map((group) => (
            <section key={group.title} className={styles.group}>
              <h2 className={styles.groupTitle}>{group.title}</h2>
              <dl className={styles.fields}>
                {group.fields.map((field) => (
                  <div key={field.label} className={styles.field}>
                    <dt className={styles.label}>{field.label}</dt>
                    <dd className={styles.value}>{field.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}
      <div className={styles.stub} data-closed={closed || undefined}>
        {state.pricing !== 'none' && (
          <>
            <p className={styles.label}>{t('field.price')}</p>
            <p className={styles.price}>
              <span className={styles.amount}>{formatPrice(course.price!, currency)}</span>
              {note && <span className={styles.note}>{note}</span>}
            </p>
            {!closed && state.pricing === 'promotion' && (
              <p className={styles.extra}>
                {t.rich('regularPrice', {
                  price: formatPrice(course.regularPrice!, currency),
                  old: (chunks) => <s>{chunks}</s>,
                })}
              </p>
            )}
            {!closed && state.pricing === 'voucher' && (
              <p className={styles.extra}>{t('voucherNote')}</p>
            )}
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
      </div>
    </div>
  )
}
