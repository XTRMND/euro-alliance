import Image, { type StaticImageData } from 'next/image'
import { getTranslations } from 'next-intl/server'
import styles from './LogoStrip.module.css'
import { Marquee } from './Marquee'

// Marquee / Logos (63:711): partner logos in 110 × 88 boxes at 80% opacity, 56px apart, moving
// at the language strip's speed. Each logo's alt text is the partner's name. Logos are served
// byte for byte, never re-encoded. The strip hides when there are no logos.

export type PartnerLogo = {
  name: string
  src: string | StaticImageData
}

export async function LogoStrip({
  logos,
  className,
}: {
  logos: PartnerLogo[]
  className?: string
}) {
  if (logos.length === 0) return null
  const t = await getTranslations('common')

  return (
    <Marquee
      className={[styles.strip, className].filter(Boolean).join(' ')}
      labels={{ pause: t('pauseAnimation'), play: t('playAnimation') }}
    >
      {logos.map(({ name, src }) => (
        <li key={name} className={styles.logo}>
          <Image src={src} alt={name} fill sizes="110px" unoptimized className={styles.image} />
        </li>
      ))}
    </Marquee>
  )
}
