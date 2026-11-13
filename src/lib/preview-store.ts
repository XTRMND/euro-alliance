import type { PreviewKind } from './preview'

// What an editor has typed and not saved, kept in the server's memory for the preview frame: the
// frame's script sends it here (a server action) and the preview route renders from it. Held per
// frame (a token made when the frame loads) and per user, and dropped after ten minutes without a
// change. One server only (CLAUDE.md § 12: no second app server).

type Entry = {
  user: number | string
  kind: PreviewKind
  id?: string
  data: Record<string, unknown>
  at: number
}

const lifetime = 10 * 60_000
const limit = 200
// On globalThis: the action and the route can be bundled apart, and must share one map.
const holder = globalThis as { __eaPreviews?: Map<string, Entry> }
const entries = (holder.__eaPreviews ??= new Map<string, Entry>())

export function storePreview(token: string, entry: Omit<Entry, 'at'>, now = Date.now()) {
  for (const [key, value] of entries) if (now - value.at > lifetime) entries.delete(key)
  entries.delete(token)
  // The oldest go first when many frames are open.
  while (entries.size >= limit) entries.delete(entries.keys().next().value as string)
  entries.set(token, { ...entry, at: now })
}

/** The unsaved data of this frame, if it's this user's and for this document. */
export function storedPreview(
  token: string | undefined,
  match: Pick<Entry, 'user' | 'kind' | 'id'>,
  now = Date.now(),
): Record<string, unknown> | undefined {
  const entry = token ? entries.get(token) : undefined
  if (!entry || now - entry.at > lifetime) return undefined
  if (entry.user !== match.user || entry.kind !== match.kind || entry.id !== match.id)
    return undefined
  return entry.data
}
