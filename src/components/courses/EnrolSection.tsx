import { getTranslations } from 'next-intl/server'
import { TrackedLink } from '@/components/contact/TrackedLink'
import { Sticker } from '@/components/visuals/Sticker'
import { Wizard } from '@/components/wizard/Wizard'
import { inboxOf } from '@/lib/analytics'
import { telHref } from '@/lib/format'
import type { Course, Office } from '@/payload-types'
import styles from './EnrolSection.module.css'

// «Запишете се» (91:1462 / 117:1015): the contact wizard opened at Step 2 with the course chosen,
// and beside it how enrolment goes and the courses office's phone and email.

export const enrolAnchor = 'zapishete-se'

export async function EnrolSection({
  title,
  course,
  office,
  path,
}: {
  /** «Попитайте за записване» for a running course or one without a date; «Запишете се» else. */
  title?: string
  course: Course
  office?: Office
  path: string
}) {
  const t = await getTranslations('enrol')
  const phone = office?.phones?.[0]?.number
  const email = office?.emails?.[0]?.email
  const inbox = email ? inboxOf(email) : undefined

  return (
    <section id={enrolAnchor} className={styles.section} aria-labelledby="enrol-title">
      <h2 id="enrol-title" className={styles.title}>
        {title ?? t('title')}
      </h2>
      <div className={styles.grid}>
        <Wizard
          initialTopic={course.voucherEligible ? 'voucher' : 'course'}
          initialCourse={course}
          sourcePage={path}
          headingLevel="h3"
        />
        <aside className={styles.side} aria-labelledby="enrol-how">
          <h3 id="enrol-how" className={styles.sideTitle}>
            {t('howTitle')}
          </h3>
          <ol className={styles.steps}>
            {(['1', '2', '3'] as const).map((n) => (
              <li key={n} className={styles.step}>
                <span className={styles.number}>{n}</span>
                {t(`steps.${n}`)}
              </li>
            ))}
          </ol>
          {(phone || email) && (
            <div className={styles.call}>
              <p className={styles.callTitle}>
                <Sticker topic="contact" sizes="62px" className={styles.callSticker} />
                {t('callTitle')}
              </p>
              {phone && (
                <p className={styles.callLine}>
                  {office?.department && `${office.department}: `}
                  <TrackedLink
                    href={telHref(phone)}
                    event="tel_click"
                    params={{ office: office!.role, placement: 'page' }}
                  >
                    {phone}
                  </TrackedLink>
                </p>
              )}
              {email && (
                <p className={styles.callLine}>
                  {inbox ? (
                    <TrackedLink
                      href={`mailto:${email}`}
                      event="mailto_click"
                      params={{ inbox, placement: 'page' }}
                    >
                      {email}
                    </TrackedLink>
                  ) : (
                    <a href={`mailto:${email}`}>{email}</a>
                  )}
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
