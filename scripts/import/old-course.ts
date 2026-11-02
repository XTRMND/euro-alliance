// The old site's course fields (/Courses/N) read for the import's groups (CLAUDE.md § 12): the
// price as written becomes an amount, its currency and the label before it («ПРОМОЦИЯ - 495 евро»
// → 495 €, «промоция»), and the level and title cleaned for the card; never converted, never
// guessed.

export type OldPrice = {
  price: number
  currency: 'EUR' | 'BGN'
  /** «промоция», «базова цена», «стойност на ваучера». */
  priceLabel?: string
}

// Lowercase, as the chips on Figma's course cards («за целия курс»).
const labels: [RegExp, string][] = [
  [/промоция/i, 'промоция'],
  [/базова\s+цена/i, 'базова цена'],
  [/стойност\s+на\s+ваучер/i, 'стойност на ваучера'],
]

/** The price of an old course, or null when it has none («ask», empty). */
export function parseOldPrice(text: string | undefined): OldPrice | null {
  const value = text?.trim() ?? ''
  const amount = value.match(/(\d[\d\s]*(?:[.,]\d+)?)/)?.[1]
  if (!amount) return null
  const price = Number(amount.replace(/\s/g, '').replace(',', '.'))
  const currency = /лв/i.test(value) ? 'BGN' : 'EUR'
  const priceLabel = labels.find(([pattern]) => pattern.test(value))?.[1]
  return { price, currency, ...(priceLabel ? { priceLabel } : {}) }
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
