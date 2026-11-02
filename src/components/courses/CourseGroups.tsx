import styles from './CourseGroups.module.css'

// The course's upcoming and running groups, when it has more than one (not in Figma): each with
// its name, start, schedule, format, office and price, in the list order. The ticket above shows
// the first.

type CourseGroupsProps = {
  title: string
  groups: { id: string; label?: string | null; start: string; details: string[] }[]
}

export function CourseGroups({ title, groups }: CourseGroupsProps) {
  return (
    <section className={styles.section} aria-labelledby="course-groups">
      <h2 id="course-groups" className={styles.title}>
        {title}
      </h2>
      <ul className={styles.list}>
        {groups.map((group) => (
          <li key={group.id} className={styles.group}>
            {group.label && <p className={styles.name}>{group.label}</p>}
            <p className={styles.start}>{group.start}</p>
            {group.details.length > 0 && (
              <p className={styles.details}>{group.details.join(' · ')}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
