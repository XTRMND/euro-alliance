import { getTranslations } from 'next-intl/server'
import { ArticleContents } from '@/components/news/ArticleContents'
import { Breadcrumb } from '@/components/patterns/Breadcrumb'
import { withHighlight } from '@/components/patterns/Highlight'
import { Button } from '@/components/ui/Button'
import { formatDateNumeric } from '@/lib/format'
import { legalOutline } from '@/lib/legal'
import { routes } from '@/lib/routes'
import type { LegalPage as LegalPageDoc, Media } from '@/payload-types'
import landing from '@/styles/landing.module.css'
import { LegalText } from './LegalText'
import styles from './LegalPage.module.css'

// The legal pages (218:2842 privacy, 224:3208 cookies; mobile 226:2581, 226:2775): a hero with
// the breadcrumb under «За нас», the H1 and the company line, then the contents rail beside the
// text (the contents box above it on a phone), and the date of the last change with the PDF
// (each only when the CMS has it). No inquiry band. No landing frame in Figma: the copy fades up as on the other heroes.

export async function LegalPage({ page }: { page: LegalPageDoc }) {
  const t = await getTranslations('legal')
  const about = await getTranslations('about')
  const sections = page.sections ?? []
  const outline = legalOutline(sections)
  const pdf = typeof page.pdf === 'object' ? (page.pdf as Media | null) : null

  return (
    <>
      <div className={styles.hero}>
        <Breadcrumb
          items={[{ label: about('breadcrumb'), href: routes.about() }, { label: page.title }]}
          className={landing.copy}
        />
        <h1 className={[styles.title, landing.rise].join(' ')}>
          {withHighlight(page.title, page.highlight)}
        </h1>
        {page.kicker && <p className={[styles.kicker, landing.copy].join(' ')}>{page.kicker}</p>}
      </div>
      <div className={styles.body}>
        <div className={styles.contents}>
          <ArticleContents items={outline} labels={{ contents: t('contents') }} />
        </div>
        <div className={styles.text}>
          {sections.map((section, i) => (
            <section key={section.id ?? i} className={styles.section}>
              <h2 id={outline[i].id} className={styles.h2}>
                {section.heading}
              </h2>
              <LegalText body={section.body} caption={section.heading} />
            </section>
          ))}
          {(page.updatedOn || pdf?.url) && (
            <div className={styles.meta}>
              {page.updatedOn && (
                <p className={styles.updated}>
                  {t('updated', { date: formatDateNumeric(page.updatedOn) })}
                </p>
              )}
              {pdf?.url && (
                <Button href={pdf.url} variant="link" download>
                  {t('downloadPdf')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
