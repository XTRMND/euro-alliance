import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { routes } from '@/lib/routes'

// The course listing (PR 9) on the seeded database, which has no courses: the filters, the URL and
// the sheet. The queries themselves are tested against a database with courses in
// tests/int/courses.test.ts.

test.describe('filters (desktop)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('go into the URL, and the back button undoes them', async ({ page }) => {
    await page.goto(routes.courses())
    const filters = page.getByRole('complementary', { name: 'Филтри' })

    await filters.getByRole('checkbox', { name: 'Възрастни' }).check()
    await expect(page).toHaveURL(/\?auditoria=vazrastni$/)
    await filters.getByRole('checkbox', { name: 'Немски' }).check()
    await expect(page).toHaveURL(/\?auditoria=vazrastni&ezik=nemski$/)

    await page.goBack()
    await expect(page).toHaveURL(/\?auditoria=vazrastni$/)
    await expect(filters.getByRole('checkbox', { name: 'Немски' })).not.toBeChecked()
  })

  test('are read back from a shared link, and cleared', async ({ page }) => {
    await page.goto(`${routes.courses('languages')}&format=onlayn&sortirane=tsena`)
    const filters = page.getByRole('complementary', { name: 'Филтри' })

    await expect(filters.getByRole('checkbox', { name: 'Езици' })).toBeChecked()
    await expect(filters.getByRole('checkbox', { name: 'Онлайн' })).toBeChecked()
    await expect(page.getByRole('combobox', { name: 'Сортиране:' })).toHaveValue('price')

    await filters.getByRole('button', { name: 'Изчисти филтрите' }).click()
    await expect(page).toHaveURL(/\/kursove\?sortirane=tsena$/)
    await expect(filters.getByRole('checkbox', { name: 'Езици' })).not.toBeChecked()
  })

  test('say so when no course matches', async ({ page }) => {
    await page.goto(routes.courses())

    await expect(page.getByRole('heading', { level: 2, name: '0 курса' })).toBeVisible()
    await expect(page.getByText('Няма курсове с тези филтри.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Покажи още курсове' })).toHaveCount(0)
  })
})

test.describe('filters sheet (mobile)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('opens as a dialog, applies filters and gives focus back', async ({ page }) => {
    await page.goto(routes.courses())
    const open = page.getByRole('button', { name: /^Филтри/ })
    await expect(page.getByRole('complementary', { name: 'Филтри' })).toBeHidden()

    await open.click()
    const sheet = page.getByRole('dialog', { name: 'Филтри' })
    await expect(sheet).toBeVisible()
    await sheet.getByRole('checkbox', { name: 'Онлайн' }).check()
    await expect(page).toHaveURL(/\?format=onlayn$/)
    await expect(sheet).toBeVisible()

    await sheet.getByRole('button', { name: /^Покажи/ }).click()
    await expect(sheet).toBeHidden()
    await expect(open).toBeFocused()
    await expect(open).toContainText('1')
  })

  test('has no axe violations while open', async ({ page }) => {
    await page.goto(routes.courses())
    await page.getByRole('button', { name: /^Филтри/ }).click()
    await expect(page.getByRole('dialog', { name: 'Филтри' })).toBeVisible()

    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations).toEqual([])
  })

  test('closes with Escape', async ({ page }) => {
    await page.goto(routes.courses())
    await page.getByRole('button', { name: /^Филтри/ }).click()
    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog', { name: 'Филтри' })).toBeHidden()
  })
})
