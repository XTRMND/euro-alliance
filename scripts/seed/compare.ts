// Whether a stored record already says what a fixture says, so `pnpm seed:staging` updates only
// what differs and a second run writes nothing.

export const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0)

/**
 * Compares a fixture value with the stored one. Keys the fixture leaves out don't count (Payload
 * adds ids to array rows, and Lexical nodes may gain keys); null, '', [] and a missing value are
 * all empty; a number matches its numeric string.
 */
export function same(want: unknown, have: unknown): boolean {
  if (isEmpty(want)) return isEmpty(have)
  if (Array.isArray(want))
    return (
      Array.isArray(have) &&
      have.length === want.length &&
      want.every((item, i) => same(item, have[i]))
    )
  if (typeof want === 'object')
    return (
      typeof have === 'object' &&
      have !== null &&
      Object.entries(want!).every(([key, value]) =>
        same(value, (have as Record<string, unknown>)[key]),
      )
    )
  if (typeof want === 'number' || typeof have === 'number') return Number(want) === Number(have)
  return want === have
}
