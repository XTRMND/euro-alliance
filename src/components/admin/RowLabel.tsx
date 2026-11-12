'use client'

import { useRowLabel } from '@payloadcms/ui'

// Row labels for the admin's lists (docs/admin-redesign.md, decision 12): a row is named by what
// it holds, never «Item 01».

/** A row named by its `name` field («Немски»); its number until it has one. */
export function NameRowLabel() {
  const { data, rowNumber } = useRowLabel<{ name?: string | null }>()
  return <span>{data?.name || numbered(rowNumber)}</span>
}

const numbered = (rowNumber?: number) => String((rowNumber ?? 0) + 1).padStart(2, '0')

/** A row named by its `label` field: a navigation link («Курсове»). */
export function LabelRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string | null }>()
  return <span>{data?.label || numbered(rowNumber)}</span>
}

/** A row named by its `heading` field: a footer column («Обучение»). */
export function HeadingRowLabel() {
  const { data, rowNumber } = useRowLabel<{ heading?: string | null }>()
  return <span>{data?.heading || numbered(rowNumber)}</span>
}
