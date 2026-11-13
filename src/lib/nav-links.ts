import { destinations } from './destinations'
import { type AboutSection, type Audience, type Language, aboutSections, routes } from './routes'

// Navigation links are picked, not typed (docs/admin-redesign.md, decision 10). A link is a
// programme or a course (a relationship: it follows the page if its address changes, and hides
// while the page isn't published), a fixed page of the site (a select), or, as the fallback, an
// address typed by hand (an outside site, a phone, an email).

export const linkTypes = ['page', 'program', 'course', 'custom'] as const
export type LinkType = (typeof linkTypes)[number]

const aboutLabels: Record<AboutSection, string> = {
  history: 'история',
  team: 'екип',
  standards: 'стандарти',
  licences: 'лицензи',
  documents: 'документи',
  projects: 'проекти',
  elearning: 'електронно обучение',
}

/** The site's fixed pages and views a link can go to: the destinations, and a few more. */
export const sitePages = {
  home: { label: 'Начална страница', href: routes.home() },
  ...destinations,
  vocationalCourses: {
    label: 'Курсове: професионално обучение',
    href: routes.courses('vocational'),
  },
  ...(Object.fromEntries(
    (Object.keys(aboutSections) as AboutSection[])
      .filter((section) => section !== 'history')
      .map((section) => [
        `about-${section}`,
        { label: `За нас: ${aboutLabels[section]}`, href: routes.about(section) },
      ]),
  ) as Record<`about-${Exclude<AboutSection, 'history'>}`, { label: string; href: string }>),
  contactPlovdiv: { label: 'Контакти: Пловдив', href: routes.contactLocation('plovdiv') },
  contactSofia: { label: 'Контакти: София', href: routes.contactLocation('sofia') },
  search: { label: 'Търсене', href: routes.search() },
} as const

export type SitePage = keyof typeof sitePages

export const sitePageOptions = Object.entries(sitePages).map(([value, { label }]) => ({
  value,
  label,
}))

type ProgramRef = {
  id: number
  type: string
  language?: string | null
  audience?: string | null
}
type CourseRef = { id: number; slug?: string | null }

const programRoutes: Record<string, () => string> = {
  vocational: routes.professions,
  teachers: routes.teachers,
  farmers: routes.farmers,
  vouchers: routes.vouchers,
  computer: routes.computerCourses,
  translations: routes.translations,
}

/** A programme page's address, or undefined when it has none (a language page without its pair). */
export function programUrl(program: Omit<ProgramRef, 'id'>): string | undefined {
  if (program.type === 'language')
    return program.language && program.audience
      ? routes.languageProgram(program.language as Language, program.audience as Audience)
      : undefined
  return programRoutes[program.type]?.()
}

/** A link as the navigation stores it. */
export type StoredLink = {
  type?: LinkType | null
  page?: string | null
  program?: number | ProgramRef | null
  course?: number | CourseRef | null
  anchor?: string | null
  url?: string | null
}

/**
 * Where a link goes, or undefined: nothing picked, or a programme or course that isn't there for
 * a visitor (unpublished or deleted: it comes back as its id, or not at all).
 */
export function linkHref(link: StoredLink): string | undefined {
  switch (link.type) {
    case 'page':
      return link.page && link.page in sitePages ? sitePages[link.page as SitePage].href : undefined
    case 'program': {
      const url =
        link.program && typeof link.program === 'object' ? programUrl(link.program) : undefined
      return url && link.anchor ? `${url}#${link.anchor}` : url
    }
    case 'course':
      return link.course && typeof link.course === 'object' && link.course.slug
        ? routes.course(link.course.slug)
        : undefined
    case 'custom':
      return link.url || undefined
    default:
      return undefined
  }
}

const pageByHref = new Map(
  (Object.entries(sitePages) as [SitePage, { href: string }][])
    .map(([page, { href }]) => [href, page] as const)
    // The first of two pages with one address wins (the plainer one).
    .reverse(),
)

/**
 * A typed address as a picked link (the migration's rule): a programme page that exists, with its
 * section if the address had one; a course by its slug; a fixed page; else the address as it is.
 */
export function linkFromHref(
  href: string,
  known: { programs: ProgramRef[]; courses: CourseRef[] },
): Required<Pick<StoredLink, 'type'>> & Omit<StoredLink, 'type'> {
  const [path, anchor] = href.split('#', 2)
  const program = known.programs.find((candidate) => programUrl(candidate) === path)
  if (program) return { type: 'program', program: program.id, ...(anchor ? { anchor } : {}) }
  const slug = path.startsWith(`${routes.courses()}/`)
    ? path.slice(routes.courses().length + 1)
    : ''
  const course = slug ? known.courses.find((candidate) => candidate.slug === slug) : undefined
  if (course && !anchor) return { type: 'course', course: course.id }
  const page = pageByHref.get(href)
  if (page) return { type: 'page', page }
  return { type: 'custom', url: href }
}

/** A link as the site's header, menu and footer take it. */
export type SiteLink = { id?: string | null; label: string; href: string }
/** A header or menu item: a link, or a group of sub-links behind a disclosure button. */
export type SiteMenuItem = {
  id?: string | null
  label: string
  href?: string
  children: SiteLink[]
}
export type SiteNavigation = {
  header: { left: SiteMenuItem[]; right: SiteMenuItem[] }
  menu: SiteMenuItem[]
  footer: {
    id?: string | null
    heading: string
    links: (SiteLink & { icon?: 'facebook' | null })[]
  }[]
}

type StoredItem = StoredLink & { id?: string | null; label: string }
type StoredMenuItem = StoredItem & { children?: StoredItem[] | null }

/** The stored navigation with every link's address; a link with nowhere to go is left out. */
export function resolveNavigation(navigation: {
  header?: { left?: StoredMenuItem[] | null; right?: StoredMenuItem[] | null } | null
  menu?: StoredMenuItem[] | null
  footer?:
    | {
        id?: string | null
        heading: string
        links?: (StoredItem & { icon?: 'facebook' | null })[] | null
      }[]
    | null
}): SiteNavigation {
  const link = <T extends StoredItem>(item: T) => {
    const href = linkHref(item)
    return href ? [{ id: item.id, label: item.label, href }] : []
  }
  const items = (list?: StoredMenuItem[] | null): SiteMenuItem[] =>
    (list ?? []).flatMap((item) => {
      const children = (item.children ?? []).flatMap(link)
      if (children.length) return [{ id: item.id, label: item.label, children }]
      return link(item).map((resolved) => ({ ...resolved, children: [] }))
    })
  return {
    header: { left: items(navigation.header?.left), right: items(navigation.header?.right) },
    menu: items(navigation.menu),
    footer: (navigation.footer ?? []).map((column) => ({
      id: column.id,
      heading: column.heading,
      links: (column.links ?? []).flatMap((item) =>
        link(item).map((resolved) => ({ ...resolved, icon: item.icon })),
      ),
    })),
  }
}

type DescribedLink = {
  type?: LinkType | null
  page?: string | null
  program?: number | { id: number; title?: string | null } | null
  course?: number | { id: number; title?: string | null } | null
  url?: string | null
  children?: unknown[] | null
}

/**
 * Where a link goes, in the admin's words (Figma «Admin · 12 Навигация», 377:2711): «Страница ·
 * Всички курсове», «Програма · Преводи и легализация», «Само подменю». `titles` names the
 * programmes and courses the form holds only by id.
 */
export function describeLink(
  link: DescribedLink,
  titles: { programs?: Record<number, string>; courses?: Record<number, string> } = {},
): string {
  if (link.children?.length) return 'Само подменю'
  const named = (
    value: DescribedLink['program'],
    known: Record<number, string> | undefined,
    kind: string,
  ) => {
    if (!value) return kind
    const title = typeof value === 'object' ? value.title : known?.[value]
    return title ? `${kind} · ${title}` : kind
  }
  switch (link.type) {
    case 'page': {
      const page = link.page ? (sitePages as Record<string, { label: string }>)[link.page] : null
      return page ? `Страница · ${page.label}` : 'Страница'
    }
    case 'program':
      return named(link.program, titles.programs, 'Програма')
    case 'course':
      return named(link.course, titles.courses, 'Курс')
    case 'custom':
      return link.url ? `Адрес · ${link.url}` : 'Адрес'
    default:
      return 'Без връзка'
  }
}

/** «1 подвръзка», «3 подвръзки». */
export const childLinksLabel = (n: number) => `${n} ${n === 1 ? 'подвръзка' : 'подвръзки'}`
