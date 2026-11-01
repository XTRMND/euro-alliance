'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

/** «Копирай адреса»: copies the address and says so in a polite live region (docs/motion.md § 8). */
export function CopyAddress({
  address,
  labels,
}: {
  address: string
  labels: { copy: string; copied: string }
}) {
  const [copied, setCopied] = useState(false)
  return (
    <>
      <Button
        variant="link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(address)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 4000)
          } catch {
            setCopied(false)
          }
        }}
      >
        {labels.copy}
      </Button>
      <span role="status" className="sr-only">
        {copied ? labels.copied : ''}
      </span>
    </>
  )
}
