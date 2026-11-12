import type { Price } from '@/payload-types'

// The one place a course's price is decided (docs/admin-redesign.md, decision 6): the group's own
// price, or else the course's base price (the price without a group). Every card, ticket, enrol
// bar, list sort and structured-data offer asks here.

const idOf = (value: number | { id: number } | null | undefined) =>
  typeof value === 'object' && value ? value.id : (value ?? null)

/** The price to show for a course's group (or for the course alone), or undefined: «Попитайте». */
export function resolvePrice(
  prices: readonly Price[] | null | undefined,
  group?: { id: number } | null,
): Price | undefined {
  const all = prices ?? []
  return (
    (group ? all.find((price) => idOf(price.group) === group.id) : undefined) ??
    all.find((price) => idOf(price.group) === null)
  )
}
