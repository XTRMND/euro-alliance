import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/Button'
import { routes } from '@/lib/routes'
import styles from './InquiryBand.module.css'

// Inquiry band (79:822, 114:306): the navy call to action placed between page sections. `topic`
// preselects the contact wizard (docs/motion.md § 9).

type InquiryBandProps = {
  topic?: string
  /** Heading id; set it if a page shows the band twice. */
  id?: string
}

export async function InquiryBand({ topic, id = 'inquiry-band' }: InquiryBandProps) {
  const t = await getTranslations('inquiryBand')

  return (
    <section className={styles.band} aria-labelledby={id}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 id={id} className={styles.heading}>
            {t('heading')}
          </h2>
          <p className={styles.text}>{t('text')}</p>
        </div>
        <Button variant="accent" href={routes.contact(topic)} className={styles.cta}>
          {t('cta')}
        </Button>
      </div>
    </section>
  )
}
