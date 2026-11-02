/**
 * The page numbers a pagination shows: the first, the last, and the current one with its
 * neighbours, a gap ('…') where pages are left out. A gap would hide a single page, so that page
 * shows instead: 1 2 3 4 5 … 34, 1 … 9 10 11 … 34.
 */
export function pageWindow(page: number, pages: number): (number | 'gap')[] {
  const shown = new Set([1, pages, page - 1, page, page + 1])
  if (page <= 3) [2, 3, 4, 5].forEach((n) => shown.add(n))
  if (page >= pages - 2) [pages - 4, pages - 3, pages - 2, pages - 1].forEach((n) => shown.add(n))
  const numbers = [...shown].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  for (const n of numbers) {
    const previous = out.at(-1)
    if (typeof previous === 'number' && n - previous === 2) out.push(n - 1)
    else if (typeof previous === 'number' && n - previous > 2) out.push('gap')
    out.push(n)
  }
  return out
}
