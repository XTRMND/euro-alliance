import { destinations } from '@/lib/destinations'

// The English language programs (130:1993 adults, 159:1993 students) with their textbook systems
// and certificates: copy from the approved Figma file. Other languages have no frames and no
// copy, so they aren't seeded. Courses on these pages come from the Courses collection.

type Part = string | { text: string; url: string }

/** A rich text value of one paragraph per argument, for FAQ answers. */
export function richText(...paragraphs: Part[][]) {
  const text = (value: string) => ({
    type: 'text',
    text: value,
    format: 0,
    style: '',
    mode: 'normal',
    detail: 0,
    version: 1,
  })
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((parts) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: parts.map((part) =>
          typeof part === 'string'
            ? text(part)
            : {
                type: 'link',
                fields: { linkType: 'custom', url: part.url, newTab: false },
                format: '',
                indent: 0,
                version: 3,
                direction: 'ltr',
                children: [text(part.text)],
              },
        ),
      })),
    },
  }
}

export const textbookSystems = [
  {
    name: 'New Total English',
    kicker: 'Longman',
    count: '6',
    countLabel: 'нива',
    description:
      'Съвременна учебна система за средношколци и възрастни, съобразена с Общата европейска езикова рамка. Практически насочена, с ясни стъпки «Аз мога» във всеки урок. Всяка книга има 10–12 теми с граматика, лексика, произношение и писмени упражнения.',
    levels: [
      'Beginner',
      'Elementary',
      'Pre-Intermediate',
      'Intermediate',
      'Upper-Intermediate',
      'Advanced',
    ],
    strip: { label: 'Включено', note: 'DVD към всеки учебник и CD към учебната тетрадка' },
  },
  {
    name: 'SpeakOut',
    kicker: 'BBC',
    count: '6',
    countLabel: 'нива',
    description:
      'Курс по разговорен английски с видео съдържание от Би Би Си. Говоренето е на преден план, а четенето, писането и слушането се развиват систематично през целия курс.',
    levels: [
      'Starter',
      'Elementary',
      'Pre-Intermediate',
      'Intermediate',
      'Upper-Intermediate',
      'Advanced',
    ],
    strip: { label: 'Включено', note: 'DVD с видео материали в края на всяка единица' },
  },
  {
    name: 'Team Together',
    kicker: 'За най-малките ученици',
    count: '6',
    countLabel: 'нива',
    description:
      'Курс в шест нива с ярки идеи, забавни истории, песни и занимания, които дават на децата увереност да учат английски.',
    levels: ['Ниво 1', 'Ниво 2', 'Ниво 3', 'Ниво 4', 'Ниво 5', 'Ниво 6'],
    strip: { label: 'Фокус', note: 'говорене, слушане, забавления, игри' },
  },
  {
    name: 'Wider World',
    kicker: 'III–VII клас',
    count: '5',
    countLabel: 'нива',
    description:
      'Съвременна система, която отразява живота на днешните тийнейджъри. Предлага разнообразни упражнения за различните стилове на учене.',
    levels: ['Starter', 'Wider World 1', 'Wider World 2', 'Wider World 3', 'Wider World 4'],
  },
  {
    name: 'Gold Experience',
    kicker: '8–12 клас',
    count: 'C1',
    countLabel: 'до ниво',
    description:
      'Подготвя учениците от горен курс за изпитите в Кеймбридж, като изгражда трайни езикови и реални умения.',
    levels: ['до C1 Advanced (второ издание)'],
    strip: { label: 'Цел', note: 'изпитите в Кеймбридж' },
  },
] as const

export const certificates = [
  {
    name: 'First Certificate in English',
    issuer: 'Cambridge ESOL',
    code: 'FCE',
    prep: 'Complete First',
  },
  {
    name: 'Certificate in Advanced English',
    issuer: 'Cambridge ESOL',
    code: 'CAE',
    prep: 'Complete Advanced',
  },
  {
    name: 'Certificate of Proficiency in English',
    issuer: 'Cambridge ESOL',
    code: 'CPE',
    prep: 'New Proficiency Gold',
  },
  {
    name: 'International English Language Testing System',
    issuer: 'Международен изпит',
    code: 'IELTS',
  },
] as const

const levelTest = destinations.levelTest.href

const shared = {
  hero: {
    heading: 'Английски език',
    highlight: 'език',
    ctas: [
      { label: 'Виж предстоящите курсове', destination: 'languageCourses' },
      { label: 'Направи входния тест', destination: 'levelTest' },
    ],
  },
  upcoming: {
    heading: 'Предстоящи курсове по английски',
    linkLabel: 'Всички курсове по английски',
  },
  notebook: {
    title: 'Първи думи',
    highlight: 3,
    phrases: [
      { phrase: 'Hello!', translation: 'Здравей!' },
      { phrase: 'How are you?', translation: 'Как си?' },
      { phrase: 'Nice to meet you.', translation: 'Приятно ми е.' },
    ],
  },
}

const systemsBlock = (systems: number[]) => ({
  blockType: 'textbookSystems',
  heading: 'Учебни системи и нива',
  lead: 'Обучението следва Общата европейска езикова рамка. Не знаете от кое ниво да започнете? Безплатният входен тест ще ви покаже.',
  systems,
  link: { label: 'Направи безплатния входен тест', destination: 'levelTest' },
  columns: 'two',
})

const certificatesBlock = {
  blockType: 'certificates',
  heading: 'Международни сертификати',
  lead: 'Подготовка за изпитите в хартиен и компютърен формат, за преминалите езиково обучение. Под всеки изпит е учебната система, по която се подготвяме.',
}

const certificatesFaq = {
  question: 'Подготвяте ли за международни сертификати?',
  answer: richText(['Да: FCE, CAE и CPE на Cambridge и IELTS, в хартиен и компютърен формат.']),
}

export const englishPrograms = [
  {
    title: 'Английски език за възрастни',
    type: 'language',
    language: 'english',
    audience: 'adults',
    ...shared,
    hero: {
      ...shared.hero,
      lead: 'Групови и индивидуални курсове, присъствено в Пловдив или онлайн.',
    },
    systems: ['New Total English', 'SpeakOut'],
    sections: [
      {
        blockType: 'features',
        heading: 'Как можете да учите',
        items: [
          { title: 'Групово обучение', text: 'Групови курсове присъствено в Пловдив или онлайн.' },
          {
            title: 'Индивидуално обучение',
            text: 'Ускорено и конкретизирано обучение според вашите нужди.',
          },
          {
            title: 'Фирмено обучение',
            text: 'Индивидуални програми за фирмено и специализирано обучение.',
          },
          {
            title: 'Признаване на ниво',
            text: 'Изпит пред комисия от преподаватели и сертификат за постигнатото ниво.',
          },
        ],
      },
      'systems',
      certificatesBlock,
      {
        blockType: 'faq',
        heading: 'Често задавани въпроси',
        items: [
          {
            question: 'Как да разбера нивото си?',
            answer: richText([
              'Направете ',
              { text: 'безплатния входен тест', url: levelTest },
              '. Резултатът показва от кое ниво да започнете.',
            ]),
          },
          {
            question: 'Мога ли да платя с ваучер от Агенцията по заетостта?',
            answer: richText([
              'Да, ако курсът е одобрен за ваучери. Ще ви помогнем с документите при записването.',
            ]),
          },
          {
            question: 'Получавам ли документ след курса?',
            answer: richText(['Да, удостоверение за завършен курс.']),
          },
          certificatesFaq,
        ],
      },
    ],
  },
  {
    title: 'Английски език за ученици',
    type: 'language',
    language: 'english',
    audience: 'students',
    ...shared,
    hero: {
      ...shared.hero,
      lead: 'Целогодишни езикови курсове за ученици от 1 до 12 клас и индивидуално обучение.',
    },
    systems: ['Team Together', 'Wider World', 'Gold Experience'],
    sections: [
      {
        blockType: 'features',
        heading: 'Как можете да учите',
        items: [
          {
            title: 'Целогодишни групи',
            text: 'Малки групи по паралелни училищни програми, от 1 до 12 клас.',
          },
          {
            title: 'Индивидуално обучение',
            text: 'Ускорено и конкретизирано обучение според нуждите на ученика.',
          },
          {
            title: 'Уроци, състезания, проекти',
            text: 'Занимателни уроци, състезания и проекти през годината.',
          },
          { title: 'Сертификати', text: 'Подготовка за изпитите на Cambridge и IELTS.' },
        ],
      },
      'systems',
      certificatesBlock,
      {
        blockType: 'faq',
        heading: 'Често задавани въпроси',
        items: [
          {
            question: 'Как да разбера нивото на детето?',
            answer: richText([
              'Направете ',
              { text: 'безплатния входен тест', url: levelTest },
              '. Резултатът показва от кое ниво да започне.',
            ]),
          },
          {
            question: 'Курсовете целогодишни ли са?',
            answer: richText([
              'Да, обучението за ученици е целогодишно, по паралелни училищни програми.',
            ]),
          },
          {
            question: 'Има ли индивидуално обучение?',
            answer: richText(['Да, според нуждите на ученика.']),
          },
          certificatesFaq,
        ],
      },
    ],
  },
] as const

export { systemsBlock }

// The programs that have one page each, with the course-page hero: copy from the approved Figma
// frames (Vouchers 236:3391). Their course cards in Figma are example data: the pages list real
// courses from the Courses collection.

const voucherCard = (card: {
  kicker: string
  name: string
  count: string
  description: string
  levels: string[]
  strip: { label: string; note: string }
}) => ({
  ...card,
  countLabel: 'курса',
  levels: card.levels.map((level) => ({ level })),
})

export const singlePrograms = [
  {
    title: 'Обучение с ваучери',
    type: 'vouchers',
    hero: {
      heading: 'Обучение с ваучери',
      highlight: 'ваучери',
      lead: 'По програма на Агенцията по заетостта: «Развитие на човешките ресурси» 2021–2027, Национален план за възстановяване и устойчивост и Фонд за справедлив преход. Споразумение № ДОб-3-00501 #3 от 6 ноември 2025 г.',
      ctas: [
        { label: 'Съгласувайте обучението', destination: 'voucherInquiry' },
        { label: 'Как да кандидатствате', anchor: 'kak-da-kandidatstvate' },
      ],
      sticker: 'corporate',
      countBubble: { value: '6', label: 'курса' },
    },
    upcoming: { heading: 'Предстоящи курсове с ваучер' },
    sections: [
      {
        blockType: 'systemCards',
        heading: 'Предлагани обучения',
        lead: 'Обученията с ваучер, одобрени по споразумението с Агенцията по заетостта.',
        columns: 'one',
        cards: [
          voucherCard({
            kicker: 'Ключова компетентност 2',
            name: 'Многоезикова компетентност',
            count: '4',
            description: 'Английски език, 300 учебни часа, учебна система Roadmap (Pearson).',
            levels: [
              'Нива A1, A2, B1 · присъствено, Пловдив, ул. Самара №13',
              'Нива A1, A2, B1 · дистанционно синхронно',
              'Нива A2, B1, B2 · дистанционно синхронно',
              'Нива B1, B2, C1 · дистанционно синхронно',
            ],
            strip: { label: 'Учебник', note: 'Roadmap (Pearson)' },
          }),
          voucherCard({
            kicker: 'Ключова компетентност 4',
            name: 'Цифрова компетентност',
            count: '2',
            description:
              'Общи дигитални умения по европейската рамка DigComp, дистанционно синхронно обучение.',
            levels: [
              'Базово ниво (DigComp 1 и 2) · 55 учебни часа',
              'Средно ниво (DigComp 3 и 4) · 45 учебни часа',
            ],
            strip: { label: 'Форма', note: 'дистанционно синхронно' },
          }),
        ],
      },
      {
        blockType: 'steps',
        anchor: 'kak-da-kandidatstvate',
        heading: 'Как да кандидатствате за безплатен ваучер',
        callout: {
          heading: 'Преди да кандидатствате, първо се свържете с нас',
          text: 'за да съгласуваме вашето обучение: 0886 601 108, office@euro-alliance.net',
          cta: { label: 'Свържете се', destination: 'voucherInquiry' },
        },
        items: [
          { title: 'На сайта на Агенцията натиснете «Заяви ваучер за обучение тук!»' },
          { title: 'За доставчик на обучение изберете ЕВРО-АЛИАНС ООД' },
          { title: 'Попълнете полетата и подайте заявлението' },
        ],
        note: 'В срока, определен от Агенцията по заетостта, ще получите одобрение или отказ за издаването на ваучер.',
      },
    ],
  },
] as const
