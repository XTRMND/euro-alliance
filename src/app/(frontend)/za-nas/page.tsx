import type { Metadata } from 'next'
import { getImageProps } from 'next/image'
import { getTranslations } from 'next-intl/server'
import { AboutHero } from '@/components/about/AboutHero'
import { AboutSubnav } from '@/components/about/AboutSubnav'
import { DocumentPhoto } from '@/components/about/DocumentPhoto'
import { Timeline } from '@/components/about/Timeline'
import { FigureCard } from '@/components/patterns/FigureCard'
import { withHighlight } from '@/components/patterns/Highlight'
import { List } from '@/components/patterns/List'
import { Polaroid } from '@/components/patterns/Polaroid'
import { ProjectCard } from '@/components/patterns/ProjectCard'
import { SectionHeading } from '@/components/patterns/SectionHeading'
import { Ticket, ticket } from '@/components/patterns/Ticket'
import { InquiryBand } from '@/components/shell/InquiryBand'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Tape } from '@/components/visuals/Tape'
import { getAbout } from '@/lib/cms'
import { hrefOf } from '@/lib/destinations'
import { aboutSections } from '@/lib/routes'
import type { Document, FundedProject, Media } from '@/payload-types'
import styles from './page.module.css'

// About (190:2677 / 210:2395), from the `about` global: the hero, the subnav, then History, the
// figures, who we train, Team, Standards, the licences, the documents after a course, Projects
// and e-learning. An empty section isn't shown, nor its subnav item.

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout()
  return { title: about.hero?.title ?? undefined, description: about.hero?.lead ?? undefined }
}

const objects = <T,>(values: (number | T)[] | null | undefined) =>
  (values ?? []).filter((value): value is T => typeof value === 'object' && value !== null)

export default async function AboutPage() {
  const [about, t] = await Promise.all([getAbout(), getTranslations('about')])
  const { hero, history, figures, statement, team, standards, licences, documents, projects } =
    about
  const elearning = about.elearning
  const media = (value: unknown) => (typeof value === 'object' ? (value as Media | null) : null)

  const licenceDocs = objects<Document>(licences?.documents)
  const samples = objects<Document>(documents?.samples)
  const projectCards = objects<FundedProject>(projects?.projects)
  const photos = (statement?.photos ?? []).flatMap((item) => {
    const photo = media(item.photo)
    return photo ? [{ photo, caption: item.caption }] : []
  })

  const shown = {
    history: Boolean(history?.heading && history.items?.length),
    team: Boolean(team?.heading),
    standards: Boolean(standards?.heading && standards.groups?.length),
    licences: Boolean(licences?.heading && licenceDocs.length),
    documents: Boolean(documents?.heading && documents.items?.length),
    projects: Boolean(projects?.heading && projectCards.length),
    elearning: Boolean(elearning?.heading && elearning.benefits?.length),
  }
  const subnav = (['history', 'team', 'standards', 'documents', 'projects', 'elearning'] as const)
    .filter((key) => shown[key])
    .map((key) => ({ id: aboutSections[key], label: t(`subnav.${key}`) }))

  const document = (doc: Document, className?: string) => {
    const scan = media(doc.scan)
    if (!scan?.url) return null
    const { props } = getImageProps({
      src: scan.url,
      width: scan.width ?? 220,
      height: scan.height ?? 300,
      sizes: '220px',
      alt: '',
    })
    return (
      <DocumentPhoto
        key={doc.id}
        title={doc.title}
        image={{ src: props.src, srcSet: props.srcSet, width: 220, height: 300 }}
        full={scan.url}
        alt={scan.alt}
        labels={{ open: t('document.open', { title: doc.title }), close: t('document.close') }}
        className={className}
      />
    )
  }

  const link = (value?: { label?: string | null; destination?: string | null } | null) => {
    const href = hrefOf(value?.destination)
    return href && value?.label ? { label: value.label, href } : null
  }
  const primary = link(hero?.primary)
  const secondary = link(hero?.secondary)

  return (
    <>
      <AboutHero
        breadcrumb={[{ label: t('breadcrumb') }]}
        kicker={hero?.kicker}
        title={hero?.title ?? t('breadcrumb')}
        highlight={hero?.highlight}
        lead={hero?.lead}
        photo={media(hero?.photo)}
        actions={
          <>
            {primary && <Button href={primary.href}>{primary.label}</Button>}
            {secondary && (
              <Button href={secondary.href} variant="link">
                {secondary.label}
              </Button>
            )}
          </>
        }
      />
      {subnav.length > 0 && <AboutSubnav label={t('subnav.label')} items={subnav} />}

      {shown.history && (
        <section
          id={aboutSections.history}
          className={styles.section}
          aria-labelledby="about-history"
        >
          <SectionHeading id="about-history" title={history!.heading!} lead={history!.lead} />
          <Timeline items={history!.items!} />
          {history!.closing && <p className={styles.closing}>{history!.closing}</p>}
        </section>
      )}

      {figures?.heading && (figures.items ?? []).length > 0 && (
        <section className={styles.section} aria-labelledby="about-figures">
          <SectionHeading id="about-figures" title={figures.heading} />
          <div className={styles.figures}>
            {figures.items!.map((item, i) => (
              <FigureCard key={item.id ?? i} figure={item.figure} label={item.label} />
            ))}
          </div>
        </section>
      )}

      {statement?.before && (
        <section className={[styles.section, styles.statement].join(' ')}>
          <div className={styles.statementText}>
            <h2 className={styles.statementTitle}>
              {withHighlight(
                [statement.before, statement.highlight, statement.after].filter(Boolean).join(' '),
                statement.highlight,
              )}
            </h2>
            {(statement.audiences ?? []).length > 0 && (
              <p className={styles.audiences}>
                {statement.audiences!.map((item) => item.text).join('  ·  ')}
              </p>
            )}
            {statement.note && <p className={styles.note}>{statement.note}</p>}
          </div>
          {photos.length > 0 && (
            <div className={styles.collage}>
              {photos.map((item, i) => (
                <Polaroid
                  key={i}
                  photo={item.photo}
                  caption={item.caption}
                  className={styles.polaroid}
                />
              ))}
              <Tape className={styles.collageTape} />
            </div>
          )}
        </section>
      )}

      {shown.team && (
        <section id={aboutSections.team} className={styles.section} aria-labelledby="about-team">
          <SectionHeading id="about-team" kicker={team!.kicker} title={team!.heading!} />
          {team!.quote && <p className={styles.quote}>{team!.quote}</p>}
          {(team!.values ?? []).length > 0 && (
            <div className={styles.values}>
              {team!.values!.map((value, i) => (
                <div key={value.id ?? i}>
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                  {value.text && <p className={styles.valueText}>{value.text}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {shown.standards && (
        <section
          id={aboutSections.standards}
          className={styles.section}
          aria-labelledby="about-standards"
        >
          <SectionHeading
            id="about-standards"
            kicker={standards!.kicker}
            title={standards!.heading!}
            lead={standards!.lead}
          />
          <Ticket
            headingLevel="h3"
            groups={standards!.groups!.map((group) => ({
              title: group.title,
              fields: (group.fields ?? []).map((field) => ({
                label: field.label,
                value: field.value,
              })),
            }))}
            stubClassName={styles.stub}
            stub={
              <>
                {standards!.stub?.label && <p className={ticket.label}>{standards!.stub.label}</p>}
                {standards!.stub?.title && (
                  <p className={styles.stubTitle}>{standards!.stub.title}</p>
                )}
                {standards!.stub?.chip && (
                  <span className={styles.stubChip}>{standards!.stub.chip}</span>
                )}
                {standards!.stub?.buttonLabel && shown.licences && (
                  <Button href={`#${aboutSections.licences}`}>{standards!.stub.buttonLabel}</Button>
                )}
                {standards!.stub?.note && <p className={styles.stubNote}>{standards!.stub.note}</p>}
              </>
            }
          />
        </section>
      )}

      {shown.licences && (
        <section
          id={aboutSections.licences}
          className={styles.section}
          aria-labelledby="about-licences"
        >
          <SectionHeading
            id="about-licences"
            kicker={licences!.kicker}
            title={licences!.heading!}
            lead={licences!.lead}
          />
          <div className={styles.wall}>{licenceDocs.map((doc) => document(doc))}</div>
          {(licences!.links ?? []).length > 0 && (
            <div className={styles.links}>
              {licences!.links!.map((item, i) => {
                const target = link(item)
                return target ? (
                  <Button key={item.id ?? i} href={target.href} variant="link">
                    {target.label}
                  </Button>
                ) : null
              })}
            </div>
          )}
        </section>
      )}

      {shown.documents && (
        <section
          id={aboutSections.documents}
          className={[styles.section, styles.split].join(' ')}
          aria-labelledby="about-documents"
        >
          <div className={styles.splitText}>
            <SectionHeading
              id="about-documents"
              kicker={documents!.kicker}
              title={documents!.heading!}
            />
            <div>
              <List
                marker="number"
                items={documents!.items!.map((item) => ({ text: item.text }))}
              />
              {(documents!.fees?.text || documents!.fees?.duplicate || documents!.fees?.note) && (
                <div className={styles.fees}>
                  {documents!.fees.text && (
                    <p className={styles.feesText}>{documents!.fees.text}</p>
                  )}
                  {documents!.fees.duplicate && <p>{documents!.fees.duplicate}</p>}
                  {documents!.fees.note && (
                    <p className={styles.feesNote}>{documents!.fees.note}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          {samples.length > 0 && (
            <div className={styles.fan}>{samples.map((doc) => document(doc, styles.fanItem))}</div>
          )}
        </section>
      )}

      {shown.projects && (
        <section
          id={aboutSections.projects}
          className={styles.section}
          aria-labelledby="about-projects"
        >
          <SectionHeading
            id="about-projects"
            kicker={projects!.kicker}
            title={projects!.heading!}
          />
          <div className={styles.projects}>
            {projectCards.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                facts={(project.facts ?? []).map(({ label, value }) => ({ label, value }))}
                goals={(project.goals ?? []).map(({ goal }) => goal)}
                logoStrip={media(project.logoStrip)}
              />
            ))}
          </div>
        </section>
      )}

      {shown.elearning && (
        <section
          id={aboutSections.elearning}
          className={[styles.section, styles.split, styles.elearning].join(' ')}
          aria-labelledby="about-elearning"
        >
          <div className={styles.splitText}>
            <SectionHeading
              id="about-elearning"
              kicker={elearning!.kicker}
              title={elearning!.heading!}
              lead={elearning!.lead}
            />
            <List
              marker="number"
              items={elearning!.benefits!.map((item) => ({ text: item.text }))}
            />
          </div>
          {(elearning!.platforms ?? []).length > 0 && (
            <div className={styles.platforms}>
              {elearning!.platformsTitle && (
                <h3 className={styles.platformsTitle}>{elearning!.platformsTitle}</h3>
              )}
              <ul className={styles.chips}>
                {elearning!.platforms!.map((platform, i) => (
                  <li key={platform.id ?? i}>
                    <Chip filled>{platform.name}</Chip>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
      <InquiryBand />
    </>
  )
}
