import Image from 'next/image'
import bulgarian from '@/assets/flags/bulgarian.svg'
import english from '@/assets/flags/english.svg'
import french from '@/assets/flags/french.svg'
import german from '@/assets/flags/german.svg'
import italian from '@/assets/flags/italian.svg'
import russian from '@/assets/flags/russian.svg'
import spanish from '@/assets/flags/spanish.svg'
import styles from './Sticker.module.css'

// The «<Language> flag» variants of Course sticker (50:274): the hero stickers of the language
// programme pages. Die-cut, real flag colours, light grain (scripts/build-flags.mjs). Decorative:
// the page names the language in text.

export const flags = { english, german, french, italian, spanish, russian, bulgarian }

export type FlagLanguage = keyof typeof flags

type FlagProps = {
  language: FlagLanguage
  /** Load at once: the flag is above the fold or the LCP element. */
  eager?: boolean
  className?: string
}

/** Fills a square box (200 × 200 in Figma), as Sticker does. */
export function Flag({ language, eager = false, className }: FlagProps) {
  return (
    <span className={[styles.sticker, className].filter(Boolean).join(' ')}>
      <Image
        src={flags[language]}
        alt=""
        unoptimized
        loading={eager ? 'eager' : 'lazy'}
        className={styles.flag}
      />
    </span>
  )
}
