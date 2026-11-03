import type { Metadata } from 'next'
import { AboutIsland } from '@/components/home/AboutIsland'
import { HomeHero } from '@/components/home/HomeHero'
import { LatestNews } from '@/components/home/LatestNews'
import { Partners } from '@/components/home/Partners'
import { ProgramIndex } from '@/components/home/ProgramIndex'
import { UpcomingCourses, upcomingCourses } from '@/components/home/UpcomingCourses'
import { SendDocument } from '@/components/sections/SendDocument'
import { InquiryBand } from '@/components/shell/InquiryBand'
import { LanguageStrip } from '@/components/visuals/LanguageStrip'
import { hrefOf } from '@/lib/destinations'
import {
  getHome,
  getLatestNews,
  getOffices,
  getSite,
  getTranslationLanguages,
  getAllCourses,
} from '@/lib/cms'
import styles from './page.module.css'
import { routes } from '@/lib/routes'
import { pageMetadata } from '@/lib/seo'
import { startOfTodayInSofia } from '@/lib/format'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationLd } from '@/lib/structured-data'

// Home (48:184 / 115:233). Every section hides when its content is empty (CLAUDE.md § 3).

export async function generateMetadata(): Promise<Metadata> {
  const [home, site] = await Promise.all([getHome(), getSite()])
  const metadata = await pageMetadata({
    title: home.hero.heading,
    description: home.hero.lead,
    path: routes.home(),
    image: home.hero.photo,
    meta: home.meta,
  })
  // The layout's «… | Евро Алианс» template skips the page beside it: the homepage says it itself.
  return { ...metadata, title: { absolute: `${metadata.title} | ${site.name || 'Евро Алианс'}` } }
}

export default async function HomePage() {
  const home = await getHome()
  const [courses, news, languages, site, offices] = await Promise.all([
    getAllCourses(),
    getLatestNews(home.news?.count ?? 3),
    getTranslationLanguages(),
    getSite(),
    getOffices(),
  ])
  const translations = home.translations
  const ctaDestination = translations?.cta?.destination

  return (
    <>
      <JsonLd data={organizationLd(site, offices)} />
      <HomeHero hero={home.hero} />
      <LanguageStrip />
      {home.upcoming?.title && upcomingCourses(courses, startOfTodayInSofia()).length > 0 && (
        <div className={styles.deferred}>
          <UpcomingCourses title={home.upcoming.title} courses={courses} />
        </div>
      )}
      <InquiryBand />
      <div className={styles.deferred}>
        <ProgramIndex programs={home.programs} />
        <AboutIsland about={home.about} />
        {translations?.title && (
          <SendDocument
            id="translations-title"
            title={translations.title}
            lead={translations.lead}
            steps={(translations.steps ?? []).map((step) => step.text)}
            languages={languages}
            cta={
              translations.cta?.label
                ? {
                    label: translations.cta.label,
                    // The wizard link carries the chosen languages; any other target is plain.
                    href: ctaDestination === 'sendDocument' ? undefined : hrefOf(ctaDestination),
                  }
                : undefined
            }
          />
        )}
        {home.news?.title && <LatestNews title={home.news.title} news={news} />}
        <Partners partners={home.partners} />
      </div>
    </>
  )
}
