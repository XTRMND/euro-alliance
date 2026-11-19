import { inboxOf } from '@/lib/analytics'
import { telHref } from '@/lib/format'
import type { Office } from '@/payload-types'
import styles from './OfficeCard.module.css'
import { OfficeHours } from './OfficeHours'
import { TrackedLink } from './TrackedLink'

// Office card (119:1876): what the office does, its name, address, phone, email and, for the
// central office, the bank details. Phone and email links report their clicks. Under them the
// office's working hours, the regular week and the season's (Trello #10; not in Figma).

export function OfficeCard({ office, bank }: { office: Office; bank?: string }) {
  return (
    <article className={styles.card}>
      {office.department && <p className={styles.kicker}>{office.department}</p>}
      <h3 className={styles.name}>{office.name}</h3>
      <p className={styles.address}>{office.address}</p>
      {office.phones?.map(({ number, id }) => (
        <TrackedLink
          key={id ?? number}
          href={telHref(number)}
          className={styles.phone}
          event="tel_click"
          params={{ office: office.role, placement: 'contact' }}
        >
          {number}
        </TrackedLink>
      ))}
      {office.emails?.map(({ email, id }) => {
        const inbox = inboxOf(email)
        return inbox ? (
          <TrackedLink
            key={id ?? email}
            href={`mailto:${email}`}
            className={styles.email}
            event="mailto_click"
            params={{ inbox, placement: 'contact' }}
          >
            {email}
          </TrackedLink>
        ) : (
          <a key={id ?? email} href={`mailto:${email}`} className={styles.email}>
            {email}
          </a>
        )
      })}
      <OfficeHours hours={office.hours} full className={styles.hours} />
      {bank && <p className={styles.bank}>{bank}</p>}
    </article>
  )
}
