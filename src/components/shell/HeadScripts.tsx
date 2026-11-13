'use client'

import lazy from 'next/dynamic'
import { useEffect } from 'react'
import { consentHeadScript, consentScriptFlag } from '@/lib/consent'
import type { PreviewKind } from '@/lib/preview'
import { handFontScript, handFontScriptFlag } from '@/styles/font-hand'

// The layout's inline scripts, run again on a page where they didn't run: Next 16 answers a
// notFound() with an empty HTML shell and builds the 404 page in the browser, and React doesn't
// run the inline scripts it creates. A script element appended to the page does run. Each script
// sets its flag and runs once, so on server-rendered pages this does nothing. First in <body>, so
// its effect runs before GoogleAnalytics reads the consent state (sibling effects run in order).
// They carry the page's CSP nonce, read from Next's own scripts (src/lib/security-headers.ts).

const scripts = [
  { flag: consentScriptFlag, code: consentHeadScript() },
  { flag: handFontScriptFlag, code: handFontScript },
]

// The admin's live preview frame also gets its link to the form from here (docs/admin-redesign.md,
// decision 11). It's fetched only when an editor's preview is rendered: this component is on every
// page already, so a visitor's page loads nothing more for it.
const LivePreviewBridge = lazy(
  () => import('@/components/preview/LivePreviewBridge').then((module) => module.LivePreviewBridge),
  { ssr: false },
)

type HeadScriptsProps = { preview?: { kind: PreviewKind; id?: string; locale: 'bg' | 'en' } }

export function HeadScripts({ preview }: HeadScriptsProps) {
  useEffect(() => {
    const page = window as unknown as Record<string, unknown>
    const nonce = document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce
    for (const { flag, code } of scripts) {
      if (page[flag]) continue
      const script = document.createElement('script')
      if (nonce) script.nonce = nonce
      script.textContent = code
      document.head.append(script)
    }
  }, [])
  return preview ? <LivePreviewBridge {...preview} /> : null
}
