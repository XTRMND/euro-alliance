import { aboutSections, routes } from './routes'

// Fixed link targets the client picks from in the CMS (homepage program cards and hero buttons),
// so a card can never point at a page that doesn't exist. A general label goes to a general view,
// never one specific page (the user's rule, 02.11.2026): «Езици за ученици» / «Езици за възрастни»
// and «Изпити и сертификати» are the course listing filtered to that category and audience.

export const destinations = {
  courses: { label: 'Курсове', href: routes.courses() },
  /** On a language page: its own upcoming courses, or the listing filtered to the language. */
  languageCourses: { label: 'Курсове: езици', href: routes.courses('languages') },
  languagesStudents: {
    label: 'Езици за ученици',
    href: routes.courses({ category: 'languages', audience: 'students' }),
  },
  languagesAdults: {
    label: 'Езици за възрастни',
    href: routes.courses({ category: 'languages', audience: 'adults' }),
  },
  certificates: { label: 'Изпити и сертификати', href: routes.courses('exams') },
  professions: { label: 'ЦПО професии', href: routes.professions() },
  vouchers: { label: 'Ваучери', href: routes.vouchers() },
  /** Reports `voucher_apply_click` (docs/measurement.md). */
  voucherInquiry: { label: 'Запитване за ваучер', href: routes.contact('vaucheri') },
  teachers: { label: 'Педагогически специалисти', href: routes.teachers() },
  farmers: { label: 'Земеделски производители', href: routes.farmers() },
  computerCourses: { label: 'Компютърни курсове', href: routes.computerCourses() },
  translations: { label: 'Преводи', href: routes.translations() },
  sendDocument: { label: 'Изпрати документ за превод', href: routes.contact('prevodi') },
  levelTest: { label: 'Входен тест (запитване)', href: routes.contact('test-za-nivo') },
  otherInquiry: { label: 'Запитване: друго', href: routes.contact('drugo') },
  news: { label: 'Новини', href: routes.news() },
  about: { label: 'За нас', href: routes.about() },
  aboutHistory: { label: 'За нас: история', href: `${routes.about()}#${aboutSections.history}` },
  contact: { label: 'Контакти', href: routes.contact() },
  privacy: { label: 'Защита на личните данни', href: routes.privacy() },
  cookies: { label: 'Политика за бисквитките', href: routes.cookies() },
} as const

export type Destination = keyof typeof destinations

export const destinationOptions = Object.entries(destinations).map(([value, { label }]) => ({
  value,
  label,
}))

export function hrefOf(destination: string | null | undefined): string | undefined {
  return destination && destination in destinations
    ? destinations[destination as Destination].href
    : undefined
}
