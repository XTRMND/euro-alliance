import { getTranslations } from 'next-intl/server'
import { ProgramPage, programMetadata } from '@/components/programs/ProgramPage'

// Компютърно обучение (258:3937 / 262:3673).

export const generateMetadata = () => programMetadata('computer')

export default async function ComputerCoursesPage() {
  const t = await getTranslations()
  return <ProgramPage type="computer" breadcrumb={[{ label: t('program.vocational') }]} />
}
