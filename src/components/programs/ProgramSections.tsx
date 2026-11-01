import { RichText } from '@payloadcms/richtext-lexical/react'
import { LocationGrid } from '@/components/contact/LocationGrid'
import { CalloutBand } from '@/components/patterns/CalloutBand'
import { CardGrid } from '@/components/patterns/CardGrid'
import { FigureCard } from '@/components/patterns/FigureCard'
import { List } from '@/components/patterns/List'
import { ProjectCard } from '@/components/patterns/ProjectCard'
import { SectionHeading } from '@/components/patterns/SectionHeading'
import { SwipeRow } from '@/components/patterns/SwipeRow'
import { PageCounterBox } from '@/components/sections/PageCounterBox'
import { SendDocument } from '@/components/sections/SendDocument'
import { Button } from '@/components/ui/Button'
import {
  getContact,
  getProfessions,
  getTeacherProgrammes,
  getTranslationLanguages,
} from '@/lib/cms'
import { hrefOf } from '@/lib/destinations'
import { groupByDirection, groupInOrder } from '@/lib/programs'
import { anchors } from '@/lib/routes'
import type { Certificate, FundedProject, Program, TextbookSystem } from '@/payload-types'
import { CertificateCard } from './CertificateCard'
import { ChecklistPanel } from './ChecklistPanel'
import { ExamsTable } from './ExamsTable'
import { FaqList } from './FaqList'
import { FeatureCard } from './FeatureCard'
import { IndexCardsGrid } from './IndexCardsGrid'
import { ProfessionsList } from './ProfessionsList'
import styles from './ProgramSections.module.css'
import { SystemCard, type SystemCardData } from './SystemCard'
import { TeacherProgrammesList } from './TeacherProgrammesList'
import { VoucherApplyButton } from './VoucherApplyButton'

// A program page's sections, from its blocks (docs/cms-schema.md, Programs). Each is a paper
// section with its heading; a section with nothing to show isn't rendered. A section with an
// anchor takes it as its id (the hero's «Как да кандидатствате» links there); the certificates
// section is always `#sertifikati`, where the homepage's «Изпити и сертификати» card links.

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

/** The ЦПО professions; without any, no section. */
async function ProfessionsSection({ section, id }: { section: Section; id: string }) {
  const directions = groupByDirection(await getProfessions())
  if (directions.length === 0) return null
  return (
    <Wrap section={section} id={id}>
      {'heading' in section && <Head section={section} id={id} />}
      <ProfessionsList directions={directions} />
    </Wrap>
  )
}

/** The programmes for pedagogical specialists by theme; without any, no section. */
async function TeacherProgrammesSection({ section, id }: { section: Section; id: string }) {
  const themes = groupInOrder(await getTeacherProgrammes(), (programme) => programme.theme)
  if (themes.length === 0) return null
  return (
    <Wrap section={section} id={id}>
      {'heading' in section && <Head section={section} id={id} />}
      <TeacherProgrammesList themes={themes} />
    </Wrap>
  )
}

/** «Изпратете документ» on paper, with the languages of the Translation global. */
async function SendDocumentSection({ section, id }: { section: Section; id: string }) {
  if (section.blockType !== 'sendDocument') return null
  const languages = await getTranslationLanguages()
  return (
    <SendDocument
      id={id}
      anchor={section.anchor ?? undefined}
      tone="paper"
      artOnMobileOnly={section.dropzoneArt === 'mobile'}
      title={section.heading}
      lead={section.lead}
      steps={(section.steps ?? []).map((step) => step.text)}
      languages={languages}
      cta={section.buttonLabel ? { label: section.buttonLabel } : undefined}
    />
  )
}

/** The offices' Location cards from the Contact global; without any, no section. */
async function LocationsSection({ section, id }: { section: Section; id: string }) {
  const locations = (await getContact()).locations ?? []
  if (locations.length === 0) return null
  return (
    <Wrap section={section} id={id}>
      {'heading' in section && <Head section={section} id={id} />}
      <LocationGrid locations={locations} />
    </Wrap>
  )
}

/** A callout's button; one into the voucher inquiry reports its click. */
function calloutButton(
  cta: { label?: string | null; destination?: string | null } | null | undefined,
) {
  const href = hrefOf(cta?.destination)
  if (!href || !cta?.label) return { cta: null }
  return cta.destination === 'voucherInquiry'
    ? { action: <VoucherApplyButton href={href} label={cta.label} variant="accent" /> }
    : { cta: { label: cta.label, href } }
}

/** The section element: its anchor as the id, named by its heading. */
function Wrap({
  section,
  id,
  anchor,
  className,
  children,
}: {
  section: Section
  id: string
  anchor?: string
  className?: string
  children: React.ReactNode
}) {
  const target = anchor ?? ('anchor' in section ? section.anchor : null) ?? undefined
  const heading = 'heading' in section ? section.heading : null
  return (
    <section
      id={target}
      className={[styles.section, target && styles.anchor, className].filter(Boolean).join(' ')}
      aria-labelledby={heading ? id : undefined}
    >
      {children}
    </section>
  )
}

function SectionContent({ section, index }: { section: Section; index: number }) {
  const id = `section-${index}`
  switch (section.blockType) {
    case 'features': {
      const items = section.items ?? []
      if (items.length === 0) return null
      return (
        <Wrap section={section} id={id}>
          <Head section={section} id={id} />
          <CardGrid columns={Math.min(Math.max(items.length, 2), 4) as 2 | 3 | 4}>
            {items.map((item, i) => (
              <FeatureCard key={item.id ?? i} index={i + 1} title={item.title} text={item.text} />
            ))}
          </CardGrid>
          {section.callout?.heading && (
            <CalloutBand
              title={section.callout.heading}
              text={section.callout.text}
              headingLevel="h3"
              {...calloutButton(section.callout.cta)}
            />
          )}
        </Wrap>
      )
    }
    case 'textbookSystems':
    case 'systemCards': {
      const cards: (SystemCardData & { id?: string | number | null })[] =
        section.blockType === 'textbookSystems'
          ? objects<TextbookSystem>(section.systems)
          : (section.cards ?? [])
      if (cards.length === 0) return null
      const href = hrefOf(section.link?.destination)
      return (
        <Wrap section={section} id={id}>
          <Head section={section} id={id} />
          <div className={styles.systems} data-count={Math.min(cards.length, 3)}>
            {cards.map((card, i) => (
              <SystemCard
                key={card.id ?? i}
                system={card}
                columns={section.columns === 'one' ? 'one' : 'two'}
              />
            ))}
          </div>
          {href && section.link?.label && (
            <Button href={href} variant="link" className={styles.after}>
              {section.link.label}
            </Button>
          )}
        </Wrap>
      )
    }
    case 'certificates': {
      const certificates = objects<Certificate>(section.certificates)
      if (certificates.length === 0) return null
      return (
        <Wrap section={section} id={id} anchor={anchors.certificates}>
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
        </Wrap>
      )
    }
    case 'professions':
      return <ProfessionsSection section={section} id={id} />
    case 'indexCards': {
      const cards = (section.cards ?? []).filter((card) => (card.rows ?? []).length > 0)
      const checklist = (section.checklist?.items ?? []).map((item) => item.text)
      if (cards.length === 0 && checklist.length === 0) return null
      return (
        <Wrap section={section} id={id}>
          <Head section={section} id={id} />
          {cards.length > 0 && <IndexCardsGrid cards={cards} />}
          {checklist.length > 0 && (
            <ChecklistPanel title={section.checklist?.title} items={checklist} />
          )}
        </Wrap>
      )
    }
    case 'projects': {
      const projects = objects<FundedProject>(section.projects)
      if (projects.length === 0) return null
      return (
        <Wrap section={section} id={id} className={styles.beside}>
          <Head section={section} id={id} />
          <div className={styles.projects}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                facts={(project.facts ?? []).map(({ label, value }) => ({ label, value }))}
                goals={(project.goals ?? []).map(({ goal }) => goal)}
                logoStrip={typeof project.logoStrip === 'object' ? project.logoStrip : null}
              />
            ))}
          </div>
        </Wrap>
      )
    }
    case 'sendDocument':
      return <SendDocumentSection section={section} id={id} />
    case 'priceFactors': {
      const items = section.items ?? []
      return (
        <Wrap section={section} id={id} className={styles.beside}>
          <div className={styles.factors}>
            <Head section={section} id={id} />
            {items.length > 0 && (
              <List
                marker="number"
                className={styles.factorList}
                items={items.map((item) => ({
                  text: (
                    <>
                      <strong className={styles.itemTitle}>{item.title}</strong>
                      {item.text && <span className={styles.itemText}>{item.text}</span>}
                    </>
                  ),
                }))}
              />
            )}
          </div>
          {section.counter && <PageCounterBox />}
        </Wrap>
      )
    }
    case 'faqColumns': {
      const columns = (section.columns ?? []).filter((column) => (column.items ?? []).length > 0)
      if (columns.length === 0) return null
      return (
        <section className={[styles.section, styles.faqColumns].join(' ')}>
          {columns.map((column, i) => (
            <div
              key={column.id ?? i}
              id={column.anchor ?? undefined}
              className={[styles.faqColumn, column.anchor && styles.anchor]
                .filter(Boolean)
                .join(' ')}
            >
              <h2 className={styles.columnTitle}>{column.heading}</h2>
              <FaqList
                items={(column.items ?? []).map((item) => ({
                  question: item.question,
                  answer: <RichText data={item.answer} disableContainer />,
                }))}
              />
              {column.note && <p className={styles.note}>{column.note}</p>}
            </div>
          ))}
        </section>
      )
    }
    case 'locations':
      return <LocationsSection section={section} id={id} />
    case 'teacherProgrammes':
      return <TeacherProgrammesSection section={section} id={id} />
    case 'exams':
      return (
        <Wrap section={section} id={id}>
          <Head section={section} id={id} />
          <ExamsTable caption={section.heading ?? ''} />
        </Wrap>
      )
    case 'faq': {
      const items = section.items ?? []
      if (items.length === 0) return null
      return (
        <Wrap section={section} id={id}>
          <Head section={section} id={id} />
          <FaqList
            items={items.map((item) => ({
              question: item.question,
              answer: <RichText data={item.answer} disableContainer />,
            }))}
          />
        </Wrap>
      )
    }
    case 'figures': {
      const items = section.items ?? []
      if (items.length === 0) return null
      return (
        <Wrap section={section} id={id}>
          <Head section={section} id={id} />
          <CardGrid
            columns={Math.min(Math.max(items.length, 2), 4) as 2 | 3 | 4}
            className={styles.figures}
          >
            {items.map((item, i) => (
              <FigureCard key={item.id ?? i} figure={item.figure} label={item.label} />
            ))}
          </CardGrid>
          {section.note && <p className={styles.figuresNote}>{section.note}</p>}
        </Wrap>
      )
    }
    case 'callout':
      return (
        <section className={styles.section}>
          <CalloutBand
            title={section.heading}
            text={section.text}
            layout={section.layout === 'stack' ? 'stack' : 'row'}
            {...calloutButton(section.cta)}
          />
        </section>
      )
    case 'levels':
    case 'steps': {
      const items = section.items ?? []
      if (items.length === 0) return null
      const callout = section.blockType === 'steps' ? section.callout : null
      return (
        <Wrap section={section} id={id}>
          <Head section={section} id={id} />
          {callout?.heading && (
            <CalloutBand
              title={callout.heading}
              text={callout.text}
              headingLevel="h3"
              {...calloutButton(callout.cta)}
            />
          )}
          <ol className={styles.steps}>
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
          {section.blockType === 'steps' && section.note && (
            <p className={styles.note}>{section.note}</p>
          )}
        </Wrap>
      )
    }
    case 'richText':
      if (!section.body) return null
      return (
        <Wrap section={section} id={id}>
          <Head section={section} id={id} />
          <div className={styles.prose}>
            <RichText data={section.body} disableContainer />
          </div>
        </Wrap>
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
