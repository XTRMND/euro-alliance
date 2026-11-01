import { InquiryBand } from '@/components/shell/InquiryBand'

// Stub until PR 8 builds the homepage; the inquiry band is here so the shell checks cover it.
export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">Евро Алианс</h1>
      <InquiryBand />
    </>
  )
}
