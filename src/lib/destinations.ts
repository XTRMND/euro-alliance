import { anchors, routes } from './routes'

// Fixed link targets the client picks from in the CMS (homepage program cards and hero buttons),
// so a card can never point at a page that doesn't exist. «Изпити и сертификати» and «Компютърни
// курсове» have fixed targets (docs/motion.md § 8): the certificates section of the language
// pages and the Computer courses page. The language pages are the English ones, as in the footer.

const englishAdults = routes.languageProgram('english', 'adults')

export const destinations = {
  courses: { label: 'Курсове', href: routes.courses() },
  /** On a language page: its own upcoming courses, or the listing filtered to the language. */
  languageCourses: { label: 'Курсове: езици', href: routes.courses('languages') },
  languagesStudents: {
    label: 'Езици за ученици',
    href: routes.languageProgram('english', 'students'),
  },
  languagesAdults: { label: 'Езици за възрастни', href: englishAdults },
  certificates: {
    label: 'Изпити и сертификати',
    href: `${englishAdults}#${anchors.certificates}`,
  },
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
  news: { label: 'Новини', href: routes.news() },
  about: { label: 'За нас', href: routes.about() },
  contact: { label: 'Контакти', href: routes.contact() },
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
