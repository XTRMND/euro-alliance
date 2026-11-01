import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { InquiryBand } from '@/components/shell/InquiryBand'
import { getProgram } from '@/lib/cms'
import type { Program } from '@/payload-types'
import { ProgramActions } from './ProgramActions'
import { ProgramHero } from './ProgramHero'
import { ProgramSections } from './ProgramSections'
import { loadUpcoming, UpcomingCourses } from './UpcomingCourses'

// The page of a program that isn't a language (Vouchers 236:3391, Professions 236:3667, Teachers
// 237:3686, Farmers 237:3973, Computer courses 258:3937): the course-page hero, the program's
// upcoming courses and its sections. A missing or unpublished program is a 404.

type ProgramType = Exclude<Program['type'], 'language'>

export async function programMetadata(type: ProgramType): Promise<Metadata> {
  const program = await getProgram(type)
  if (!program) return {}
  return { title: program.title, description: program.hero.lead ?? undefined }
}

export async function ProgramPage({
  type,
  breadcrumb,
}: {
  type: ProgramType
  /** The crumbs between «Начало» and the page. */
  breadcrumb?: { label: string; href?: string }[]
}) {
  const program = await getProgram(type)
  if (!program) notFound()
  const [upcoming, t] = await Promise.all([loadUpcoming(program), getTranslations()])

  return (
    <>
      <ProgramHero
        program={program}
        breadcrumb={[...(breadcrumb ?? []), { label: t(`program.pages.${type}`) }]}
        actions={<ProgramActions program={program} upcoming={upcoming} />}
      />
      <UpcomingCourses program={program} upcoming={upcoming} />
      <ProgramSections sections={program.sections} />
      <InquiryBand />
    </>
  )
}
