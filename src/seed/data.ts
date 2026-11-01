import { anchors, routes } from '@/lib/routes'

// Verified client facts (CLAUDE.md § 3) and copy from the approved Figma file: offices from the
// Contact page (119:1875), navigation from the Header (79:784), Mobile menu (121:1399) and Footer
// (79:887). Nothing here may be invented: leave a value out rather than guess it.

export const company = {
  name: 'Евро Алианс',
  legalName: 'ЕВРО-АЛИАНС ООД',
  companyId: '115302753',
  facebook: 'https://www.facebook.com/EvroAlians',
  foundedOn: '1999-02-08T12:00:00.000Z',
  foundedIn: 'Пловдив',
  licence: { issuer: 'НАПОО', number: '200312088', issuedOn: '2003-11-15T12:00:00.000Z' },
  certifications: [{ standard: 'ISO 9001:2015' }, { standard: 'ISO 17100:2015' }],
  bank: { name: 'Инвестбанк', iban: 'BG58 IORT 8129 1003 0255 00', bic: 'IORTBGSF' },
  funding: {
    statement:
      'Проект № BG16RFPR001-1.004-1004-C01 «Подобряване на производствения капацитет на ЕВРО-АЛИАНС ООД», финансиран по програма «Конкурентоспособност и иновации в предприятията» 2021–2027.',
  },
}

/** The official EU logo strip, supplied by the client and stored byte for byte (publicity rules). */
export const fundingLogo = {
  file: 'public/logos/eu-pkip-logo-strip.jpg',
  mimetype: 'image/jpeg',
  alt: 'Съфинансирано от Европейския съюз. Програма „Конкурентоспособност и иновации в предприятията“',
}

export const offices = [
  {
    role: 'courses',
    name: 'Централен офис, Пловдив',
    department: 'Курсове и обучения',
    address: 'Образователен бизнес център ЕВРО-АЛИАНС, Пловдив 4003, ул. Самара №13',
    phones: [{ number: '+359 886 601 108' }],
    emails: [{ email: 'office@euro-alliance.net' }],
  },
  {
    role: 'translations-plovdiv',
    name: 'Преводи, Пловдив',
    department: 'Преводи и легализация',
    address: 'Пловдив 4003, ул. Самара №13',
    phones: [{ number: '+359 885 504 509' }],
    emails: [{ email: 'prevod@euro-alliance.net' }],
  },
  {
    role: 'translations-sofia',
    name: 'Преводи, София',
    department: 'Преводи и легализация',
    address: '1000 София, ул. Георги С. Раковски 125',
    phones: [{ number: '+359 884 252 909' }],
    emails: [{ email: 'trans@euro-alliance.net' }],
  },
] as const

// Targets as decided by the user (CLAUDE.md § 12): «Езици» opens the course listing filtered to
// language courses; «Професионално обучение» opens its three programmes. Left out: «Ценоразпис»
// (no official price list) and «Екип» (until the client sends team photos).
const englishAdults = routes.languageProgram('english', 'adults')

const vocational = {
  label: 'Професионално обучение',
  children: [
    { label: 'ЦПО професии', href: routes.professions() },
    { label: 'Педагогически специалисти', href: routes.teachers() },
    { label: 'Земеделски производители', href: routes.farmers() },
  ],
}

export const navigation = {
  header: {
    left: [
      { label: 'Курсове', href: routes.courses() },
      vocational,
      { label: 'Преводи', href: routes.translations() },
    ],
    right: [{ label: 'За нас', href: routes.about() }],
  },
  menu: [
    { label: 'Курсове', href: routes.courses() },
    { label: 'Езици', href: routes.courses('languages') },
    { label: 'Изпити и сертификати', href: `${englishAdults}#${anchors.certificates}` },
    vocational,
    { label: 'Преводи', href: routes.translations() },
    { label: 'Новини', href: routes.news() },
    { label: 'За нас', href: routes.about() },
  ],
  footer: [
    {
      heading: 'Обучение',
      links: [
        { label: 'Курсове', href: routes.courses() },
        { label: 'Езици за ученици', href: routes.languageProgram('english', 'students') },
        { label: 'Езици за възрастни', href: englishAdults },
        { label: 'Професионално обучение', href: routes.professions() },
        { label: 'Ваучери', href: routes.vouchers() },
      ],
    },
    {
      heading: 'Преводи',
      links: [
        { label: 'Писмени преводи', href: routes.translations() },
        { label: 'Устни преводи', href: routes.translations() },
        { label: 'Изпрати документ', href: routes.contact('prevodi') },
      ],
    },
    {
      heading: 'За нас',
      links: [
        { label: 'История', href: routes.about('history') },
        { label: 'Проекти', href: routes.about('projects') },
        { label: 'Документи', href: routes.about('documents') },
        { label: 'Защита на данните', href: routes.privacy() },
      ],
    },
    {
      heading: 'Контакти',
      links: [
        { label: 'Форма за контакти', href: routes.contact() },
        { label: 'Facebook', href: company.facebook, icon: 'facebook' as const },
        { label: 'Пловдив', href: routes.contactLocation('plovdiv') },
        { label: 'София', href: routes.contactLocation('sofia') },
      ],
    },
  ],
}
