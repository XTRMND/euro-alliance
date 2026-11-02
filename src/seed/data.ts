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

/**
 * Navigation links seeded before 02.11.2026 that now go to filtered course listings (a general
 * label never goes to one specific page): label, old address, new address. The seed moves a link
 * only while it still has its old address.
 */
export const navigationMoves: [string, string, string][] = [
  [
    'Езици за ученици',
    routes.languageProgram('english', 'students'),
    routes.courses({ category: 'languages', audience: 'students' }),
  ],
  [
    'Езици за възрастни',
    englishAdults,
    routes.courses({ category: 'languages', audience: 'adults' }),
  ],
  ['Професионално обучение', routes.professions(), routes.courses('vocational')],
  ['Изпити и сертификати', `${englishAdults}#${anchors.certificates}`, routes.courses('exams')],
]

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
    { label: 'Изпити и сертификати', href: routes.courses('exams') },
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
        {
          label: 'Езици за ученици',
          href: routes.courses({ category: 'languages', audience: 'students' }),
        },
        {
          label: 'Езици за възрастни',
          href: routes.courses({ category: 'languages', audience: 'adults' }),
        },
        { label: 'Професионално обучение', href: routes.courses('vocational') },
        { label: 'Ваучери', href: routes.vouchers() },
      ],
    },
    {
      heading: 'Преводи',
      links: [
        { label: 'Писмени преводи', href: `${routes.translations()}#pismeni-prevodi` },
        { label: 'Устни преводи', href: `${routes.translations()}#ustni-prevodi` },
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

// The homepage (48:184): copy from Figma. The classroom photo is the client's own (Figma layer
// «Classroom (their photo, duotone 88%)», 261:4025): Figma's crop of its image fill (x 306,
// y 204, 666 × 796 of 1360 × 1020). Photo B in the same collage is stock and is never seeded.
// Courses and news are never seeded: they come from the client or the import (PR 21).
export const homePhoto = {
  file: 'src/seed/home/classroom.jpg',
  mimetype: 'image/jpeg',
  alt: 'Деца в класна стая на Евро Алианс вдигат чанти с логото на школата',
}

export const home = {
  hero: {
    heading: 'Езиково и професионално обучение от 1999 г.',
    highlight: 'от 1999 г.',
    lead: 'Езикови курсове, професионално обучение, квалификации по програми на МОН и преводи с легализация.',
    primary: { label: 'Виж предстоящите курсове', destination: 'courses' },
    secondary: { label: 'Изпрати документ за превод', destination: 'sendDocument' },
  },
  upcoming: { title: 'Предстоящи курсове' },
  programs: {
    title: 'Какво предлагаме',
    cards: [
      {
        title: 'Езици за ученици',
        sticker: 'student',
        text: 'От 1 до 12 клас, в малки групи и индивидуално, по училищните програми.',
        linkLabel: 'Виж програмите',
        destination: 'languagesStudents',
      },
      {
        title: 'Езици за възрастни',
        sticker: 'french',
        text: 'Шест езика, нива по Общата европейска езикова рамка, групи и индивидуално.',
        linkLabel: 'Виж курсовете',
        destination: 'languagesAdults',
      },
      {
        title: 'Изпити и сертификати',
        sticker: 'exams',
        text: 'Cambridge, ДЗИ и НВО, входни тестове за ниво и признаване на езикови умения.',
        linkLabel: 'Провери нивото си',
        destination: 'certificates',
      },
      {
        title: 'Професионално и фирмено обучение',
        sticker: 'professional',
        text: 'Лицензиран ЦПО към НАПОО и програми, съобразени с нуждите на фирмата.',
        linkLabel: 'Виж професиите',
        destination: 'professions',
      },
      {
        title: 'Обучение с ваучери',
        sticker: 'corporate',
        text: 'Езикови и професионални курсове, платени с ваучери от Агенцията по заетостта.',
        linkLabel: 'Как работи',
        destination: 'vouchers',
      },
      {
        title: 'Педагогически специалисти',
        sticker: 'teaching',
        text: 'Програми, одобрени от МОН, с придобиване на квалификационни кредити.',
        linkLabel: 'Виж програмите',
        destination: 'teachers',
      },
      {
        title: 'Обучение за земеделци',
        sticker: 'farming',
        text: 'Специализирани курсове за земеделски стопани и производители.',
        linkLabel: 'Научи повече',
        destination: 'farmers',
      },
      {
        title: 'Компютърни курсове',
        sticker: 'computer',
        text: 'За ученици и възрастни, групово и индивидуално.',
        linkLabel: 'Виж курсовете',
        destination: 'computerCourses',
      },
    ],
  },
  translations: {
    title: 'Преводи и легализация',
    lead: 'Писмени и устни преводи, заверка и легализация на документи. Изпратете файла и получете оферта с цена и срок.',
    steps: [
      { text: 'Изпращате документа' },
      { text: 'Получавате оферта' },
      { text: 'Превод и легализация' },
    ],
    cta: { label: 'Изпрати документ за превод', destination: 'sendDocument' },
  },
  news: { title: 'Новини и проекти', count: 3 },
  partners: { title: 'Партньори и акредитации' },
} as const

/** Partner logos as in Figma (Marquee / Logos 63:711), in order; open item: current list. */
export const partners = [
  { file: 'agentsia-po-zaetostta.png', name: 'Агенция по заетостта' },
  { file: 'napoo.png', name: 'НАПОО' },
  { file: 'agraren-universitet-plovdiv.png', name: 'Аграрен университет – Пловдив' },
  { file: 'pearson-longman.png', name: 'Pearson Longman' },
  { file: 'oxford-university-press.png', name: 'Oxford University Press' },
  { file: 'tpk-plovdiv.png', name: 'Търговско-промишлена камара – Пловдив' },
  {
    file: 'pu-paisiy-hilendarski.png',
    name: 'Пловдивски университет „Паисий Хилендарски“',
  },
  { file: 'gateway-school-of-english.png', name: 'Gateway School of English' },
] as const

/**
 * The contact page (119:1795): copy and the two location cards (125:302) from Figma, with the
 * coordinates of Figma's map links; the maps are drawn from OpenStreetMap data at 2× by
 * scripts/maps/render.mjs (the same areas as Figma's snapshots).
 */
export const contact = {
  hero: {
    title: 'Свържете се с нас',
    highlight: 'с нас',
    lead: 'Изберете с какво можем да помогнем и ще ви отговорим по телефон или имейл. Предпочитате да се обадите? Телефоните на офисите са вдясно.',
  },
  locations: [
    {
      anchor: 'plovdiv',
      kicker: 'Пловдив · курсове и преводи',
      street: 'ул. Самара №13',
      address: 'Образователен бизнес център ЕВРО-АЛИАНС, 4003 Пловдив',
      latitude: 42.1585573,
      longitude: 24.7394618,
      map: {
        file: 'src/seed/contact/plovdiv-map.webp',
        alt: 'Карта на района около ул. Самара №13, Пловдив',
      },
    },
    {
      anchor: 'sofia',
      kicker: 'София · преводи и легализация',
      street: 'ул. Георги С. Раковски 125',
      address: '1000 София, център',
      latitude: 42.6940008,
      longitude: 23.3288525,
      map: {
        file: 'src/seed/contact/sofia-map.webp',
        alt: 'Карта на района около ул. Георги С. Раковски 125, София',
      },
    },
  ],
} as const
