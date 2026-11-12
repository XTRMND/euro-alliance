'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type PreviewKind, previewQuery } from '@/lib/preview'
import { pushPreview } from '@/lib/preview-actions'

// The preview frame's side of Payload's live preview. `useLivePreview` receives the admin form's
// data on every change; instead of asking the API to fill it in, its request hands the data to
// the server (a server action), and the frame then asks for the page again: the server renders the
// page's own template from it (src/lib/preview-request.ts). Nothing is saved by any of this.

type Props = { kind: PreviewKind; id?: string; locale: 'bg' | 'en' }

// One object for the hook's whole life: a new one would make it subscribe again.
const nothing = {}
// The form sends every keystroke; the page is asked for again once typing pauses.
const pause = 250

export function LivePreviewBridge({ kind, id, locale }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [token] = useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  )
  const [serverURL] = useState(() => (typeof window === 'undefined' ? '' : window.location.origin))
  const latest = useRef<Record<string, unknown> | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const version = useRef(0)

  const send = useCallback(async () => {
    const data = latest.current
    if (!data) return
    latest.current = null
    if (await pushPreview({ token, kind, id, data })) {
      version.current += 1
      // A new address, so the page is rendered again from what was just sent; no scrolling.
      router.replace(
        `${pathname}?${previewQuery({ kind, id, locale, live: token })}&v=${version.current}`,
        { scroll: false },
      )
    }
  }, [token, kind, id, locale, pathname, router])

  const requestHandler = useCallback(
    ({ data }: { data: { data?: unknown } }) => {
      latest.current = (data.data ?? {}) as Record<string, unknown>
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(send, pause)
      // The hook wants a response with the merged data; the page comes from the server instead.
      return Promise.resolve(
        new Response('{}', { headers: { 'Content-Type': 'application/json' } }),
      )
    },
    [send],
  )

  useLivePreview({
    initialData: nothing,
    serverURL,
    depth: 0,
    requestHandler: requestHandler as never,
  })

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  // The cookie banner would cover the page in the frame: the editor isn't a visitor here.
  return <style>{'section[aria-labelledby="consent-title"]{display:none}'}</style>
}
