'use client'

import { Button, type ButtonVariant } from '@/components/ui/Button'
import { track } from '@/lib/analytics'

/** A button into the voucher inquiry that reports `voucher_apply_click` (docs/measurement.md). */
export function VoucherApplyButton({
  href,
  label,
  variant = 'primary',
  className,
}: {
  href: string
  label: string
  variant?: ButtonVariant
  className?: string
}) {
  return (
    <Button
      href={href}
      variant={variant}
      className={className}
      onClick={() => track('voucher_apply_click', { destination: 'wizard' })}
    >
      {label}
    </Button>
  )
}
