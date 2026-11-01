import { RichText } from '@payloadcms/richtext-lexical/react'
import { CalloutBand } from '@/components/patterns/CalloutBand'
import { CardGrid } from '@/components/patterns/CardGrid'
import { FigureCard } from '@/components/patterns/FigureCard'
import { SectionHeading } from '@/components/patterns/SectionHeading'
import { SwipeRow } from '@/components/patterns/SwipeRow'
import { Button } from '@/components/ui/Button'
import { hrefOf } from '@/lib/destinations'
import { anchors } from '@/lib/routes'
import type { Certificate, Program, TextbookSystem } from '@/payload-types'
import { CertificateCard } from './CertificateCard'
import { FaqList } from './FaqList'
import { FeatureCard } from './FeatureCard'
import styles from './ProgramSections.module.css'
import { SystemCard } from './SystemCard'

// A program page's sections, from its blocks (docs/cms-schema.md, Programs). Each is a paper
// section with its heading; a section with nothing to show isn't rendered. The certificates
// section is the `#sertifikati` anchor the homepage's «Изпити и сертификати» card links to.

type Section = NonNullable<Program['sections']>[number]

const tilts = [1.2, -0.8, 0.6, -1]
const objects = <T,>(values: (number | T)[] | null | undefined) =>
  (values ?? []).filter((value): value is T => typeof value === 'object' && value !== null)

function Head({
  section,
  id,
}: {
  section: { heading?: string | null; highlight?: string | null; lead?: string | null }
  id: string
}) {
  if (!section.heading) return null
  return (
    <SectionHeading
      id={id}
      title={section.heading}
      highlight={section.highlight}
      lead={section.lead}
    />
  )
}

function SectionContent({ section, index }: { section: Section; index: number }) {
  const id = `section-${index}`
  switch (section.blockType) {
    case 'features': {
      const items = section.items ?? []
      if (items.length === 0) return null
      return (
        <section className={styles.section} aria-labelledby={section.heading ? id : undefined}>
          <Head section={section} id={id} />
          <CardGrid columns={Math.min(Math.max(items.length, 2), 4) as 2 | 3 | 4}>
            {items.map((item, i) => (
              <FeatureCard key={item.id ?? i} index={i + 1} title={item.title} text={item.text} />
            ))}
          </CardGrid>
        </section>
      )
    }
    case 'textbookSystems': {
      const systems = objects<TextbookSystem>(section.systems)
      if (systems.length === 0) return null
      const href = hrefOf(section.link?.destination)
      return (
        <section className={styles.section} aria-labelledby={section.heading ? id : undefined}>
          <Head section={section} id={id} />
          <div className={styles.systems} data-count={Math.min(systems.length, 3)}>
            {systems.map((system) => (
              <SystemCard
                key={system.id}
                system={system}
                columns={section.columns === 'one' ? 'one' : 'two'}
              />
            ))}
          </div>
          {href && section.link?.label && (
            <Button href={href} variant="link" className={styles.after}>
              {section.link.label}
            </Button>
          )}
        </section>
      )
    }
    case 'certificates': {
      const certificates = objects<Certificate>(section.certificates)
      if (certificates.length === 0) return null
      return (
        <section
          id={anchors.certificates}
          className={[styles.section, styles.anchor].join(' ')}
          aria-labelledby={section.heading ? id : undefined}
        >
          <Head section={section} id={id} />
          <SwipeRow
            columns={4}
            itemWidth={260}
            gap={{ column: 28 }}
            focusable
            labelledBy={section.heading ? id : undefined}
            className={styles.certificates}
          >
            {certificates.map((certificate, i) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                tilt={tilts[i % tilts.length]}
              />
            ))}
          </SwipeRow>
        </section>
      )
    }
    case 'faq': {
      const items = section.items ?? []
      if (items.length === 0) return null
      return (
        <section className={styles.section} aria-labelledby={section.heading ? id : undefined}>
          <Head section={section} id={id} />
          <FaqList
            items={items.map((item) => ({
              question: item.question,
              answer: <RichText data={item.answer} disableContainer />,
            }))}
          />
        </section>
      )
    }
    case 'figures': {
      const items = section.items ?? []
      if (items.length === 0) return null
      return (
        <section className={styles.section} aria-labelledby={section.heading ? id : undefined}>
          <Head section={section} id={id} />
          <CardGrid columns={Math.min(Math.max(items.length, 2), 4) as 2 | 3 | 4}>
            {items.map((item, i) => (
              <FigureCard key={item.id ?? i} figure={item.figure} label={item.label} />
            ))}
          </CardGrid>
        </section>
      )
    }
    case 'callout': {
      const href = hrefOf(section.cta?.destination)
      return (
        <section className={styles.section}>
          <CalloutBand
            title={section.heading}
            text={section.text}
            layout={section.layout === 'stack' ? 'stack' : 'row'}
            cta={href && section.cta?.label ? { label: section.cta.label, href } : null}
          />
        </section>
      )
    }
    case 'levels':
    case 'steps': {
      const items = section.items ?? []
      if (items.length === 0) return null
      return (
        <section className={styles.section} aria-labelledby={section.heading ? id : undefined}>
          <Head section={section} id={id} />
          <ol className={section.blockType === 'steps' ? styles.steps : styles.levels}>
            {items.map((item, i) => (
              <li key={item.id ?? i} className={styles.listItem}>
                <span className={styles.number}>
                  {section.blockType === 'levels' && 'level' in item ? item.level : i + 1}
                </span>
                <span>
                  {item.title && <strong className={styles.itemTitle}>{item.title}</strong>}
                  {item.text && <span className={styles.itemText}>{item.text}</span>}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )
    }
    case 'richText':
      if (!section.body) return null
      return (
        <section className={styles.section} aria-labelledby={section.heading ? id : undefined}>
          <Head section={section} id={id} />
          <div className={styles.prose}>
            <RichText data={section.body} disableContainer />
          </div>
        </section>
      )
    default:
      return null
  }
}

export function ProgramSections({ sections }: { sections: Program['sections'] }) {
  return (
    <>
      {(sections ?? []).map((section, i) => (
        <SectionContent key={section.id ?? i} section={section} index={i} />
      ))}
    </>
  )
}
