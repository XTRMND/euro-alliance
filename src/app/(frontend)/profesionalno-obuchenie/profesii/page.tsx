import { getTranslations } from 'next-intl/server'
import { ProgramPage, programMetadata } from '@/components/programs/ProgramPage'

// Професии и специалности, the ЦПО (236:3667 / 249:3659).

export const generateMetadata = () => programMetadata('vocational')

export default async function ProfessionsPage() {
  const t = await getTranslations()
  return <ProgramPage type="vocational" breadcrumb={[{ label: t('program.vocational') }]} />
}
