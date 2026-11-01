import type { Profession } from '@/payload-types'
import { DirectionCard } from './DirectionCard'
import styles from './ProfessionsList.module.css'

// The ЦПО professions by direction (236:3759): two masonry columns from 1024px (the cards keep
// the list's order down the first column, then the second), one column below.
export function ProfessionsList({
  directions,
}: {
  directions: { code: string; name: string; professions: Profession[] }[]
}) {
  return (
    <div className={styles.columns}>
      {directions.map((direction) => (
        <DirectionCard key={direction.code} {...direction} />
      ))}
    </div>
  )
}
