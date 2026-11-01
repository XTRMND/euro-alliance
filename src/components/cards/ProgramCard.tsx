import Link from 'next/link'
import type { CSSProperties } from 'react'
import { Sticker, type StickerTopic } from '@/components/visuals/Sticker'
import { Tape } from '@/components/visuals/Tape'
import styles from './ProgramCard.module.css'

// Program card (56:280), «Какво предлагаме» on the homepage: a taped note with its number, a topic
// sticker, the title, one line and a link. Each card sits at its own slight tilt and straightens
// on hover and keyboard focus (docs/motion.md § 5). The whole card is the title's link, stretched;
// the underlined «Виж …» line repeats across cards, so it isn't the link's name. Numbers are navy,
// not Figma's sand: sand text only on navy (CLAUDE.md § 12).

type ProgramCardProps = {
  index: number
  title: string
  text?: string | null
  linkLabel: string
  href: string
  sticker: StickerTopic
  /** Resting tilt in degrees. */
  tilt?: number
  headingLevel?: 'h2' | 'h3'
  className?: string
}

export function ProgramCard({
  index,
  title,
  text,
  linkLabel,
  href,
  sticker,
  tilt = 0,
  headingLevel: Heading = 'h3',
  className,
}: ProgramCardProps) {
  return (
    <article
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={{ '--tilt': `${tilt}deg` } as CSSProperties}
    >
      <Tape className={styles.tape} />
      <div className={styles.top}>
        <span className={styles.index}>{String(index).padStart(2, '0')}</span>
        <Sticker topic={sticker} sizes="132px" className={styles.sticker} />
      </div>
      <Heading className={styles.title}>
        <Link href={href} prefetch={false} className={styles.link}>
          {title}
        </Link>
      </Heading>
      {text && <p className={styles.text}>{text}</p>}
      <span aria-hidden="true" className={styles.more}>
        {linkLabel}
      </span>
    </article>
  )
}
