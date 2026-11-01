import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { CountBubble } from '@/components/patterns/CountBubble'
import { Highlight } from '@/components/patterns/Highlight'
import { Button } from '@/components/ui/Button'
import { DuotoneImage } from '@/components/visuals/DuotoneImage'
import { Globe } from '@/components/visuals/Globe'
import { Tape } from '@/components/visuals/Tape'
import { hrefOf } from '@/lib/destinations'
import { languages } from '@/lib/routes'
import type { Home, Media } from '@/payload-types'
import landing from '@/styles/landing.module.css'
import styles from './HomeHero.module.css'

// Home hero (57:269 / 115:248): the headline with «от 1999 г.» on its own highlighted line, the
// lead and two buttons; beside it the collage (57:288): the globe, the classroom photo as a taped
// polaroid in its 88% tint, an optional second photo in colour (Figma's is stock, so it stays
// empty until the client supplies one), the emphasis marks and the
// «7 ЕЗИКА» bubble. The collage scales as one piece with its width (--u = 1/560 of it).
// Landing motion from «Prototype · Начало landing» (149:4372); the H1 and the photo (the LCP
// candidates) move without fading in (docs/motion.md § 2).

const media = (value: number | Media | null | undefined) =>
  typeof value === 'object' && value?.url ? value : undefined

export async function HomeHero({ hero }: { hero: Home['hero'] }) {
  const t = await getTranslations('common')
  const photo = media(hero.photo)
  const second = media(hero.photoSecondary)
  const at = hero.highlight ? hero.heading.indexOf(hero.highlight) : -1
  const before = at === -1 ? hero.heading : hero.heading.slice(0, at)
  const after = at === -1 ? '' : hero.heading.slice(at + hero.highlight!.length)
  const primary = hrefOf(hero.primary?.destination)
  const secondary = hrefOf(hero.secondary?.destination)

  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 id="home-title" className={[styles.title, landing.rise].join(' ')}>
            {before}
            {at !== -1 && <Highlight className={styles.highlight}>{hero.highlight}</Highlight>}
            {after}
          </h1>
          {hero.lead && <p className={[styles.lead, landing.copy].join(' ')}>{hero.lead}</p>}
          {((primary && hero.primary?.label) || (secondary && hero.secondary?.label)) && (
            <div className={[styles.actions, landing.copy].join(' ')}>
              {primary && hero.primary?.label && (
                <Button href={primary} className={styles.primary}>
                  {hero.primary.label}
                </Button>
              )}
              {secondary && hero.secondary?.label && (
                <Button href={secondary} variant="link">
                  {hero.secondary.label}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className={styles.collage}>
          <div className={styles.stage}>
            <div className={styles.globe}>
              <Globe />
            </div>
            {photo && (
              <div className={styles.photo}>
                <div className={styles.frame}>
                  <DuotoneImage
                    media={photo}
                    tint="hero"
                    sizes="(min-width: 640px) 290px, 45vw"
                    eager
                  />
                </div>
              </div>
            )}
            {second && (
              <div className={styles.second}>
                <div className={styles.frame}>
                  <Image
                    src={second.url!}
                    alt={second.alt}
                    fill
                    sizes="(min-width: 640px) 230px, 35vw"
                    className={styles.colour}
                  />
                </div>
              </div>
            )}
            {photo && (
              <>
                <Tape className={styles.tapeLeft} />
                <Tape className={styles.tapeRight} />
              </>
            )}
            <svg
              aria-hidden="true"
              className={styles.marks}
              viewBox="0 0 70 70"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
            >
              <path d="M44 58L24 36M58 46L56 16M34 66L6 60" />
            </svg>
            <CountBubble
              size="large"
              number={String(languages.length)}
              label={t('languagesCount', { count: languages.length })}
              className={styles.bubble}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
