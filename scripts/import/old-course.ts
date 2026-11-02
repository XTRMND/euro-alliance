// The old site's course fields (/Courses/N) read for the import's groups (CLAUDE.md § 12): the
// price as written becomes an amount, its currency and the label before it («ПРОМОЦИЯ - 495 евро»
// → 495 €, «Промоция»); never converted, never guessed.

export type OldPrice = {
  price: number
  currency: 'EUR' | 'BGN'
  /** «Промоция», «Базова цена», «Стойност на ваучера». */
  priceLabel?: string
}

const labels: [RegExp, string][] = [
  [/промоция/i, 'Промоция'],
  [/базова\s+цена/i, 'Базова цена'],
  [/стойност\s+на\s+ваучер/i, 'Стойност на ваучера'],
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
