import { getTranslations } from 'next-intl/server'
import { ProgramPage, programMetadata } from '@/components/programs/ProgramPage'

// Педагогически специалисти (237:3686 / 249:3908).

export const generateMetadata = () => programMetadata('teachers')

export default async function TeachersPage() {
  const t = await getTranslations()
  return <ProgramPage type="teachers" breadcrumb={[{ label: t('program.vocational') }]} />
}
