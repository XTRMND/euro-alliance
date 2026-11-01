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
