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
