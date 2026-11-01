import { getTranslations } from 'next-intl/server'
import { ProgramPage, programMetadata } from '@/components/programs/ProgramPage'

// Обучение с ваучери (236:3391 / 249:3443).

export const generateMetadata = () => programMetadata('vouchers')

export default async function VouchersPage() {
  const t = await getTranslations()
  return <ProgramPage type="vouchers" breadcrumb={[{ label: t('program.vocational') }]} />
}
