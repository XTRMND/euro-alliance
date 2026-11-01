import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Ticket.module.css'

// Details ticket (91:1412 / 117:956): white, 18px corners, groups of label and value fields, and
// the stub behind a dashed line with two notches: 330px on the right from 1024px, under the
// groups below it. The course page puts the price and enrolment on the stub (CourseDetails), the
// About page its licence (194:2900). `ticket` exports the shell's classes for the stub's content.

export type TicketGroup = { title: string; fields: { label: string; value?: ReactNode }[] }

type TicketProps = {
  groups: TicketGroup[]
  stub: ReactNode
  stubClassName?: string
  stubProps?: HTMLAttributes<HTMLDivElement> & Record<`data-${string}`, unknown>
  headingLevel?: 'h2' | 'h3'
}

export { styles as ticket }

export function Ticket({
  groups,
  stub,
  stubClassName,
  stubProps,
  headingLevel: Heading = 'h2',
}: TicketProps) {
  return (
    <div className={styles.ticket}>
      {groups.length > 0 && (
        <div className={styles.main}>
          {groups.map((group) => (
            <section key={group.title} className={styles.group}>
              <Heading className={styles.groupTitle}>{group.title}</Heading>
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
      <div {...stubProps} className={[styles.stub, stubClassName].filter(Boolean).join(' ')}>
        {stub}
      </div>
    </div>
  )
}
