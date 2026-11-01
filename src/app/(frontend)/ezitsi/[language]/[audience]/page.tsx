import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { AudienceTabs } from '@/components/programs/AudienceTabs'
import { LanguageHero } from '@/components/programs/LanguageHero'
import { ProgramActions } from '@/components/programs/ProgramActions'
import { ProgramSections } from '@/components/programs/ProgramSections'
import { loadUpcoming, UpcomingCourses } from '@/components/programs/UpcomingCourses'
import { InquiryBand } from '@/components/shell/InquiryBand'
import { getLanguageProgram } from '@/lib/cms'
import {
  audienceFromSegment,
  hasLanguagePage,
  languageFromSegment,
  otherAudience,
} from '@/lib/programs'
import { routes } from '@/lib/routes'

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

export default async function LanguageProgramPage({ params }: Params) {
  const found = await load(params)
  if (!found) notFound()
  const { program, language, audience } = found

  const [upcoming, t] = await Promise.all([loadUpcoming(program), getTranslations()])
  const other = otherAudience(language, audience)

  return (
    <>
      <LanguageHero
        program={program}
        language={language}
        breadcrumb={[
          { label: t('program.languages'), href: routes.courses('languages') },
          { label: t(`languages.${language}`) },
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
        actions={<ProgramActions program={program} upcoming={upcoming} />}
      />
      <UpcomingCourses program={program} upcoming={upcoming} />
      <ProgramSections sections={program.sections} />
      <InquiryBand />
    </>
  )
}
