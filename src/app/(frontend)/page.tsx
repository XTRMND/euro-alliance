import { HomeHero } from '@/components/home/HomeHero'
import { LatestNews } from '@/components/home/LatestNews'
import { Partners } from '@/components/home/Partners'
import { ProgramIndex } from '@/components/home/ProgramIndex'
import { UpcomingCourses } from '@/components/home/UpcomingCourses'
import { SendDocument } from '@/components/sections/SendDocument'
import { InquiryBand } from '@/components/shell/InquiryBand'
import { LanguageStrip } from '@/components/visuals/LanguageStrip'
import { hrefOf } from '@/lib/destinations'
import { getHome, getLatestNews, getTranslationLanguages, getUpcomingCourses } from '@/lib/cms'
import styles from './page.module.css'

// Home (48:184 / 115:233). Every section hides when its content is empty (CLAUDE.md § 3).

export default async function HomePage() {
  const home = await getHome()
  const [courses, news, languages] = await Promise.all([
    getUpcomingCourses(),
    getLatestNews(home.news?.count ?? 3),
    getTranslationLanguages(),
  ])
  const translations = home.translations
  const ctaDestination = translations?.cta?.destination

  return (
    <>
      <HomeHero hero={home.hero} />
      <LanguageStrip />
      {home.upcoming?.title && courses.length > 0 && (
        <div className={styles.deferred}>
          <UpcomingCourses title={home.upcoming.title} courses={courses} />
        </div>
      )}
      <InquiryBand />
      <div className={styles.deferred}>
        <ProgramIndex programs={home.programs} />
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
