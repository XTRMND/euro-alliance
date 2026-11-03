import { DuotoneImage } from '@/components/visuals/DuotoneImage'
import type { Tint } from '@/lib/media/tints'
import type { Media } from '@/payload-types'
import styles from './Polaroid.module.css'

// Polaroid (259:582): a real photo with a white border and a caption, colour + 45% duotone (a
// lighter tint where a page asks for one). Placed tilted 2–4° (`--polaroid-rotate`), optionally
// taped. `--polaroid-unit` scales the border and the caption with the frame (1px by default).
// Without a photo it isn't shown.

type PolaroidProps = {
  photo: Media
  caption?: string | null
  clearOnHover?: boolean
  /** The duotone: 45% (About's photos) unless a page asks for another. */
  tint?: Tint
  sizes?: string
  /** next/image quality (75 by default); 90 where a tilted photo shows large. */
  quality?: number
  className?: string
}

export function Polaroid({
  photo,
  caption,
  clearOnHover,
  tint = 'about',
  sizes = '(min-width: 768px) 300px, 80vw',
  quality,
  className,
}: PolaroidProps) {
  return (
    <figure className={[styles.polaroid, className].filter(Boolean).join(' ')}>
      <div className={styles.photo}>
        <DuotoneImage
          media={photo}
          tint={tint}
          sizes={sizes}
          quality={quality}
          clearOnHover={clearOnHover}
        />
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}
