import { getTranslations } from 'next-intl/server'
import { ProgramPage, programMetadata } from '@/components/programs/ProgramPage'

// Обучение за земеделци (237:3973 / 249:4165).

export const generateMetadata = () => programMetadata('farmers')

export default async function FarmersPage() {
  const t = await getTranslations()
  return <ProgramPage type="farmers" breadcrumb={[{ label: t('program.vocational') }]} />
}
