// The old site's course fields (/Courses/N) read for the import's groups (CLAUDE.md § 12): the
// price as written becomes an amount in euro and the label before it («ПРОМОЦИЯ - 495 евро» →
// 495 €, «промоция»; лв. at the fixed rate, rounded to 5 €), the group's end is estimated (none
// is written), and the level and title are cleaned for the card.

export type OldPrice = {
  /** In euro. */
  price: number
  currency: 'EUR'
  /** «промоция», «базова цена», «стойност на ваучера». */
  priceLabel?: string
  /** The amount in лв. as written, when it was converted. */
  bgn?: number
}

/** Bulgaria's fixed conversion rate (лв. per euro, since 01.01.2026). */
export const bgnPerEuro = 1.95583

/** лв. to euro at the fixed rate, rounded to the nearest 5 € (the user, 02.11.2026). */
export const euroFromBgn = (bgn: number) => Math.round(bgn / bgnPerEuro / 5) * 5

// Lowercase, as the chips on Figma's course cards («за целия курс»).
const labels: [RegExp, string][] = [
  [/промоция/i, 'промоция'],
  [/базова\s+цена/i, 'базова цена'],
  [/стойност\s+на\s+ваучер/i, 'стойност на ваучера'],
]

/**
 * The price of an old course in euro, or null when it has none («ask», empty). Euro amounts stay
 * as written (460,16 €); amounts in лв. are converted (580 лв. → 295 €).
 */
export function parseOldPrice(text: string | undefined): OldPrice | null {
  const value = text?.trim() ?? ''
  const amount = value.match(/(\d[\d\s]*(?:[.,]\d+)?)/)?.[1]
  if (!amount) return null
  const written = Number(amount.replace(/\s/g, '').replace(',', '.'))
  const bgn = /лв/i.test(value)
  const priceLabel = labels.find(([pattern]) => pattern.test(value))?.[1]
  return {
    price: bgn ? euroFromBgn(written) : written,
    currency: 'EUR',
    ...(priceLabel ? { priceLabel } : {}),
    ...(bgn ? { bgn: written } : {}),
  }
}

export type GroupEnd = {
  /** YYYY-MM-DD. */
  endDate: string
  /** How it was estimated, for the report. */
  how: string
}

const weekdays = /понеделник|вторник|сряда|четвъртък|петък|събота|неделя/gi

/**
 * The end of an old group, which the old site never gave (the user, 02.11.2026): from its total
 * hours and its hours a week when both are written («100», «Събота по 3 уч.часа» → 100 ÷ 3 ≈ 33
 * weeks), otherwise 9 months after the start. Hours a week are known only when the entry says how
 * many each day («по 3 уч.часа»); clock times aren't turned into academic hours. «понеделник и
 * сряда / вторник и четвъртък» are two schedules of two days each: two days a week.
 */
export function estimateGroupEnd(
  startDate: string,
  fields: { total?: string; days?: string; hours?: string },
): GroupEnd {
  const total = Number(fields.total?.match(/\d+/)?.[0] ?? NaN)
  const perDay = Number(
    `${fields.days ?? ''} ${fields.hours ?? ''}`.match(/по\s*(\d+)\s*уч/i)?.[1] ?? NaN,
  )
  const firstSchedule = (fields.days ?? '').split('/')[0]
  const days = /понеделник\s+до\s+петък/i.test(firstSchedule)
    ? 5
    : (firstSchedule.match(weekdays) ?? []).length
  const start = new Date(`${startDate}T00:00:00Z`)
  if (total > 0 && perDay > 0 && days > 0) {
    const weeks = total / (perDay * days)
    const end = new Date(start.getTime() + Math.round(weeks * 7) * 86_400_000)
    return {
      endDate: end.toISOString().slice(0, 10),
      how: `${total} h ÷ ${perDay * days} h a week ≈ ${Math.round(weeks)} weeks`,
    }
  }
  const end = new Date(start)
  end.setUTCMonth(end.getUTCMonth() + 9)
  return { endDate: end.toISOString().slice(0, 10), how: '9 months after the start' }
}

// Level codes on the old site are often typed with Cyrillic look-alikes: «В2», «А1 A2 B1»,
// «Р2, Р3». In a code (a letter before a digit) they become Latin.
const lookAlikes: Record<string, string> = { А: 'A', В: 'B', С: 'C', Р: 'P' }

/** «В2 Upper-Intermediate» → «B2 Upper-Intermediate»: Cyrillic look-alikes in level codes. */
export function latinLevelCodes(text: string): string {
  return text.replace(/(?<![\p{L}])([АВСР])(?=\d)/gu, (letter) => lookAlikes[letter])
}

export type OldLevel = { level: string; levelUnit: 'level' | 'grade'; levelName: string }

const codePattern = /(?<![\p{L}])[ABCPS]\d(?!\d)/gu

/**
 * The level bubble from the old «Ниво» text: one level as is («B2»), a span as a range («А1 A2
 * B1» → «A1–B1», «Р2, Р3, Р4, S1, S2» → «P2–S2») with the label НИВО; school years when there
 * are no codes («11-12 клас» → «11–12», «6-ти и 7-ми клас» → «6–7») with the label КЛАС. The full
 * text (with Latin codes) stays for the course page. Null when nothing can be read.
 */
export function parseOldLevel(text: string | undefined): OldLevel | null {
  const levelName = latinLevelCodes(text?.trim() ?? '')
  if (!levelName) return null
  const codes = levelName.match(codePattern) ?? []
  if (codes.length)
    return {
      level: codes.length === 1 ? codes[0] : `${codes[0]}–${codes.at(-1)}`,
      levelUnit: 'level',
      levelName,
    }
  if (/клас/i.test(levelName)) {
    const years = levelName.match(/\d{1,2}/g) ?? []
    if (years.length)
      return {
        level: years.length === 1 ? years[0] : `${years[0]}–${years.at(-1)}`,
        levelUnit: 'grade',
        levelName,
      }
  }
  return null
}

// The old site's levels from the youngest to the oldest: P and S (2nd to 7th grade, by the old
// entries' own order «Р2, Р3, Р4, S1, S2, S3, B2 и С1»), then CEFR.
const levelOrder = ['P1', 'P2', 'P3', 'P4', 'S1', 'S2', 'S3', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

/**
 * One bubble for a course whose groups each have a level: the span of all their codes («P2–S2»,
 * «S1–S2» and «P2…C1» → «P2–C1»). One group keeps its own level and full text.
 */
export function mergeOldLevels(texts: (string | undefined)[]): OldLevel | null {
  const levels = texts.map(parseOldLevel).filter((level): level is OldLevel => level !== null)
  if (levels.length <= 1) return levels[0] ?? null
  if (levels.some((level) => level.levelUnit !== 'level')) return levels[0]
  const codes = [...new Set(levels.flatMap((level) => level.levelName.match(codePattern) ?? []))]
  codes.sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b))
  const level = codes.length === 1 ? codes[0] : `${codes[0]}–${codes.at(-1)}`
  return { level, levelUnit: 'level', levelName: level }
}

/**
 * A course title without the audience and format words its tags already show, and with its
 * level codes in Latin and as a range: «Английски език В2 Възрастни ОНЛАЙН» → «Английски език
 * B2», «Английски език ниво А1 А2 В1 С ВАУЧЕРИ ОТ АЗ» → «Английски език A1–B1». The old title is
 * kept in `originalTitle`.
 */
export function cleanCourseTitle(title: string): string {
  return (
    latinLevelCodes(title)
      .replace(
        /(?:(?<!\p{L})(ниво|нива)\s+)?((?:[ABCPS]\d(?!\d)[,\s]*(?:и\s+)?){2,})/giu,
        (match, word: string | undefined, list: string) => {
          const codes = list.match(codePattern) ?? []
          const range = `${codes[0]}–${codes.at(-1)}`
          const trailing = /\s$/.test(list) ? ' ' : ''
          // «ниво А1 А2 В1» loses «ниво»; «от нива Р2, …» keeps its «нива».
          return `${word && /нива/i.test(word) ? `${word} ` : ''}${range}${trailing}`
        },
      )
      .replace(/\s*(?<!\p{L})с\s+ваучери?\s+от\s+(АЗ|Агенцията по заетостта)(?!\p{L})/giu, '')
      .replace(/(?<![\p{L}])(възрастни|ученици|онлайн|присъствено)(?![\p{L}])/giu, '')
      // Words in capitals become lowercase («СЪБОТНИ ГРУПИ» → «Съботни групи»), as in the approved
      // «Подготовка по БЕЛ за ДЗИ»; abbreviations (three letters or fewer, and НАПОО) stay.
      .replace(/(?<!\p{L})[А-Я]{4,}(?!\p{L})/gu, (word) =>
        keepCapitals.has(word) ? word : word.toLowerCase(),
      )
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+([,)])/g, '$1')
      .trim()
      .replace(/^\p{Ll}/u, (letter) => letter.toUpperCase())
  )
}

const keepCapitals = new Set(['НАПОО'])
