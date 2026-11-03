import { withHighlight } from '@/components/patterns/Highlight'
import { Polaroid } from '@/components/patterns/Polaroid'
import { Button } from '@/components/ui/Button'
import { Halftone } from '@/components/visuals/Halftone'
import { RevealOnScroll } from '@/components/visuals/RevealOnScroll'
import { Sticker } from '@/components/visuals/Sticker'
import { Tape } from '@/components/visuals/Tape'
import { hrefOf } from '@/lib/destinations'
import type { Home } from '@/payload-types'
import landing from '@/styles/landing.module.css'
import styles from './AboutIsland.module.css'

// «За ЕВРО-АЛИАНС», the About island (323:5189 / 324:9930), after «Какво предлагаме»: the team
// photo in a taped polaroid on the halftone panel with a sticker, the heading's last phrase on a
// highlighter on its own line, the lead, the result on a sand bar and a link to About's history.
// The polaroid straightens and the sticker tilts on hover. The section fades up once, the first
// time it comes into view. Hidden without a heading; the art without a photo or a sticker.

export function AboutIsland({ about }: { about: Home['about'] }) {
  if (!about?.heading) return null
  const photo = typeof about.photo === 'object' ? about.photo : null
  const href = hrefOf(about.cta?.destination)

  return (
    <section className={styles.section} aria-labelledby="about-island-title">
      <RevealOnScroll />
      <div className={styles.inner}>
        {(photo || about.sticker) && (
          <div className={[styles.visual, landing.revealArt].join(' ')}>
            <span className={styles.panel}>
              <Halftone pattern="panel" />
            </span>
            {photo && (
              <>
                <Polaroid
                  photo={photo}
                  caption={about.caption}
                  // 38%: lighter than About's 45% (the user, 03.11.2026).
                  tint="homeAbout"
                  sizes="(min-width: 1024px) min(435px, 31vw), min(80vw, 412px)"
                  // Tilted and as large as it is: no second lossy pass at 75, as on About.
                  quality={90}
                  className={styles.polaroid}
                />
                <Tape className={styles.tape} />
              </>
            )}
            {about.sticker && (
              <Sticker
                topic={about.sticker}
                sizes="(min-width: 1024px) 200px, 180px"
                className={styles.sticker}
              />
            )}
          </div>
        )}
        <div className={[styles.copy, landing.revealCopy].join(' ')}>
          {about.kicker && <p className={styles.kicker}>{about.kicker}</p>}
          <h2 id="about-island-title" className={styles.title}>
            {withHighlight(about.heading, about.highlight, styles.highlight)}
          </h2>
          {about.lead && <p className={styles.lead}>{about.lead}</p>}
          {about.quote && <p className={styles.result}>{about.quote}</p>}
          {about.cta?.label && href && (
            <Button variant="secondary" href={href}>
              {about.cta.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
