'use client'

import { Button } from '@/components/ui/Button'
import { type Pair, usePair, wizardHref } from './send-document-pair'

/** «Изпрати документ за превод»: the contact wizard, carrying the chosen language pair. */
export function SendDocumentLink({
  label,
  initial,
  className,
}: {
  label: string
  initial?: Pair
  className?: string
}) {
  const pair = usePair(initial)
  return (
    <Button href={wizardHref(pair)} className={className}>
      {label}
    </Button>
  )
}
