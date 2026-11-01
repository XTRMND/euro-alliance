import { CardGrid } from '@/components/patterns/CardGrid'
import { IndexCard } from '@/components/patterns/IndexCard'
import type { Program } from '@/payload-types'
import styles from './IndexCardsGrid.module.css'

// A row of Index cards (264:448) from a program page's block (the farmers' 246:3860, the computer
// programmes 258:3986): equal heights, the count of each card's rows on its chip or navy bubble.
// Numbered rows run on from card to card (01–04, 05–06, 07–08), as in Figma.

type IndexCardsBlock = Extract<
  NonNullable<Program['sections']>[number],
  { blockType: 'indexCards' }
>

export function IndexCardsGrid({ cards }: { cards: NonNullable<IndexCardsBlock['cards']> }) {
  // Where each card's numbering starts: after the numbered rows of the cards before it.
  const starts = cards.map((_, i) =>
    cards
      .slice(0, i)
      .filter((card) => card.marker !== 'check')
      .reduce((sum, card) => sum + (card.rows ?? []).length, 0),
  )
  return (
    <CardGrid columns={Math.min(Math.max(cards.length, 2), 3) as 2 | 3} className={styles.grid}>
      {cards.map((card, i) => {
        const rows = card.rows ?? []
        const marker = card.marker === 'check' ? 'check' : 'number'
        return (
          <IndexCard
            key={card.id ?? i}
            title={card.title}
            marker={marker}
            count={card.count === 'none' ? null : String(rows.length)}
            countLabel={card.count === 'bubble' ? card.countLabel : null}
            items={rows.map((row, j) => ({
              text: row.text,
              no: marker === 'number' ? String(starts[i] + j + 1).padStart(2, '0') : null,
            }))}
          />
        )
      })}
    </CardGrid>
  )
}
