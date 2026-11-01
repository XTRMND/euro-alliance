import Image from 'next/image'
import type { Tint } from '@/lib/media/tints'
import type { Media, MediaTint } from '@/payload-types'
import styles from './DuotoneImage.module.css'

// A photo in its brand tint (docs/cms-schema.md § 4): the pre-composited tint as one image, best
// for LCP. With `clearOnHover`, the colour original sits underneath (lazy) and the tint fades out
// when the nearest `.duotone-hover` ancestor, or the image itself, is hovered or focused.
// Without a tint (not a photo, or not generated yet) the original shows as it is.

type DuotoneImageProps = {
  media: Media
  tint: Tint
  /** next/image `sizes`; the image fills its positioned parent. */
  sizes: string
  clearOnHover?: boolean
  /** Above the fold: load at once, at high priority (Next 16 replaced `priority`). */
  eager?: boolean
  className?: string
}

function tintOf(media: Media, tint: Tint): MediaTint | undefined {
  return media.tints?.docs?.find(
    (doc): doc is MediaTint => typeof doc === 'object' && doc.tint === tint,
  )
}

export function DuotoneImage({
  media,
  tint,
  sizes,
  clearOnHover = false,
  eager = false,
  className,
}: DuotoneImageProps) {
  const tinted = tintOf(media, tint)
  if (!media.url) return null
  // The focal point set in the admin decides which part of a cropped photo stays in view.
  const style =
    typeof media.focalX === 'number' && typeof media.focalY === 'number'
      ? { objectPosition: `${media.focalX}% ${media.focalY}%` }
      : undefined

  return (
    <span className={[styles.frame, className].filter(Boolean).join(' ')}>
      {(clearOnHover || !tinted?.url) && (
        <Image
          src={media.url}
          alt={tinted?.url ? '' : media.alt}
          fill
          sizes={sizes}
          style={style}
          className={styles.image}
          {...(eager && !tinted?.url && ({ loading: 'eager', fetchPriority: 'high' } as const))}
        />
      )}
      {tinted?.url && (
        <Image
          src={tinted.url}
          alt={media.alt}
          fill
          sizes={sizes}
          style={style}
          {...(eager && ({ loading: 'eager', fetchPriority: 'high' } as const))}
          className={[styles.image, clearOnHover && styles.clears].filter(Boolean).join(' ')}
        />
      )}
    </span>
  )
}
