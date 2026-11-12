// The dashboard's small pieces (Figma «Admin · 01 Табло», 359:969), without Payload, so they're
// unit-tested: the inbox an inquiry belongs to, «преди 2 ч.», initials, plurals.

const timeZone = 'Europe/Sofia'

export type Inbox = 'courses' | 'plovdiv' | 'sofia'

export const inboxLabels: Record<Inbox, string> = {
  courses: 'Курсове',
  plovdiv: 'Преводи Пловдив',
  sofia: 'Преводи София',
}

/** A translation inquiry goes to its office's translators; every other to the courses office. */
export function inboxOf(inquiry: { topic?: string | null; office?: string | null }): Inbox {
  if (inquiry.topic === 'translation') return inquiry.office === 'sofia' ? 'sofia' : 'plovdiv'
  return 'courses'
}

/** «ИФ» from «Име Фамилия»; the first two letters of a single word. */
export function initialsOf(name: string | null | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean)
  const letters = words.length > 1 ? words[0][0] + words.at(-1)![0] : (words[0] ?? '').slice(0, 2)
  return letters.toUpperCase()
}

const dayOf = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)

/** «току-що», «преди 5 мин.», «преди 2 ч.», «вчера», «преди 3 дни», then the date. */
export function timeAgo(value: string | Date, now = new Date()): string {
  const then = new Date(value)
  const minutes = Math.floor((now.getTime() - then.getTime()) / 60_000)
  if (minutes < 1) return 'току-що'
  if (minutes < 60) return `преди ${minutes} мин.`
  const days = Math.round((Date.parse(dayOf(now)) - Date.parse(dayOf(then))) / 86_400_000)
  if (days === 0) return `преди ${Math.floor(minutes / 60)} ч.`
  if (days === 1) return 'вчера'
  if (days < 31) return `преди ${days} дни`
  return new Intl.DateTimeFormat('bg-BG', {
    timeZone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
    .format(then)
    .replace(/\s*г\.$/, '')
}

/** «17» and «ное», the date box of «Започват скоро». */
export function dayAndMonth(value: string | Date): { day: string; month: string } {
  const parts = new Intl.DateTimeFormat('bg-BG', {
    timeZone,
    day: 'numeric',
    // The month's first three letters («ное», «дек»): Intl's short Bulgarian month is a number.
    month: 'long',
  }).formatToParts(new Date(value))
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return { day: part('day'), month: part('month').slice(0, 3) }
}

/** «Сряда, 11 ноември 2026». */
export function todayLine(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('bg-BG', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(now)
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const weekday = part('weekday')
  return `${weekday[0].toUpperCase()}${weekday.slice(1)}, ${part('day')} ${part('month')} ${part('year')}`
}

/** «1 курс», «4 курса». */
export const coursesCount = (n: number) => (n === 1 ? 'курс' : 'курса')
