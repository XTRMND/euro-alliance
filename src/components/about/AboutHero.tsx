import { Breadcrumb } from '@/components/patterns/Breadcrumb'
import { withHighlight } from '@/components/patterns/Highlight'
import { TornWindow } from '@/components/patterns/TornWindow'
import { Img } from '@/components/ui/Img'
import logoMark from '@/assets/logo-mark-dark.svg'
import type { Media } from '@/payload-types'
import landing from '@/styles/landing.module.css'
import styles from './AboutHero.module.css'

// About hero (190:2693 / 210:2426): the copy like the program heroes, and the paper torn open on
// the team photo (Torn window 259:588, 45% tint) with the logo mark in a white ring over its
// corner. On a phone the photo comes first. Landing (216:3278): the copy fades up 30px; the
// window turns in from −3° without fading (the LCP element); the bubble turns in from 40°.

type AboutHeroProps = {
  breadcrumb: { label: string; href?: string }[]
  kicker?: string | null
  title: string
  highlight?: string | null
  lead?: string | null
  photo: Media | null
  actions: React.ReactNode
}

export function AboutHero({
  breadcrumb,
  kicker,
  title,
  highlight,
  lead,
  photo,
  actions,
}: AboutHeroProps) {
  return (
    <div className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <div className={landing.copy}>
            <Breadcrumb items={breadcrumb} />
          </div>
          {kicker && <p className={[styles.kicker, landing.copy].join(' ')}>{kicker}</p>}
          <h1 className={[styles.title, landing.rise].join(' ')}>
            {withHighlight(title, highlight)}
          </h1>
          {lead && <p className={[styles.lead, landing.copy].join(' ')}>{lead}</p>}
          <div className={[styles.actions, landing.copy].join(' ')}>{actions}</div>
        </div>
        {photo && (
          <div className={styles.art}>
            <TornWindow photo={photo} eager className={styles.window} />
            <span className={styles.bubble} aria-hidden="true">
              <Img src={logoMark} alt="" unoptimized />
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
