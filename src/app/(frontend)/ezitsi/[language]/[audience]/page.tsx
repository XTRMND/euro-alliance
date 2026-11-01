import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { CourseCard } from '@/components/cards/CourseCard'
import { SectionHeading } from '@/components/patterns/SectionHeading'
import { SwipeRow } from '@/components/patterns/SwipeRow'
import { AudienceTabs } from '@/components/programs/AudienceTabs'
import { LanguageHero } from '@/components/programs/LanguageHero'
import { ProgramSections } from '@/components/programs/ProgramSections'
import { InquiryBand } from '@/components/shell/InquiryBand'
import { Button } from '@/components/ui/Button'
import { getLanguageProgram, getListedCourses } from '@/lib/cms'
import { courseFiltersQuery, emptyCourseFilters } from '@/lib/course-filters'
import { hrefOf } from '@/lib/destinations'
import {
  audienceFromSegment,
  hasLanguagePage,
  languageFromSegment,
  otherAudience,
} from '@/lib/programs'
import { routes } from '@/lib/routes'
import styles from './page.module.css'

// A language program (English adults 130:1993 / 147:1317, students 159:1993 / 166:1701): one
// template for every language and audience, filled from the CMS. Unpublished or missing
// programs are a 404. The upcoming courses come from Courses (this language and audience).

type Params = PageProps<'/ezitsi/[language]/[audience]'>

async function load(params: Params['params']) {
  const { language: languageSegment, audience: audienceSegment } = await params
  const language = languageFromSegment(languageSegment)
  const audience = audienceFromSegment(audienceSegment)
  if (!language || !audience || !hasLanguagePage(language, audience)) return null
  const program = await getLanguageProgram(language, audience)
  return program ? { program, language, audience } : null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await load(params)
  if (!found) return {}
  return { title: found.program.title, description: found.program.hero.lead ?? undefined }
}

const upcomingId = 'predstoyashti-kursove'

export default async function LanguageProgramPage({ params }: Params) {
  const found = await load(params)
  if (!found) notFound()
  const { program, language, audience } = found

  const filters = { ...emptyCourseFilters, language: [language], audience: [audience], shown: 9 }
  const [{ docs: courses }, t] = await Promise.all([getListedCourses(filters), getTranslations()])
  const listing = `${routes.courses()}${courseFiltersQuery(filters).replace(/&?pokazani=\d+/, '')}`
  const other = otherAudience(language, audience)
  const languageName = t(`languages.${language}`)

  const href = (destination?: string | null) =>
    destination === 'languageCourses'
      ? courses.length > 0
        ? `#${upcomingId}`
        : listing
      : hrefOf(destination)

  return (
    <>
      <LanguageHero
        program={program}
        language={language}
        breadcrumb={[
          { label: t('program.languages'), href: routes.courses('languages') },
          { label: languageName },
        ]}
        tabs={
          <AudienceTabs
            label={t('program.audienceLabel')}
            tabs={
              other
                ? (['adults', 'students'] as const).map((value) => ({
                    label: t(`program.audience.${value}`),
                    href: routes.languageProgram(language, value as 'students'),
                    current: value === audience,
                  }))
                : []
            }
          />
        }
        actions={(program.hero.ctas ?? []).flatMap((cta, i) => {
          const target = href(cta.destination)
          return target ? (
            <Button key={cta.id ?? i} href={target} variant={i === 0 ? 'primary' : 'link'}>
              {cta.label}
            </Button>
          ) : (
            []
          )
        })}
      />
      {courses.length > 0 && (
        <section
          id={upcomingId}
          className={styles.upcoming}
          aria-labelledby={`${upcomingId}-title`}
        >
          {program.upcoming?.heading && (
            <SectionHeading id={`${upcomingId}-title`} title={program.upcoming.heading} />
          )}
          <SwipeRow columns={4} itemWidth={280} className={styles.courses}>
            {courses.slice(0, 4).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </SwipeRow>
          {program.upcoming?.linkLabel && (
            <Button href={listing} variant="link" className={styles.all}>
              {program.upcoming.linkLabel}
            </Button>
          )}
        </section>
      )}
      <ProgramSections sections={program.sections} />
      <InquiryBand />
    </>
  )
}
