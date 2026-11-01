import { DuotoneImage } from '@/components/visuals/DuotoneImage'
import type { Media } from '@/payload-types'
import styles from './TornWindow.module.css'

// Torn window (259:588): the About hero's photo seen through a hole torn in the paper (the rim),
// colour + 45% duotone. Figma's rim and mask are SVGs in src/assets. The team photo is the hero's
// art at 600px, so it's served at quality 90, not the default 75. On a phone the photo is 15/16 of
// the page width less its margins: 83.75vw − 6px.

type TornWindowProps = {
  photo: Media
  eager?: boolean
  className?: string
}

export function TornWindow({ photo, eager, className }: TornWindowProps) {
  return (
    <div className={[styles.window, className].filter(Boolean).join(' ')}>
      <div className={styles.photo}>
        <DuotoneImage
          media={photo}
          tint="about"
          sizes="(min-width: 768px) 600px, calc(83.75vw - 6px)"
          quality={90}
          eager={eager}
        />
      </div>
    </div>
  )
}
