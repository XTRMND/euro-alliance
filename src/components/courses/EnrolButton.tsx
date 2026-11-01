'use client'

import { Button, type ButtonVariant } from '@/components/ui/Button'
import { type AnalyticsEvents, track } from '@/lib/analytics'

/** An enrol button on a course page: a link to the wizard that reports `enrol_click`. */
export function EnrolButton({
  href,
  label,
  event,
  variant = 'primary',
  className,
}: {
  href: string
  label: string
  /** Null for «Уведоми ме за следващия курс», which isn't an enrolment. */
  event: AnalyticsEvents['enrol_click'] | null
  variant?: ButtonVariant
  className?: string
}) {
  return (
    <Button
      href={href}
      variant={variant}
      className={className}
      onClick={event ? () => track('enrol_click', event) : undefined}
    >
      {label}
    </Button>
  )
}
