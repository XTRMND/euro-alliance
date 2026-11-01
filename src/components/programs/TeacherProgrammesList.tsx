import { IndexCard } from '@/components/patterns/IndexCard'
import type { TeacherProgramme } from '@/payload-types'
import styles from './TeacherProgrammesList.module.css'

// The programmes for pedagogical specialists by theme (237:3823): an Index card per theme with
// the number of its programmes on the chip and the programmes numbered as in the official list.
// Two masonry columns from 1024px, in the list's order; one column below.
export function TeacherProgrammesList({ themes }: { themes: TeacherProgramme[][] }) {
  return (
    <div className={styles.columns}>
      {themes.map((programmes) => (
        <IndexCard
          key={programmes[0].theme}
          title={programmes[0].theme}
          count={String(programmes.length)}
          marker="number"
          items={programmes.map((programme) => ({ no: programme.number, text: programme.title }))}
          className={styles.card}
        />
      ))}
    </div>
  )
}
