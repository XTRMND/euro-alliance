import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import * as React from 'react'
import { previewDoc } from './cms-preview'
import { type PreviewKind, type PreviewTarget, previewHeader, previewTarget } from './preview'
import { storedPreview } from './preview-store'

// The server side of the live preview. The proxy passes an address's `?preview=` marker on as a
// request header; here it's honoured only for a signed-in editor. The site's readers
// (src/lib/cms.ts) ask `previewed(kind)` first: for the page being previewed they get the
// editor's unsaved document (or the stored draft, until the frame has sent some), and for
// everything else, and for every visitor, nothing: they read the published content as before.

// Once per request where React scopes it (a page's render); elsewhere each call stands alone.
const once: <F extends (...args: never[]) => unknown>(fn: F) => F =
  typeof React.cache === 'function' ? React.cache : (fn) => fn

/** This request's preview, if its address asks for one and an editor is signed in. */
export const previewRequest = once(
  async (): Promise<(PreviewTarget & { user: number | string }) | undefined> => {
    let request: Headers
    try {
      request = await headers()
    } catch {
      // Not a request (a script, a hook): nothing is previewed.
      return undefined
    }
    const marker = request.get(previewHeader)
    if (!marker) return undefined
    const target = previewTarget(new URLSearchParams(marker))
    if (!target) return undefined
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request })
    return user ? { ...target, user: user.id } : undefined
  },
)

const documentOf = once(async (kind: PreviewKind): Promise<unknown> => {
  const preview = await previewRequest()
  if (!preview || preview.kind !== kind) return undefined
  const data = storedPreview(preview.live, preview)
  return (await previewDoc(kind, preview.id, data, preview.locale)) ?? undefined
})

/** The document of this kind being previewed in this request, or undefined. */
export const previewed = <T>(kind: PreviewKind) => documentOf(kind) as Promise<T | undefined>
