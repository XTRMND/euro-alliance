import { expect, test } from '@playwright/test'
import { devRoutes } from '@/lib/routes'

// Pattern components (PR 6) on the dev gallery: what assistive technology gets.

for (const width of [1440, 390]) {
  test(`the data table stays a table with headers at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(devRoutes.patterns)

    const table = page.getByRole('table', { name: 'Изпити', exact: true })
    await expect(table).toBeVisible()
    await expect(table.getByRole('columnheader')).toHaveCount(5)
    await expect(table.getByRole('cell', { name: 'Тестова професия' })).toBeVisible()
  })
}

test('the empty table says so', async ({ page }) => {
  await page.goto(devRoutes.patterns)

  await expect(
    page
      .getByRole('table', { name: 'Изпити, празна таблица' })
      .getByText('В момента няма обявени изпити.'),
  ).toBeVisible()
})

test('numbered lists are ordered lists, the others are not', async ({ page }) => {
  await page.goto(devRoutes.patterns)
  const section = page.getByRole('region', { name: 'List row' })

  await expect(section.locator('ol')).toHaveCount(1)
  await expect(section.locator('ul')).toHaveCount(2)
})

test('the count bubble reads as number and label', async ({ page }) => {
  await page.goto(devRoutes.patterns)

  await expect(
    page.getByRole('region', { name: 'Figure card and Count bubble' }).getByText('B2Ниво'),
  ).toBeVisible()
})

// Figure cards (Trello #5): «2010-2016» ran out of its card wherever the card was narrower than
// 226px: with seven figures, every width from 768px and phones up to about 520px.
for (const width of [320, 390, 520, 768, 1024, 1368, 1920]) {
  test(`figures and labels stay inside their cards at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(devRoutes.patterns)
    await page.evaluate(() => document.fonts.ready)

    const row = page.getByRole('region', { name: 'Figure row' })
    await expect(row.getByText('2010-2016')).toBeVisible()

    const problems = await row.evaluate((section) => {
      const grid = section.firstElementChild!
      const cards = [...grid.children]
      const found: string[] = []
      const edge = grid.getBoundingClientRect().right + 0.5
      for (const [i, card] of cards.entries()) {
        const box = card.getBoundingClientRect()
        if (box.right > edge) found.push(`card ${i} leaves the row`)
        for (const other of cards.slice(i + 1)) {
          const next = other.getBoundingClientRect()
          const overlap =
            box.left < next.right - 0.5 &&
            next.left < box.right - 0.5 &&
            box.top < next.bottom - 0.5 &&
            next.top < box.bottom - 0.5
          if (overlap) found.push(`card ${i} overlaps another`)
        }
        for (const text of card.querySelectorAll('p')) {
          const range = document.createRange()
          range.selectNodeContents(text)
          const ink = range.getBoundingClientRect()
          if (ink.right > box.right + 0.5 || ink.left < box.left - 0.5) {
            found.push(`«${text.textContent}» leaves its card`)
          }
        }
      }
      return found
    })
    expect(problems).toEqual([])
  })
}
