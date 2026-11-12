import type { ReactNode } from 'react'

// What the admin's list screens share: reading the list's address and writing links that keep it.

type SearchParams = Record<string, unknown> | undefined

/**
 * The list's parameters: the menu's filter (`where[field][equals]=value`, kept in every link),
 * and the screen's own (q, aud, group, …).
 */
export function listParams(searchParams: SearchParams) {
  const flat = new Map<string, string>()
  const where: Record<string, string> = {}
  const nested = (searchParams as { where?: Record<string, { equals?: unknown }> } | undefined)
    ?.where
  if (nested && typeof nested === 'object')
    for (const [field, condition] of Object.entries(nested))
      if (condition && condition.equals !== undefined) where[field] = String(condition.equals)
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    const match = /^where\[(\w+)\]\[equals\]$/.exec(key)
    if (match) where[match[1]] = String(value)
    else if (typeof value === 'string') flat.set(key, value)
  }
  const own = ['q', 'aud', 'group', 'status', 'inbox', 'id']
  const entries = (changes: Record<string, string | undefined> = {}) => {
    const out: [string, string][] = Object.entries(where).map(([field, value]) => [
      `where[${field}][equals]`,
      value,
    ])
    for (const key of own) {
      const value = key in changes ? changes[key] : flat.get(key)
      if (value) out.push([key, value])
    }
    return out
  }
  return {
    where,
    get: (key: string) => flat.get(key) ?? '',
    /** This list with some of its own parameters changed (undefined removes one). */
    href: (changes: Record<string, string | undefined>) => {
      const query = entries(changes)
        .map(
          ([key, value]) =>
            // «{value}» is a placeholder the client fills in (NavSelect): left as it is.
            `${key}=${value === '{value}' ? value : encodeURIComponent(value)}`,
        )
        .join('&')
      return query ? `?${query}` : '?'
    },
    /** Hidden inputs that keep the parameters in a GET form, without the ones the form sets. */
    hidden: (without: string[]): ReactNode =>
      entries()
        .filter(([key]) => !without.includes(key))
        .map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />),
  }
}

export function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
