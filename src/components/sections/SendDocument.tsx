import { getTranslations } from 'next-intl/server'
import { SectionHeading } from '@/components/patterns/SectionHeading'
import { Button } from '@/components/ui/Button'
import { Sticker } from '@/components/visuals/Sticker'
import { Dropzone } from './Dropzone'
import { LanguagePair } from './LanguagePair'
import styles from './SendDocument.module.css'
import { SendDocumentLink } from './SendDocumentLink'

// «Изпратете документ»: the homepage's «Преводи и легализация» (51:295 / 115:825), and the same
// block on the Translations page (172:2255). Copy and steps come from the page; the languages
// from the `translation` global (with fewer than two the pair is hidden). The button and the
// dropzone open the contact wizard on the translations topic.

type SendDocumentProps = {
  title: string
  lead?: string | null
  steps: string[]
  languages: string[]
  /** The button; without `href` it opens the wizard with the chosen pair. */
  cta?: { label: string; href?: string }
  id: string
}

export async function SendDocument({ title, lead, steps, languages, cta, id }: SendDocumentProps) {
  const t = await getTranslations('sendDocument')
  const hasPair = languages.length >= 2
  const initial = hasPair ? { from: languages[0], to: languages[1] } : undefined

  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <SectionHeading title={title} lead={lead} id={id} />
          {hasPair && (
            <LanguagePair languages={languages} labels={{ from: t('from'), to: t('to') }} />
          )}
          {steps.length > 0 && (
            <ol className={styles.steps}>
              {steps.map((step, i) => (
                <li key={i} className={styles.step}>
                  <span className={styles.number}>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          )}
          {cta &&
            (cta.href ? (
              <Button href={cta.href} className={styles.cta}>
                {cta.label}
              </Button>
            ) : (
              <SendDocumentLink label={cta.label} initial={initial} className={styles.cta} />
            ))}
        </div>
        <Dropzone
          art={<Sticker topic="translation" sizes="143px" className={styles.dropArt} />}
          labels={{ title: t('dropTitle'), hint: t('dropHint'), choose: t('chooseFile') }}
          initial={initial}
        />
      </div>
    </section>
  )
}
