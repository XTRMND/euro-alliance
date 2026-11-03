import { LogoStrip, type PartnerLogo } from '@/components/visuals/LogoStrip'
import { RevealOnScroll } from '@/components/visuals/RevealOnScroll'
import type { Home, Media } from '@/payload-types'
import landing from '@/styles/landing.module.css'
import styles from './Partners.module.css'

// «Партньори и акредитации» (52:284 / 115:902): a small capitals title over the moving logo strip.
// Logos are served as uploaded, with the partner's name as alt text.

export function Partners({ partners }: { partners: Home['partners'] }) {
  const logos: PartnerLogo[] = (partners?.logos ?? []).flatMap(({ name, logo }) =>
    typeof logo === 'object' && (logo as Media).url ? [{ name, src: (logo as Media).url! }] : [],
  )
  if (logos.length === 0) return null

  return (
    <section
      className={styles.section}
      aria-labelledby={partners?.title ? 'partners-title' : undefined}
    >
      <RevealOnScroll />
      <div className={[styles.inner, landing.revealItems].join(' ')}>
        {partners?.title && (
          <h2 id="partners-title" className={styles.title}>
            {partners.title}
          </h2>
        )}
        <LogoStrip logos={logos} />
      </div>
    </section>
  )
}
