import { CountBubble } from '@/components/patterns/CountBubble'
import { Breadcrumb } from '@/components/patterns/Breadcrumb'
import { withHighlight } from '@/components/patterns/Highlight'
import { CourseVisual } from '@/components/visuals/CourseVisual'
import landing from '@/styles/landing.module.css'
import styles from './CourseHero.module.css'

// The course page's hero (81:1241 / 117:907): breadcrumb, the course's tags, the title with its
// level highlighted, the description and the actions; beside it the Course visual with the level
// bubble. It lands once: the copy rises, the sticker settles from Pose=Intro, the bubble turns in.

type CourseHeroProps = {
  breadcrumb: { label: string; href?: string }[]
  tags: string[]
  title: string
  level?: string | null
  levelLabel: string
  description?: string | null
  topic: Parameters<typeof CourseVisual>[0]['topic']
  /** The enrol button: shown here from 1024px, in the sticky bar below. */
  enrol: React.ReactNode
  /** «Задай въпрос». */
  ask: React.ReactNode
}

export function CourseHero({
  breadcrumb,
  tags,
  title,
  level,
  levelLabel,
  description,
  topic,
  enrol,
  ask,
}: CourseHeroProps) {
  return (
    <div className={styles.hero}>
      <div className={styles.inner}>
        <div className={[styles.copy, landing.copy].join(' ')}>
          <Breadcrumb items={breadcrumb} />
          {tags.length > 0 && <p className={styles.kicker}>{tags.join(' • ')}</p>}
          <h1 className={styles.title}>{withHighlight(title, level)}</h1>
          {description && <p className={styles.lead}>{description}</p>}
        </div>
        <div className={styles.art}>
          <CourseVisual
            topic={topic}
            landing
            eager
            sizes="(min-width: 1024px) 362px, 92vw"
            className={styles.visual}
          />
          {level && (
            <CountBubble
              number={level}
              label={levelLabel}
              className={[styles.bubble, landing.badge].join(' ')}
            />
          )}
        </div>
        <div className={styles.actions}>
          <span className={styles.enrol}>{enrol}</span>
          {ask}
        </div>
      </div>
    </div>
  )
}
