import type { ReactNode } from 'react'
import { Breadcrumb } from '@/components/patterns/Breadcrumb'
import { CountBubble } from '@/components/patterns/CountBubble'
import { withHighlight } from '@/components/patterns/Highlight'
import { CourseVisual } from '@/components/visuals/CourseVisual'
import type { Program } from '@/payload-types'
import landing from '@/styles/landing.module.css'
import styles from './ProgramHero.module.css'

// The course-page hero of every program that isn't a language (Vouchers 236:3407, Professions
// 236:3683 …): breadcrumb, the H1 with its highlight, the lead and the buttons; beside it the
// Course visual with the program's sticker and the count bubble («6 КУРСА»). On mobile the visual
// follows the buttons. It lands once like the course page: the copy rises, the sticker settles
// from Pose=Intro, the bubble turns in. The H1 rises without fading (it's the LCP candidate).

type ProgramHeroProps = {
  program: Program
  breadcrumb: { label: string; href?: string }[]
  actions: ReactNode
}

export function ProgramHero({ program, breadcrumb, actions }: ProgramHeroProps) {
  const { hero } = program
  const bubble = hero.countBubble?.value ? hero.countBubble : null
  return (
    <div className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <div className={landing.copy}>
            <Breadcrumb items={breadcrumb} />
          </div>
          {hero.kicker && <p className={[styles.kicker, landing.copy].join(' ')}>{hero.kicker}</p>}
          <h1 className={[styles.title, landing.rise].join(' ')}>
            {withHighlight(hero.heading, hero.highlight)}
          </h1>
          {hero.lead && <p className={[styles.lead, landing.copy].join(' ')}>{hero.lead}</p>}
          <div className={[styles.actions, landing.copy].join(' ')}>{actions}</div>
        </div>
        {hero.sticker && (
          <div className={styles.art}>
            <CourseVisual
              topic={hero.sticker}
              landing
              eager
              sizes="(min-width: 1024px) 362px, 72vw"
              className={styles.visual}
            />
            {bubble && (
              <CountBubble
                number={bubble.value!}
                label={bubble.label ?? ''}
                className={[styles.bubble, landing.badge].join(' ')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
