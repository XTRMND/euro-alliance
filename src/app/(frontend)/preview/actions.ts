'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { isPreviewKind } from '@/lib/preview'
import { storePreview } from '@/lib/preview-store'

// The preview frame sends what's in the admin's form (unsaved) for the preview route to render.
// Staff only; the data stays in memory (src/lib/preview-store.ts) and is never written anywhere.

export async function pushPreview(input: {
  token: string
  kind: string
  id?: string
  data: Record<string, unknown>
}): Promise<boolean> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return false
  const { token, kind, id, data } = input
  if (!isPreviewKind(kind) || !/^[\w-]{8,64}$/.test(token)) return false
  if (id !== undefined && !/^\d+$/.test(id)) return false
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  storePreview(token, { user: user.id, kind, id, data })
  return true
}
