'use client'

import { useRowLabel } from '@payloadcms/ui'

// Row labels for the admin's lists (docs/admin-redesign.md, decision 12): a row is named by what
// it holds, never «Item 01».

/** A row named by its `name` field («Немски»); its number until it has one. */
export function NameRowLabel() {
  const { data, rowNumber } = useRowLabel<{ name?: string | null }>()
  return <span>{data?.name || String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>
}
