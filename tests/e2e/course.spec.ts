import { expect, test } from '@playwright/test'
import { devRoutes, routes } from '@/lib/routes'

// The course page (PR 10). The seeded database has no courses, so the states of board 126:1940
// are checked on the dev gallery, which renders the page's parts with fake courses.

const state = (page: import('@playwright/test').Page, name: string) =>
  page.getByRole('region', { name, exact: true })

test.describe('course states (dev gallery)', () => {
  test('a promotion shows the regular price struck through', async ({ page }) => {
    await page.goto(devRoutes.course)
    const ticket = state(page, 'Промоция')

    await expect(ticket.locator('s')).toHaveText('120 €')
    await expect(ticket).toContainText('Свободни места: 5')
  })

  test('a voucher course explains the voucher', async ({ page }) => {
    await page.goto(devRoutes.course)
    const ticket = state(page, 'С ваучер')

    await expect(ticket).toContainText('стойност на ваучера')
    await expect(ticket).toContainText(
      'Може да се плати изцяло с ваучер от Агенцията по заетостта.',
    )
  })

  test('few seats are highlighted, a full course closes enrolment', async ({ page }) => {
    await page.goto(devRoutes.course)

    await expect(state(page, 'Малко места')).toContainText('Остават само 2 места')
    const closed = state(page, 'Няма места')
    await expect(closed).toContainText('записването приключи')
    await expect(closed).toContainText('Няма свободни места')
    await expect(closed.getByRole('link', { name: 'Уведоми ме за следващия курс' })).toBeVisible()
  })

  test('a running group: «В ход от …» and an inquiry; no group: «Попитайте»', async ({ page }) => {
    await page.goto(devRoutes.course)
    const running = state(page, 'В ход')
    await expect(running).toContainText('В ход от 1 декември 2098')
    await expect(running.getByRole('link', { name: 'Запитване' })).toBeVisible()

    const undated = state(page, 'Няма насрочена дата')
    await expect(undated).toContainText('Няма насрочена дата')
    await expect(undated).toContainText('Попитайте')
    await expect(undated.getByRole('link', { name: 'Запитване' })).toBeVisible()
  })

  test('empty fields are left out', async ({ page }) => {
    await page.goto(devRoutes.course)
    const ticket = state(page, 'Липсващи полета')

    await expect(ticket.getByText('Учебни дни')).toHaveCount(0)
    await expect(ticket.getByText('Участници')).toHaveCount(0)
    await expect(ticket.getByText('Цена', { exact: true })).toHaveCount(0)
    await expect(ticket.getByRole('heading', { name: 'Къде и за кого' })).toBeVisible()
  })
})

test('an unknown course is a 404', async ({ page }) => {
  const response = await page.goto(routes.course('nyama-takav-kurs'))
  expect(response?.status()).toBe(404)
})
