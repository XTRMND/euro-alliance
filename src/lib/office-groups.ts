import { type OfficeHours, seasonOf, validRows } from '@/lib/office-hours'

// Offices that share an address are shown as one card on the contact page
// (docs/contact-offices.md § 2): the central office and the Plovdiv translators today. Their
// hours are shown once, so offices are only grouped when their hours are the same.

type Grouped = { address: string; hours?: OfficeHours | null }

const normal = (address: string) =>
  address
    .toLocaleLowerCase('bg')
    .replace(/[\s,.;]+/g, ' ')
    .trim()

/**
 * The same address, or one written out in full beside its shorter form: the central office's
 * begins with the building's name («Образователен бизнес център ЕВРО-АЛИАНС, Пловдив 4003, …»),
 * the translators' is the rest.
 */
export function sameAddress(a: string, b: string): boolean {
  const [short, long] = [normal(a), normal(b)].sort((x, y) => x.length - y.length)
  if (!short) return false
  return long === short || long.endsWith(` ${short}`) || long.startsWith(`${short} `)
}

const week = (hours: OfficeHours | null | undefined) => {
  const rows = (list: Parameters<typeof validRows>[0]) =>
    validRows(list).map((row) => [row.from, row.to || row.from, row.opens, row.closes].join(' '))
  const season = seasonOf(hours)
  return JSON.stringify({
    regular: rows(hours?.regular),
    season,
    seasonal: season ? rows(hours?.seasonal?.rows) : [],
  })
}

/** The same regular week and the same season, row for row. */
export const sameHours = (a?: OfficeHours | null, b?: OfficeHours | null) => week(a) === week(b)

/** Whether an office has any hours to show. */
export const hasHours = (hours?: OfficeHours | null) =>
  validRows(hours?.regular).length > 0 || seasonOf(hours) !== null

/** The offices in their order, those with one address and the same hours together. */
export function groupOffices<T extends Grouped>(offices: T[]): T[][] {
  const groups: T[][] = []
  for (const office of offices) {
    const group = groups.find((members) =>
      members.every(
        (member) =>
          sameAddress(member.address, office.address) && sameHours(member.hours, office.hours),
      ),
    )
    if (group) group.push(office)
    else groups.push([office])
  }
  return groups
}

/** The address written out in full: the longest of the group's. */
export const fullAddress = (offices: Grouped[]) =>
  offices.reduce(
    (longest, { address }) => (address.length > longest.length ? address : longest),
    '',
  )

/**
 * The «Как да ни намерите» location an office belongs to (the Contact global's anchors): Sofia
 * for the Sofia translators, Plovdiv for the others, as LocationGrid pairs them.
 */
export const locationAnchorOf = (role: string) =>
  role === 'translations-sofia' ? 'sofia' : 'plovdiv'
