import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { GlobeSlot } from '@/components/contact/GlobeSlot'
import { LocationGrid } from '@/components/contact/LocationGrid'
import { OfficeCard } from '@/components/contact/OfficeCard'
import { PageHero } from '@/components/patterns/PageHero'
import { Sticker } from '@/components/visuals/Sticker'
import { Wizard } from '@/components/wizard/Wizard'
import { getContact, getCourse, getOffices, getSite, getTranslationLanguages } from '@/lib/cms'
import { topicFromQuery } from '@/lib/inquiries'
import { groupOffices, locationAnchorOf } from '@/lib/office-groups'
import { queryParams, routes } from '@/lib/routes'
import { slugify } from '@/lib/slug'
import styles from './page.module.css'
import { pageMetadata } from '@/lib/seo'

// Contact (119:1795 / 121:1145; the body is Option A, 513:2 / 515:63, docs/contact-offices.md):
// the hero, the wizard beside the offices, and «Как да ни намерите». The wizard keeps its own
// height; offices at one address share a card; from 1024px a globe takes the room left under
// the wizard. Links preselect the wizard: ?tema= (the topic), &kurs= (a course), &ot= / &na=
// (the language pair from «Изпратете документ»).

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContact()
  return pageMetadata({
    title: contact.hero?.title ?? '',
    description: contact.hero?.lead,
    path: routes.contact(),
    meta: contact.meta,
  })
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export default async function ContactPage({ searchParams }: PageProps<'/kontakti'>) {
  const params = await searchParams
  const [contact, offices, site, languages, t] = await Promise.all([
    getContact(),
    getOffices(),
    getSite(),
    getTranslationLanguages(),
    getTranslations(),
  ])
  const topic = topicFromQuery(params[queryParams.topic])
  const courseSlug = first(params[queryParams.course])
  const course = courseSlug ? await getCourse(courseSlug) : null
  const languageOf = (slug?: string) => languages.find((name) => slug && slugify(name) === slug)
  const bank =
    site.bank?.iban && site.bank.bic && site.bank.name
      ? t('contact.iban', { iban: site.bank.iban, bic: site.bank.bic, bank: site.bank.name })
      : undefined
  // Offices at one address share a card, under the heading of that address's Location card
  // (the Contact global). Without that location they stay separate cards.
  type Card = { offices: typeof offices; heading?: { kicker?: string | null; title: string } }
  const cards = groupOffices(offices).flatMap((group): Card[] => {
    const location = (contact.locations ?? []).find(
      ({ anchor }) => anchor === locationAnchorOf(group[0].role),
    )
    return group.length > 1 && location
      ? [{ offices: group, heading: { kicker: location.kicker, title: location.street } }]
      : group.map((office) => ({ offices: [office] }))
  })

  return (
    <>
      <PageHero
        breadcrumb={[{ label: t('contact.breadcrumb') }]}
        title={contact.hero?.title ?? t('contact.breadcrumb')}
        highlight={contact.hero?.highlight}
        lead={contact.hero?.lead}
        aside={<Sticker topic="contact" sizes="231px" className={styles.sticker} eager />}
      />
      <div className={styles.body}>
        <div className={styles.main}>
          <Wizard
            initialTopic={topic ?? (course ? 'course' : undefined)}
            initialCourse={course ?? undefined}
            initialPair={{
              from: languageOf(first(params[queryParams.from])),
              to: languageOf(first(params[queryParams.to])),
            }}
            sourcePage={routes.contact()}
          />
          <GlobeSlot />
        </div>
        <section className={styles.offices} aria-labelledby="offices-title">
          <h2 id="offices-title" className={styles.officesTitle}>
            {t('contact.offices')}
          </h2>
          {cards.map((card) => (
            <OfficeCard
              key={card.offices[0].id}
              offices={card.offices}
              heading={card.heading}
              bank={card.offices.some((office) => office.role === 'courses') ? bank : undefined}
            />
          ))}
        </section>
      </div>
      {(contact.locations ?? []).length > 0 && (
        <section className={styles.locations} aria-labelledby="locations-title">
          <div className={styles.locationsInner}>
            <h2 id="locations-title" className={styles.locationsTitle}>
              {t('contact.locations')}
            </h2>
            <LocationGrid locations={contact.locations!} />
          </div>
        </section>
      )}
    </>
  )
}
