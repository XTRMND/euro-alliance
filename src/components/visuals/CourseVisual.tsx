import { Halftone } from './Halftone'
import styles from './CourseVisual.module.css'
import { Sticker, type StickerTopic } from './Sticker'
import { Tape } from './Tape'

// Course visual (86:416): the paper panel with halftone dots, the topic sticker overflowing it
// and a strip of tape. Pose=A is the resting state. With `landing`, it starts from Pose=Intro
// (the sticker larger and higher, the tape at 34°) and settles once (docs/motion.md § 2).

type CourseVisualProps = {
  topic: StickerTopic
  landing?: boolean
  /** next/image `sizes` for the sticker, which is 105% of the panel's width. */
  sizes?: string
  /** Load the sticker at once and preload it: the visual is above the fold, often the LCP. */
  eager?: boolean
  className?: string
}

export function CourseVisual({
  topic,
  landing = false,
  sizes = '(min-width: 768px) 420px, 100vw',
  eager = false,
  className,
}: CourseVisualProps) {
  return (
    <div
      className={[styles.visual, landing && styles.landing, className].filter(Boolean).join(' ')}
    >
      <Halftone pattern="panel" />
      <Sticker
        topic={topic}
        sizes={sizes}
        eager={eager}
        preload={eager}
        className={styles.sticker}
      />
      <Tape className={styles.tape} />
    </div>
  )
}
