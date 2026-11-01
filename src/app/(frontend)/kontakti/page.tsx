import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LocationGrid } from '@/components/contact/LocationGrid'
import { OfficeCard } from '@/components/contact/OfficeCard'
import { PageHero } from '@/components/patterns/PageHero'
import { Sticker } from '@/components/visuals/Sticker'
import { Wizard } from '@/components/wizard/Wizard'
import { getContact, getCourse, getOffices, getSite, getTranslationLanguages } from '@/lib/cms'
import { topicFromQuery } from '@/lib/inquiries'
import { queryParams, routes } from '@/lib/routes'
import { slugify } from '@/lib/slug'
import styles from './page.module.css'
import { pageMetadata } from '@/lib/seo'

// Contact (119:1795 / 121:1145): the hero, the wizard beside the offices, and «Как да ни
// намерите». Links preselect the wizard: ?tema= (the topic), &kurs= (a course), &ot= / &na=
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
        <Wizard
          initialTopic={topic ?? (course ? 'course' : undefined)}
          initialCourse={course ?? undefined}
          initialPair={{
            from: languageOf(first(params[queryParams.from])),
            to: languageOf(first(params[queryParams.to])),
          }}
          sourcePage={routes.contact()}
          className={styles.wizard}
        />
        <section className={styles.offices} aria-labelledby="offices-title">
          <h2 id="offices-title" className={styles.officesTitle}>
            {t('contact.offices')}
          </h2>
          {offices.map((office) => (
            <OfficeCard
              key={office.id}
              office={office}
              bank={office.role === 'courses' ? bank : undefined}
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
