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

/**
 * A phone number as a tel: link in international form (+359 886 601 108 and 0886 601 108 →
 * tel:+359886601108).
 */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  return `tel:${/^0[1-9]/.test(digits) ? `+359${digits.slice(1)}` : digits}`
}

/** 3 ноември 2026, as course cards and news dates write it (Intl's bg-BG adds « г.»). */
export function formatDateLong(value: string | Date): string {
  const parts = new Intl.DateTimeFormat('bg-BG', {
    timeZone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(new Date(value))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value
  return `${part('day')} ${part('month')} ${part('year')}`
}

/** 15 януари 2027, 10:00, in Bulgarian time (the ЦПО exams). */
export function formatDateTime(value: string | Date): string {
  const time = new Intl.DateTimeFormat('bg-BG', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(value))
  return `${formatDateLong(value)}, ${time}`
}

/** 495 € or 460,16 €: cents only when there are any. Never converts between currencies. */
export function formatPrice(amount: number, currency: 'EUR' | 'BGN' = 'EUR'): string {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Midnight at the start of today in Bulgaria, as an ISO string, for «from today on» queries. */
export function startOfTodayInSofia(now = new Date()): string {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone }).format(now)
  const offset = new Intl.DateTimeFormat('en', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(now)
    .find((p) => p.type === 'timeZoneName')
    ?.value.replace('GMT', '')
  return new Date(`${day}T00:00:00${offset || '+00:00'}`).toISOString()
}

/** «ноември 2026» for a month given as YYYY-MM (the «Начало» filter). */
export function formatMonth(month: string): string {
  const parts = new Intl.DateTimeFormat('bg-BG', {
    timeZone,
    month: 'long',
    year: 'numeric',
  }).formatToParts(new Date(`${month}-15T12:00:00Z`))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value
  return `${part('month')} ${part('year')}`
}
