import { ProgramCard } from '@/components/cards/ProgramCard'
import { SwipeRow } from '@/components/patterns/SwipeRow'
import { hrefOf } from '@/lib/destinations'
import type { Home } from '@/payload-types'
import styles from './ProgramIndex.module.css'

// «Какво предлагаме» (51:273 / 115:684): the title on a sand highlighter, then the program cards,
// numbered in order, each at its own slight tilt (from the Figma grid, repeating after eight).

const tilts = [1.2, -0.9, 0.5, -1.1, -0.7, 1, -1.2, 0.6]

export function ProgramIndex({ programs }: { programs: Home['programs'] }) {
  const cards = (programs?.cards ?? []).flatMap((card) => {
    const href = hrefOf(card.destination)
    return href ? [{ ...card, href }] : []
  })
  if (cards.length === 0) return null

  return (
    <section
      className={styles.section}
      aria-labelledby={programs?.title ? 'programs-title' : undefined}
    >
      <div className={styles.inner}>
        {programs?.title && (
          <h2 id="programs-title" className={styles.title}>
            <span className={styles.highlight}>{programs.title}</span>
          </h2>
        )}
        <SwipeRow
          columns={4}
          itemWidth={276}
          gap={{ row: 48, column: 18 }}
          className={styles.cards}
        >
          {cards.map((card, i) => (
            <ProgramCard
              key={card.id ?? i}
              index={i + 1}
              title={card.title}
              text={card.text}
              linkLabel={card.linkLabel}
              href={card.href}
              sticker={card.sticker}
              tilt={tilts[i % tilts.length]}
            />
          ))}
        </SwipeRow>
      </div>
    </section>
  )
}
