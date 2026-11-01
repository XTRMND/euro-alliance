import { Tape } from '@/components/visuals/Tape'
import { Halftone } from '@/components/visuals/Halftone'
import type { TextbookSystem } from '@/payload-types'
import styles from './SystemCard.module.css'

// System card (135:389 Columns=Two, 240:662 Columns=One): a taped index card with the kicker chip,
// the title, the count bubble, a description, the numbered levels and an optional note on a navy
// strip, over a 7% halftone corner. Level numbers are navy, not Figma's sand: sand text only on
// navy (CLAUDE.md § 12).

export function SystemCard({
  system,
  columns,
}: {
  system: TextbookSystem
  columns: 'one' | 'two'
}) {
  const levels = system.levels ?? []
  return (
    <article className={styles.card} data-columns={columns}>
      <Halftone pattern="system-corner" className={styles.halftone} />
      <Tape className={styles.tape} />
      {system.count && (
        <p className={styles.bubble}>
          <span className={styles.count}>{system.count}</span>
          {system.countLabel && <span className={styles.countLabel}>{system.countLabel}</span>}
        </p>
      )}
      {system.kicker && <span className={styles.chip}>{system.kicker}</span>}
      <h3 className={styles.title}>{system.name}</h3>
      {system.description && <p className={styles.text}>{system.description}</p>}
      {levels.length > 0 && (
        <ol className={styles.levels}>
          {levels.map((item, i) => (
            <li key={item.id ?? i} className={styles.level}>
              <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span>
              {item.level}
            </li>
          ))}
        </ol>
      )}
      {system.strip?.note && (
        <p className={styles.strip}>
          {system.strip.label && <span className={styles.stripLabel}>{system.strip.label}</span>}
          {system.strip.note}
        </p>
      )}
    </article>
  )
}
