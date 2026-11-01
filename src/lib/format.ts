// Formatting for display (docs/i18n.md § 1). Dates are shown in Bulgarian time.

const timeZone = 'Europe/Sofia'

/** 15.11.2003, as the design writes dates in running text (Intl's bg-BG adds « г.»). */
export function formatDateNumeric(value: string | Date): string {
  const parts = new Intl.DateTimeFormat('bg-BG', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date(value))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value
  return `${part('day')}.${part('month')}.${part('year')}`
}

/** The current year in Bulgaria. */
export function currentYear(now = new Date()): number {
  return Number(new Intl.DateTimeFormat('en', { timeZone, year: 'numeric' }).format(now))
}

/** A phone number as a tel: link (+359 886 601 108 → tel:+359886601108). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
