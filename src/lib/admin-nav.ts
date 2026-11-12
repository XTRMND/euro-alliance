// The admin's menu (docs/admin-redesign.md, decision 1; Figma «Admin / Sidebar v2», 366:1133): it
// mirrors the public site, not Payload's collections and globals. An item opens a list (filtered
// where the branch needs it), a document's edit screen or a global's. Nothing here says
// «Глобални»: the globals sit where their pages are on the site.

export type ProgramType =
  'language' | 'vocational' | 'vouchers' | 'teachers' | 'farmers' | 'computer' | 'translations'

/** What the tree needs from the database: the id of each programme that has one page. */
export type NavContext = {
  adminRoute: string
  /** The programme page of a type (not the language pages: those are a list). */
  programIds: Partial<Record<ProgramType, number>>
  /** How many inquiries are new. */
  newInquiries: number
}

export type NavNode = {
  /** The item's path in the tree, as Figma names it: «Обучения/Езикови курсове/Курсове». */
  key: string
  label: string
  href?: string
  badge?: number
  children?: NavNode[]
}

const where = (field: string, value: string) =>
  `?where[${field}][equals]=${encodeURIComponent(value)}`

/** The tree, with every item's address. A programme page that doesn't exist yet opens the list. */
export function adminNav({ adminRoute: admin, programIds, newInquiries }: NavContext): NavNode[] {
  const list = (slug: string, query = '') => `${admin}/collections/${slug}${query}`
  const global = (slug: string) => `${admin}/globals/${slug}`
  const page = (type: ProgramType) =>
    programIds[type] ? list(`programs/${programIds[type]}`) : list('programs', where('type', type))
  const courses = (category: string) => list('courses', where('category', category))

  const tree: NavNode[] = [
    { key: 'Табло', label: 'Табло', href: admin },
    { key: 'Запитвания', label: 'Запитвания', href: list('inquiries'), badge: newInquiries },
    { key: 'Начална страница', label: 'Начална страница', href: global('home') },
    {
      key: 'Обучения',
      label: 'Обучения',
      children: [
        {
          key: 'Езикови курсове',
          label: 'Езикови курсове',
          children: [
            {
              key: 'Програми',
              label: 'Програми',
              href: list('programs', where('type', 'language')),
            },
            { key: 'Курсове', label: 'Курсове', href: courses('languages') },
            { key: 'Учебни системи', label: 'Учебни системи', href: list('textbook-systems') },
            { key: 'Сертификати', label: 'Сертификати', href: list('certificates') },
          ],
        },
        {
          key: 'Професии (ЦПО)',
          label: 'Професии (ЦПО)',
          children: [
            { key: 'Страница', label: 'Страница', href: page('vocational') },
            { key: 'Професии', label: 'Професии', href: list('professions') },
            { key: 'Изпити', label: 'Изпити', href: list('exams') },
            { key: 'Курсове', label: 'Курсове', href: courses('vocational') },
          ],
        },
        {
          key: 'Педагогически специалисти',
          label: 'Педагогически специалисти',
          children: [
            { key: 'Страница', label: 'Страница', href: page('teachers') },
            { key: 'Програми', label: 'Програми', href: list('teacher-programmes') },
          ],
        },
        {
          key: 'Земеделски стопани',
          label: 'Земеделски стопани',
          children: [
            { key: 'Страница', label: 'Страница', href: page('farmers') },
            { key: 'Курсове', label: 'Курсове', href: courses('farmers') },
          ],
        },
        {
          key: 'Компютърни курсове',
          label: 'Компютърни курсове',
          children: [
            { key: 'Страница', label: 'Страница', href: page('computer') },
            { key: 'Курсове', label: 'Курсове', href: courses('computer') },
          ],
        },
        {
          key: 'Ваучери',
          label: 'Ваучери',
          children: [
            { key: 'Страница', label: 'Страница', href: page('vouchers') },
            {
              key: 'Курсове',
              label: 'Курсове',
              href: list('courses', where('voucherEligible', 'true')),
            },
          ],
        },
        { key: 'Всички курсове', label: 'Всички курсове', href: list('courses') },
      ],
    },
    { key: 'Цени', label: 'Цени', href: list('prices') },
    {
      key: 'Преводи',
      label: 'Преводи',
      children: [
        { key: 'Страница', label: 'Страница', href: page('translations') },
        {
          key: 'Езици',
          label: 'Езици',
          href: `${page('translations')}#field-translationLanguages`,
        },
      ],
    },
    { key: 'Новини', label: 'Новини', href: list('news') },
    {
      key: 'За нас',
      label: 'За нас',
      children: [
        { key: 'Страница', label: 'Страница', href: global('about') },
        { key: 'Екип', label: 'Екип', href: list('team') },
        { key: 'Документи и лицензи', label: 'Документи и лицензи', href: list('documents') },
        { key: 'Проекти', label: 'Проекти', href: list('funded-projects') },
      ],
    },
    {
      key: 'Контакти',
      label: 'Контакти',
      children: [
        { key: 'Страница', label: 'Страница', href: global('contact') },
        { key: 'Офиси', label: 'Офиси', href: list('offices') },
      ],
    },
    {
      key: 'Сайт',
      label: 'Сайт',
      children: [
        { key: 'Навигация', label: 'Навигация', href: global('navigation') },
        { key: 'Данни за фирмата', label: 'Данни за фирмата', href: global('site') },
        { key: 'Правни страници', label: 'Правни страници', href: list('legal-pages') },
        { key: 'Пренасочвания', label: 'Пренасочвания', href: list('redirects') },
      ],
    },
  ]
  // Keys are the full path, so «Курсове» under two branches are two items.
  const keyed = (nodes: NavNode[], parent = ''): NavNode[] =>
    nodes.map((node) => {
      const key = parent ? `${parent}/${node.key}` : node.key
      return { ...node, key, children: node.children && keyed(node.children, key) }
    })
  return keyed(tree)
}

/** The footer of the sidebar. */
export const adminFooterNav = (admin: string): NavNode[] => [
  { key: 'Потребители', label: 'Потребители', href: `${admin}/collections/users` },
  { key: 'Изход', label: 'Изход', href: `${admin}/logout` },
]

/** What screen is open, as the server sees it. */
export type NavLocation = {
  /** The path after the admin route: «», «/collections/courses», «/collections/courses/12». */
  path: string
  /** The list's filter, when it's one of the menu's: field and value. */
  filter?: { field: string; value: string }
  /** The open document, for the collections whose branch depends on it. */
  doc?: { category?: string | null; type?: string | null }
}

const branchOfCategory: Record<string, string> = {
  languages: 'Обучения/Езикови курсове',
  vocational: 'Обучения/Професии (ЦПО)',
  teachers: 'Обучения/Педагогически специалисти',
  farmers: 'Обучения/Земеделски стопани',
  computer: 'Обучения/Компютърни курсове',
}

const branchOfProgram: Record<string, string> = {
  language: 'Обучения/Езикови курсове/Програми',
  vocational: 'Обучения/Професии (ЦПО)/Страница',
  teachers: 'Обучения/Педагогически специалисти/Страница',
  farmers: 'Обучения/Земеделски стопани/Страница',
  computer: 'Обучения/Компютърни курсове/Страница',
  vouchers: 'Обучения/Ваучери/Страница',
  translations: 'Преводи/Страница',
}

/** A course's place in the menu: its branch's «Курсове» (the teachers' branch has no list). */
function courseKey(category?: string | null): string {
  const branch = category ? branchOfCategory[category] : undefined
  return branch && category !== 'teachers' ? `${branch}/Курсове` : 'Обучения/Всички курсове'
}

const collectionKeys: Record<string, string> = {
  inquiries: 'Запитвания',
  'inquiry-files': 'Запитвания',
  prices: 'Цени',
  news: 'Новини',
  'textbook-systems': 'Обучения/Езикови курсове/Учебни системи',
  certificates: 'Обучения/Езикови курсове/Сертификати',
  professions: 'Обучения/Професии (ЦПО)/Професии',
  exams: 'Обучения/Професии (ЦПО)/Изпити',
  'teacher-programmes': 'Обучения/Педагогически специалисти/Програми',
  team: 'За нас/Екип',
  documents: 'За нас/Документи и лицензи',
  'funded-projects': 'За нас/Проекти',
  offices: 'Контакти/Офиси',
  'legal-pages': 'Сайт/Правни страници',
  redirects: 'Сайт/Пренасочвания',
  users: 'Потребители',
}

const globalKeys: Record<string, string> = {
  home: 'Начална страница',
  about: 'За нас/Страница',
  contact: 'Контакти/Страница',
  navigation: 'Сайт/Навигация',
  site: 'Сайт/Данни за фирмата',
  'inquiry-routing': 'Запитвания',
}

/** The key of the menu item the open screen belongs to, or undefined (the account page). */
export function activeNavKey({ path, filter, doc }: NavLocation): string | undefined {
  if (path === '' || path === '/') return 'Табло'
  const [, kind, slug, id] = path.split('/')
  if (kind === 'globals') return globalKeys[slug]
  if (kind !== 'collections') return undefined
  if (slug === 'courses' || slug === 'groups') {
    // A course's screen sits under its branch, a voucher course too.
    if (id) return courseKey(doc?.category)
    if (filter?.field === 'voucherEligible') return 'Обучения/Ваучери/Курсове'
    return filter?.field === 'category' ? courseKey(filter.value) : 'Обучения/Всички курсове'
  }
  if (slug === 'programs') {
    const type = id ? doc?.type : filter?.field === 'type' ? filter.value : undefined
    return (type && branchOfProgram[type]) || 'Обучения/Езикови курсове/Програми'
  }
  return collectionKeys[slug]
}

/** The items from the root to the one with this key. */
export function navTrail(tree: NavNode[], key: string | undefined): NavNode[] {
  if (!key) return []
  for (const node of tree) {
    if (node.key === key) return [node]
    if (node.children && key.startsWith(`${node.key}/`)) {
      const rest = navTrail(node.children, key)
      if (rest.length) return [node, ...rest]
    }
  }
  return []
}

/**
 * The admin's 404: the server sees no path for it, so the screen looks like the dashboard's. The
 * address in the browser tells them apart.
 */
export const lostFrom = (activeKey: string | undefined, pathname: string | null, admin: string) =>
  activeKey === 'Табло' && !!pathname && pathname.replace(/\/$/, '') !== admin.replace(/\/$/, '')
