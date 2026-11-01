import { ProgramPage, programMetadata } from '@/components/programs/ProgramPage'

// Преводи и легализация, the translation agency (171:2511 / 175:2005).

export const generateMetadata = () => programMetadata('translations')

export default function TranslationsPage() {
  return <ProgramPage type="translations" />
}
