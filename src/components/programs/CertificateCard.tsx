import type { Certificate } from '@/payload-types'
import styles from './CertificateCard.module.css'

// Certificate card (145:364): an exam card drawn like a certificate, a navy frame with a sand inner
// rule, the issuer (or when the exam is taken), the exam, a short sand rule and the book we prepare with on a signature line,
// and a rosette seal with the exam's code. Hover deepens the shadow and turns the seal.

export function CertificateCard({
  certificate,
  tilt = 0,
}: {
  certificate: Certificate
  tilt?: number
}) {
  // Who issues it («Cambridge ESOL»), or for a state exam when it's taken («12. клас»).
  const firstLine = certificate.issuer || certificate.when
  return (
    <article className={styles.card} style={{ '--tilt': `${tilt}deg` } as React.CSSProperties}>
      <div className={styles.frame}>
        {firstLine && <p className={styles.issuer}>{firstLine}</p>}
        <h3 className={styles.title}>{certificate.name}</h3>
        <span className={styles.rule} aria-hidden="true" />
        {certificate.prep && <p className={styles.prep}>{certificate.prep}</p>}
      </div>
      {certificate.code && (
        <span className={styles.seal} aria-hidden="true">
          <svg viewBox="0 0 84 84" className={styles.sealArt}>
            <path
              className={styles.rosette}
              d="M41.5725 0L46.7129 6.24765L53.4053 1.70129L56.5773 9.14409L64.2794 6.66735L65.2261 14.7023L73.314 14.4958L71.9586 22.4721L79.777 24.5526L76.2294 31.8238L83.145 36.0228L77.6925 42L83.145 47.9772L76.2294 52.1762L79.777 59.4474L71.9586 61.5279L73.314 69.5042L65.2261 69.2977L64.2794 77.3326L56.5773 74.8559L53.4053 82.2987L46.7129 77.7523L41.5725 84L36.4321 77.7523L29.7397 82.2987L26.5677 74.8559L18.8656 77.3326L17.9189 69.2977L9.83102 69.5042L11.1864 61.5279L3.36796 59.4474L6.91562 52.1762L0 47.9772L5.4525 42L0 36.0228L6.91562 31.8238L3.36796 24.5526L11.1864 22.4721L9.83102 14.4958L17.9189 14.7023L18.8656 6.66735L26.5677 9.14409L29.7397 1.70129L36.4321 6.24765L41.5725 0Z"
              transform="translate(0.43 0)"
            />
            <circle className={styles.disc} cx="42" cy="42" r="30" />
          </svg>
          <span className={styles.code}>{certificate.code}</span>
        </span>
      )}
    </article>
  )
}
