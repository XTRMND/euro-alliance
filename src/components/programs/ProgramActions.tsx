import { Button } from '@/components/ui/Button'
import { programCtaHref } from '@/lib/programs'
import type { Program } from '@/payload-types'
import type { Upcoming } from './UpcomingCourses'
import { VoucherApplyButton } from './VoucherApplyButton'

// A program hero's buttons: the first is the primary button, the second a link button. A button
// without a destination isn't shown.
export function ProgramActions({ program, upcoming }: { program: Program; upcoming: Upcoming }) {
  return (program.hero.ctas ?? []).map((cta, i) => {
    const href = programCtaHref(cta, upcoming)
    const variant = i === 0 ? 'primary' : 'link'
    if (!href) return null
    return cta.destination === 'voucherInquiry' ? (
      <VoucherApplyButton key={cta.id ?? i} href={href} label={cta.label} variant={variant} />
    ) : (
      <Button key={cta.id ?? i} href={href} variant={variant}>
        {cta.label}
      </Button>
    )
  })
}
