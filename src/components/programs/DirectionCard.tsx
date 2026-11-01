import { getTranslations } from 'next-intl/server'
import { Tape } from '@/components/visuals/Tape'
import type { Profession } from '@/payload-types'
import styles from './DirectionCard.module.css'

// A professional direction on «Професии и специалности» (Direction 041 … in 236:3759): a taped
// white card with the direction's code and name, then a row per profession: its name, its code
// and its qualification degrees («II, III степен»). Rows aren't links.

export async function DirectionCard({
  code,
  name,
  professions,
}: {
  code: string
  name: string
  professions: Profession[]
}) {
  const t = await getTranslations('program.professions')
  return (
    <article className={styles.card}>
      <Tape className={styles.tape} />
      <h3 className={styles.head}>
        <span className={styles.chip}>{code}</span> <span className={styles.name}>{name}</span>
      </h3>
      <ul className={styles.rows}>
        {professions.map((profession) => (
          <li key={profession.id} className={styles.row}>
            <span className={styles.profession}>{profession.name}</span>
            <span className={styles.code}>
              <span className="sr-only">{t('code')} </span>
              {profession.code}
            </span>
            <span className={styles.degrees}>
              {t('degrees', { degrees: profession.degrees.join(', ') })}
            </span>
          </li>
        ))}
      </ul>
    </article>
  )
}
