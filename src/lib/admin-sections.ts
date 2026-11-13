// A programme's sections in the admin («Admin · 08 Програма», 373:1726): what each kind of
// section is called, which group of «Добави секция» it's under, its little type icon, and the
// one-line summary a section's row shows instead of «Item 01». Without Payload, so it's unit-tested.

export type SectionIcon = 'cards' | 'rows' | 'figures' | 'single'

export const sectionGroups = {
  content: 'Съдържание',
  programmes: 'Курсове и програми',
  contact: 'Контакт и проекти',
} as const
type SectionGroup = keyof typeof sectionGroups

type Kind = {
  /** The name in the row and in «Добави секция». */
  name: string
  /** What it is, in a few words (the drawer's second line; the row's summary when it has no content). */
  hint: string
  group: SectionGroup
  icon: SectionIcon
  /** The list a summary counts, with its words: «1 карта», «4 карти». */
  list?: { field: string; one: string; many: string; title?: string }
}

export const sectionKinds = {
  features: {
    name: 'Предимства',
    hint: 'Карти с кратък текст',
    group: 'content',
    icon: 'cards',
    list: { field: 'items', one: 'карта', many: 'карти', title: 'title' },
  },
  steps: {
    name: 'Стъпки',
    hint: 'Номерирани стъпки',
    group: 'content',
    icon: 'rows',
    list: { field: 'items', one: 'стъпка', many: 'стъпки', title: 'title' },
  },
  figures: {
    name: 'В цифри',
    hint: 'Числа с надпис',
    group: 'content',
    icon: 'figures',
    list: { field: 'items', one: 'число', many: 'числа', title: 'figure' },
  },
  faq: {
    name: 'Въпроси',
    hint: 'Въпроси и отговори',
    group: 'content',
    icon: 'rows',
    list: { field: 'items', one: 'въпрос', many: 'въпроса', title: 'question' },
  },
  faqColumns: {
    name: 'Въпроси в две колони',
    hint: 'По-дълъг списък',
    group: 'content',
    icon: 'rows',
    list: { field: 'columns', one: 'колона', many: 'колони', title: 'heading' },
  },
  indexCards: {
    name: 'Индекс карти',
    hint: 'Връзки към раздели',
    group: 'content',
    icon: 'cards',
    list: { field: 'cards', one: 'карта', many: 'карти', title: 'title' },
  },
  levels: {
    name: 'Нива',
    hint: 'Нива с кратък текст',
    group: 'content',
    icon: 'rows',
    list: { field: 'items', one: 'ниво', many: 'нива', title: 'level' },
  },
  callout: { name: 'Покана', hint: 'Каре с текст и бутон', group: 'content', icon: 'single' },
  richText: { name: 'Текст', hint: 'Свободен текст', group: 'content', icon: 'rows' },
  textbookSystems: {
    name: 'Учебни системи',
    hint: 'От «Учебни системи»',
    group: 'programmes',
    icon: 'cards',
  },
  systemCards: {
    name: 'Системни карти',
    hint: 'Карти за системи',
    group: 'programmes',
    icon: 'cards',
    list: { field: 'cards', one: 'карта', many: 'карти', title: 'title' },
  },
  certificates: {
    name: 'Сертификати',
    hint: 'От «Изпити и сертификати»',
    group: 'programmes',
    icon: 'cards',
  },
  teacherProgrammes: {
    name: 'Програми за учители',
    hint: 'От «Програми»',
    group: 'programmes',
    icon: 'rows',
  },
  professions: { name: 'Професии', hint: 'От «Професии»', group: 'programmes', icon: 'rows' },
  exams: { name: 'Изпити', hint: 'От «Изпитни сесии»', group: 'programmes', icon: 'rows' },
  priceFactors: {
    name: 'От какво зависи цената',
    hint: 'Фактори за цената',
    group: 'programmes',
    icon: 'figures',
    list: { field: 'items', one: 'фактор', many: 'фактора', title: 'title' },
  },
  locations: { name: 'Локации', hint: 'Офиси с карта', group: 'contact', icon: 'single' },
  sendDocument: {
    name: 'Изпрати документ',
    hint: 'Форма за превод',
    group: 'contact',
    icon: 'single',
  },
  projects: { name: 'Проекти', hint: 'От «Проекти»', group: 'contact', icon: 'cards' },
} as const satisfies Record<string, Kind>

export type SectionSlug = keyof typeof sectionKinds

export const sectionKind = (slug: string | null | undefined): Kind | undefined =>
  slug && slug in sectionKinds ? sectionKinds[slug as SectionSlug] : undefined

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/**
 * A section's one line: «4 карти · Групово обучение, Индивидуално обучение», or its own heading,
 * or (a section that fills itself from a list elsewhere, or an empty one) what the kind is.
 */
export function sectionSummary(slug: string | null | undefined, data: unknown): string {
  const kind = sectionKind(slug)
  if (!kind) return ''
  const row = (data ?? {}) as Record<string, unknown>
  const rows =
    kind.list && Array.isArray(row[kind.list.field]) ? (row[kind.list.field] as unknown[]) : []
  if (kind.list && rows.length) {
    const count = `${rows.length} ${rows.length === 1 ? kind.list.one : kind.list.many}`
    const titles = rows
      .map((item) => text((item as Record<string, unknown> | null)?.[kind.list!.title ?? '']))
      .filter(Boolean)
    return titles.length ? `${count} · ${titles.join(', ')}` : count
  }
  return text(row.heading) || kind.hint
}

// The site's colours, for the drawer's thumbnails (an image can't read a CSS custom property).
// tests/unit/admin-sections.test.ts holds them to src/styles/tokens.css.
export const thumbnailColours = {
  paper: '#f7f3ec', // --color-bg-warm
  navy: '#0c427e', // --color-brand-primary
  muted: '#5a6676', // --color-text-muted
  sand: '#c0aa81', // --color-brand-accent
}

/** The type icon as an image (40 × 32, Figma 373:1957), for «Добави секция». */
export function sectionThumbnail(icon: SectionIcon): string {
  const { paper, navy, muted, sand } = thumbnailColours
  const bars = (fill: string) =>
    [6, 16, 26]
      .map((x) => `<rect x="${x}" y="9" width="8" height="14" rx="1.5" fill="${fill}"/>`)
      .join('')
  const shapes: Record<SectionIcon, string> = {
    cards: bars(navy),
    figures: bars(sand),
    rows: [8, 14.5, 21]
      .map(
        (y, i) =>
          `<rect x="7" y="${y}" width="26" height="3" rx="1.5" fill="${i ? muted : navy}"/>`,
      )
      .join(''),
    single: `<rect x="15" y="11" width="10" height="10" rx="1.5" fill="${navy}"/>`,
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 32"><rect width="40" height="32" rx="6" fill="${paper}"/>${shapes[icon]}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
