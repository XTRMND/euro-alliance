import { inboxOf } from '@/lib/analytics'
import { telHref } from '@/lib/format'
import { fullAddress, hasHours } from '@/lib/office-groups'
import type { Office } from '@/payload-types'
import styles from './OfficeCard.module.css'
import { OfficeHours } from './OfficeHours'
import { TrackedLink } from './TrackedLink'

// Office card (Contact, Option A: 513:2 / 515:63; docs/contact-offices.md). One office: what it
// does, its name, address, phone and email. Offices that share an address: the address once (the
// Location card's kicker and street as the heading), then each office with its own phone and
// email. Under a perforation, as a ticket's stub, the working hours: the regular week beside the
// season's. The bank details come last. Phone and email links report their clicks.

type Heading = { kicker?: string | null; title: string }

function Contacts({ office }: { office: Office }) {
  const phones = office.phones ?? []
  const emails = office.emails ?? []
  if (phones.length + emails.length === 0) return null
  return (
    <ul className={styles.contacts}>
      {phones.map(({ number, id }) => (
        <li key={id ?? number}>
          <TrackedLink
            href={telHref(number)}
            className={styles.phone}
            event="tel_click"
            params={{ office: office.role, placement: 'contact' }}
          >
            {number}
          </TrackedLink>
        </li>
      ))}
      {emails.map(({ email, id }) => {
        const inbox = inboxOf(email)
        return (
          <li key={id ?? email}>
            {inbox ? (
              <TrackedLink
                href={`mailto:${email}`}
                className={styles.email}
                event="mailto_click"
                params={{ inbox, office: office.role, placement: 'contact' }}
              >
                {email}
              </TrackedLink>
            ) : (
              <a href={`mailto:${email}`} className={styles.email}>
                {email}
              </a>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function OfficeCard({
  offices,
  heading,
  bank,
}: {
  /** One office, or the offices of one address (with the same hours). */
  offices: Office[]
  /** The shared card's kicker and title; a single office uses its own. */
  heading?: Heading
  bank?: string
}) {
  const [office] = offices
  if (!office) return null
  const shared = offices.length > 1 && heading

  return (
    <article className={styles.card}>
      <div className={styles.head}>
        {shared ? (
          <>
            {heading.kicker && <p className={styles.kicker}>{heading.kicker}</p>}
            <h3 className={styles.title}>{heading.title}</h3>
            <p className={styles.address}>{fullAddress(offices)}</p>
          </>
        ) : (
          <>
            {office.department && <p className={styles.kicker}>{office.department}</p>}
            <h3 className={styles.title}>{office.name}</h3>
            <p className={styles.address}>{office.address}</p>
          </>
        )}
      </div>
      {shared ? (
        <div className={styles.offices}>
          {offices.map((member) => (
            <div key={member.id} className={styles.office}>
              {member.department && <p className={styles.kicker}>{member.department}</p>}
              <h4 className={styles.name}>{member.name}</h4>
              <Contacts office={member} />
            </div>
          ))}
        </div>
      ) : (
        <Contacts office={office} />
      )}
      {hasHours(office.hours) && (
        <>
          <span className={styles.perforation} aria-hidden="true">
            <svg width="100%" height="2" focusable="false">
              <line x1="1" y1="1" x2="100%" y2="1" />
            </svg>
          </span>
          <OfficeHours hours={office.hours} full ticket />
        </>
      )}
      {bank && <p className={styles.bank}>{bank}</p>}
    </article>
  )
}
