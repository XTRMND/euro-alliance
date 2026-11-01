import { DuotoneImage } from '@/components/visuals/DuotoneImage'
import type { Media } from '@/payload-types'
import styles from './Polaroid.module.css'

// Polaroid (259:582): a real photo with a white border and a caption, colour + 45% duotone.
// Placed tilted 2–4° (`--polaroid-rotate`), optionally taped. Without a photo it isn't shown.

type PolaroidProps = {
  photo: Media
  caption?: string | null
  clearOnHover?: boolean
  className?: string
}

export function Polaroid({ photo, caption, clearOnHover, className }: PolaroidProps) {
  return (
    <figure className={[styles.polaroid, className].filter(Boolean).join(' ')}>
      <div className={styles.photo}>
        <DuotoneImage
          media={photo}
          tint="about"
          sizes="(min-width: 768px) 300px, 80vw"
          clearOnHover={clearOnHover}
        />
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}
