import { Img } from '@/components/ui/Img'
import computer from '@/assets/stickers/computer.png'
import contact from '@/assets/stickers/contact.png'
import corporate from '@/assets/stickers/corporate.png'
import english from '@/assets/stickers/english.png'
import examPrep from '@/assets/stickers/exam-prep.png'
import exams from '@/assets/stickers/exams.png'
import farming from '@/assets/stickers/farming.png'
import frenchHero from '@/assets/stickers/french-hero.png'
import french from '@/assets/stickers/french.png'
import german from '@/assets/stickers/german.png'
import italianHero from '@/assets/stickers/italian-hero.png'
import italian from '@/assets/stickers/italian.png'
import professional from '@/assets/stickers/professional.png'
import russian from '@/assets/stickers/russian.png'
import spanish from '@/assets/stickers/spanish.png'
import student from '@/assets/stickers/student.png'
import teaching from '@/assets/stickers/teaching.png'
import translation from '@/assets/stickers/translation.png'
import styles from './Sticker.module.css'

// Course sticker (50:274): a die-cut duotone photo with its white edge and shadow, exported once
// from Figma's image fills and served through next/image. Stickers carry no text in Figma, so
// they're decoration (alt=""); the label beside them says what they mean. One sticker, one
// meaning per page (CLAUDE.md § 6). The flag variants are the Flag component.

export const stickers = {
  english,
  german,
  french,
  italian,
  spanish,
  russian,
  'exam-prep': examPrep,
  student,
  computer,
  farming,
  translation,
  corporate,
  professional,
  exams,
  teaching,
  contact,
  'french-hero': frenchHero,
  'italian-hero': italianHero,
}

export type StickerTopic = keyof typeof stickers

type StickerProps = {
  topic: StickerTopic
  /** next/image `sizes` for the box the sticker fills. */
  sizes: string
  /** Load at once: the sticker is above the fold or the LCP element. */
  eager?: boolean
  /** Preload it from the <head> as well, so it's ready for the first paint (the LCP element). */
  preload?: boolean
  className?: string
}

/** Fills a square box (200 × 200 in Figma), the photo fitted inside it. */
export function Sticker({ topic, sizes, eager = false, preload = false, className }: StickerProps) {
  return (
    <span className={[styles.sticker, className].filter(Boolean).join(' ')}>
      <Img
        src={stickers[topic]}
        alt=""
        fill
        sizes={sizes}
        loading={eager ? 'eager' : 'lazy'}
        preload={preload}
        className={styles.image}
      />
    </span>
  )
}
