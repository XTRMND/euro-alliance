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
// frames (Vouchers 236:3391, Professions 236:3667, Teachers 237:3686, Farmers 237:3973). Their course cards in Figma are example data: the pages list real
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
  {
    title: 'Професии и специалности',
    type: 'vocational',
    hero: {
      heading: 'Професии и специалности',
      highlight: 'специалности',
      lead: 'Центърът за професионално обучение към ЕВРО-АЛИАНС е лицензиран от НАПОО през 2003 г. Нов списък с професии от 2026 г., с придобиване на първа, втора или трета степен на професионална квалификация.',
      ctas: [
        { label: 'Попитайте за професия', destination: 'otherInquiry' },
        { label: 'Изпити за квалификация', anchor: 'izpiti' },
      ],
      sticker: 'professional',
      countBubble: { value: '20', label: 'професии' },
    },
    sections: [
      {
        blockType: 'professions',
        heading: 'Нов списък с професии от 2026 г.',
        lead: 'Двадесет професии в пет професионални направления.',
      },
      {
        blockType: 'exams',
        anchor: 'izpiti',
        heading: 'Изпити за придобиване на квалификация',
        lead: 'Списък на обявените изпити за професионална квалификация.',
      },
    ],
  },
  {
    title: 'Педагогически специалисти',
    type: 'teachers',
    hero: {
      heading: 'Педагогически специалисти',
      highlight: 'специалисти',
      lead: 'Програми за квалификация на учители, директори, възпитатели, психолози, логопеди и педагогически съветници, с присъждане на кредити.',
      ctas: [
        { label: 'Заявете обучение', destination: 'otherInquiry' },
        { label: 'Всички 29 програми', anchor: 'programi' },
      ],
      sticker: 'teaching',
      countBubble: { value: '29', label: 'програми' },
    },
    sections: [
      {
        blockType: 'figures',
        heading: 'Как протичат обученията',
        items: [
          { figure: '29', label: 'одобрени програми' },
          { figure: '10–25', label: 'души в група според програмата' },
          { figure: '16–48', label: 'учебни часа: 16, 18, 32 или 48' },
          { figure: '1–3', label: 'кредита за програма' },
        ],
        note: 'Преминалите обучение получават удостоверение с присъдения брой кредити по Наредба № 12 от 01.09.2016 г.',
      },
      {
        blockType: 'features',
        heading: 'Формати на обучение',
        items: [
          { title: 'Обучения на място', text: 'В учебните зали на ЕВРО-АЛИАНС.' },
          {
            title: 'Изнесени обучения',
            text: 'В училището или детската градина, за целия екип.',
          },
          {
            title: 'Безплатно обучение',
            text: 'По оперативна програма «Наука и образование за интелигентен растеж».',
          },
        ],
      },
      {
        blockType: 'teacherProgrammes',
        anchor: 'programi',
        heading: 'Списък на програмите',
        lead: '29 програми, одобрени за обучение на педагогически специалисти, подредени по тема. Номерата следват официалния списък.',
      },
    ],
  },
  {
    title: 'Обучение за земеделци',
    type: 'farmers',
    hero: {
      heading: 'Обучение за земеделци',
      highlight: 'земеделци',
      lead: 'Безплатни курсове за част от професията «Агроекология и растителна защита» по проект към Стратегическия план за развитие на земеделието и селските райони 2023–2027.',
      ctas: [
        { label: 'Заявете участие', destination: 'otherInquiry' },
        { label: 'Кой може да участва', anchor: 'uchastie' },
      ],
      sticker: 'farming',
      countBubble: { value: '2', label: 'курса' },
    },
    sections: [
      {
        blockType: 'systemCards',
        heading: 'Курсове за част от професията',
        lead: 'Документ при завършване: удостоверение 3-37 на МОН за завършен курс по част от професията.',
        columns: 'one',
        cards: [
          {
            kicker: 'Препоръчителен за млади фермери',
            name: 'Иновации и екологични практики в растителната защита',
            count: '150',
            countLabel: 'часа',
            description: 'Професионален курс за съвременното земеделско стопанство.',
            levels: [
              { level: '19 дни, присъствено обучение' },
              { level: 'Теория 76 часа, практика 74 часа' },
              { level: 'Удостоверение 3-37 на МОН' },
            ],
            strip: { label: 'Безплатно', note: 'настаняване, изхранване, пътуване и транспорт' },
          },
          {
            kicker: 'Кратък курс',
            name: 'Устойчиво управление, екология и иновации в стопанствата',
            count: '50',
            countLabel: 'часа',
            description: 'Професионален курс за земеделски стопани и работещи в стопанствата.',
            levels: [
              { level: '7 дни, присъствено обучение' },
              { level: 'Теория 25 часа, практика 25 часа' },
              { level: 'Удостоверение 3-37 на МОН' },
            ],
            strip: { label: 'Безплатно', note: 'настаняване, изхранване, пътуване и транспорт' },
          },
        ],
      },
      {
        blockType: 'indexCards',
        anchor: 'uchastie',
        heading: 'Участие',
        cards: [
          {
            title: 'Учебна програма',
            marker: 'number',
            count: 'bubble',
            countLabel: 'предмета',
            rows: [
              { text: 'Икономика и предприемачество' },
              { text: 'Конвенционално и биологично земеделие' },
              { text: 'Агробиология и агроклиматология' },
              { text: 'Основни болести, неприятели и плевели' },
              { text: 'Основи на растителната защита' },
              { text: 'Иновации и добри практики' },
              { text: 'Цифрови технологии и оптимизиране на дейности' },
            ],
          },
          {
            title: 'Кой може да участва',
            marker: 'check',
            count: 'bubble',
            countLabel: 'условия',
            rows: [
              {
                text: 'Регистрирани земеделски стопани с актуална регистрация в ОД «Земеделие» или общинската служба по земеделие',
              },
              {
                text: 'Наети по трудов договор (чл. 67 или чл. 68 от КТ) от регистриран земеделски стопанин',
              },
              {
                text: 'Без квалификация по «Техник-растениевъд», «Растителна защита и агрохимия» (до края на 2025 г.) или «Агроекология и растителна защита» (след 01.01.2026 г.)',
              },
              { text: 'Без висше образование със специалност «Агроном» или «Агрономство»' },
              {
                text: 'Не са се обучавали по същата тема с финансиране от ЕС или друг публичен източник след 01.01.2023 г.',
              },
            ],
          },
        ],
        checklist: {
          title: 'Документи преди старта на обучението',
          items: [
            {
              text: 'Справка УИН-ЗП за актуална регистрация от ОД «Земеделие» или общинската служба по земеделие',
            },
            { text: 'Заявление за включване с декларация, че отговаряте на условията' },
            { text: 'Копие от лична карта с постоянен адрес' },
            {
              text: 'Копие от диплома за средно образование, удостоверение за 10 клас или диплома за висше образование',
            },
            { text: 'Медицинско свидетелство, че обучението не ви е противопоказно' },
            { text: '1 снимка паспортен формат' },
          ],
        },
      },
      {
        blockType: 'projects',
        heading: 'Финансиране',
        lead: 'Обученията са безплатни за участниците. Финансират се по проект на ЕВРО-АЛИАНС към Стратегическия план за развитие на земеделието и селските райони 2023–2027, със 100% безвъзмездна помощ.',
        projects: 'farmersProject',
      },
    ],
  },
] as const

// The ЦПО's 2026 list (236:3755), in the page's order: 20 professions in 5 directions.
const direction = (
  directionCode: string,
  directionName: string,
  rows: [name: string, code: string, degrees: ('I' | 'II' | 'III')[]][],
) => rows.map(([name, code, degrees]) => ({ directionCode, directionName, name, code, degrees }))

export const professions = [
  ...direction('041', 'Бизнес администрация', [
    ['Оперативно счетоводство', '041101', ['II', 'III']],
    ['Митническо обслужване', '041102', ['II', 'III']],
    ['Банково, застрахователно и осигурително дело', '041201', ['II', 'III']],
    ['Мениджмънт и икономика', '041301', ['II', 'III']],
    ['Малък и среден бизнес', '041302', ['II']],
    ['Административни и офис дейности', '041501', ['I', 'II', 'III']],
    ['Търговия и продажби', '041601', ['I', 'II', 'III']],
    ['Електронна търговия, маркетинг и реклама', '041602', ['II', 'III']],
    ['Икономическа информатика', '041603', ['II', 'III']],
  ]),
  ...direction('103', 'Сигурност и отбрана', [
    ['Гражданска, корпоративна сигурност и опазване на обществения ред', '103201', ['III']],
  ]),
  ...direction('101', 'Персонални услуги', [
    ['Хотелиерство', '101103', ['I']],
    ['Готварство', '101301', ['I', 'II']],
    ['Ресторантьорство и кетъринг', '101302', ['I', 'II']],
    ['Хотелиерство', '101303', ['I', 'II', 'III']],
    ['Екскурзовод', '101501', ['III']],
    ['Организиране на туристически пътувания', '101502', ['III']],
    ['Туристическа анимация', '101504', ['III']],
  ]),
  ...direction('081', 'Селско стопанство', [
    ['Агроекология и растителна защита', '081105', ['II', 'III']],
    ['Флористика и озеленяване', '081106', ['I', 'II']],
  ]),
  ...direction('073', 'Строителство и архитектура', [
    ['Експлоатация и сделки с недвижими имоти', '073205', ['I', 'II', 'III']],
  ]),
]

// The 29 programmes for pedagogical specialists (237:3823), by theme in the page's order. The
// numbers follow the official list; hours and credits per programme aren't in Figma.
const theme = (name: string, rows: [number: string, title: string][]) =>
  rows.map(([number, title]) => ({ number, title, theme: name }))

export const teacherProgrammes = [
  ...theme('Дигитални технологии', [
    ['01', 'Техники при работа с интерактивна бяла дъска'],
    ['02', 'Технология на подготовка и изпълнение на компютърни презентации'],
    ['13', '3D принтерът в учебния процес'],
    ['17', 'Добавена реалност в учебния процес'],
    ['21', 'Дистанционни форми на обучение'],
    ['22', 'Дигитално гражданство, защита на личните данни и киберсигурност'],
    ['23', 'Киберсигурност, опасности и престъпления в мрежата'],
    ['24', 'Иновативни методи с компютърни технологии, интерактивно обучение'],
  ]),
  ...theme('Чужди езици', [
    ['04', 'Използване на интерактивна бяла дъска в чуждоезиковото обучение'],
    ['05', 'Особености на преподаването на английски език в начална степен'],
    ['06', 'Управление на проекти на ученици в обучението по английски език'],
    ['07', 'Комуникация на английски език при участия в международни проекти'],
  ]),
  ...theme('Приобщаване и сигурност', [
    ['08', 'Агресията: какво не знаем за нея'],
    ['14', 'Работа с деца със специални образователни потребности (СОП)'],
  ]),
  ...theme('Комуникация, екип и мотивация', [
    ['03', 'Работа в екип и екипна ефективност'],
    ['11', 'Конфликти: същност и протичане, умения за решаването им'],
    ['15', 'Стрес на работното място и начини за справяне'],
    ['18', 'Методи за повишаване на мотивацията при учене'],
    ['19', 'Ефективна комуникация между учители и родители'],
    ['20', 'Обучение по бизнес комуникации и PR'],
    ['25', 'Интерактивни форми на обучение и мотивация на преподавателите'],
    ['26', 'Активно взаимодействие между семейството и образователната институция'],
    ['27', 'Ефективно участие на родителите в училищната общност'],
  ]),
  ...theme('Управление и методика', [
    ['09', 'Система за финансов контрол и управление в училището (СФУК)'],
    ['10', 'Изготвяне на портфолио на педагогическия персонал'],
    ['12', 'Модел на проектно-базирано обучение'],
    ['16', 'Управление на качеството и училищни системи за качество'],
    ['28', 'GDPR: мерки в учебните заведения за защита на личните данни'],
    ['29', 'Обучение за устойчиво развитие в професионалното образование'],
  ]),
]

// The farmers' project (Figma 237:4189): Figma's text, the amount as in Figma in лв and € (no
// conversion of ours), and its EU logo strip exactly as in Figma's image fill.
export const farmersProject = {
  title: 'Повишаване знанията на земеделски стопани чрез професионални обучения',
  facts: [
    { label: 'Старт', value: '03.12.2025 г., срок 36 месеца' },
    {
      label: 'Програма',
      value:
        'Стратегически план за развитие на земеделието и селските райони 2023–2027, интервенция II.И.2',
    },
    {
      label: 'Обучения',
      value: 'част от професията «Техник-растениевъд», курсове от 150 и 50 учебни часа',
    },
    {
      label: 'Участници',
      value:
        'регистрирани земеделски стопани и заети лица по трудов договор в земеделски стопанства',
    },
    { label: 'Стойност', value: '808 140,00 лв (413 195,42 €), 100% безвъзмездна помощ' },
  ],
  goals: [
    { goal: 'Устойчиво земеделие' },
    { goal: 'Иновации' },
    { goal: 'Екологосъобразни практики' },
  ],
}

export const farmersLogoStrip = {
  file: 'public/logos/eu-sp-2023-2027-logo-strip.png',
  mimetype: 'image/png',
  alt: 'Съфинансирано от Европейския съюз. Стратегически план 2023–2027 за развитие на земеделието и селските райони',
}
