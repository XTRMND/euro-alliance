import { expect, test } from '@playwright/test'
import { devRoutes, routes } from '@/lib/routes'

// The news pages (PR 15). CI's database has no news, so the listing shows its hero and empty
// line, and the article's parts are checked on the dev gallery's fake article.

test.use({ viewport: { width: 1440, height: 900 } })

test('the listing has its hero, and a page past the last is not found', async ({ page }) => {
  await page.goto(routes.news())
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Новини за нас')
  const response = await page.goto(routes.news(99))
  expect(response?.status()).toBe(404)
})

test('the article’s contents rail links its sections and follows the reading', async ({ page }) => {
  await page.goto(devRoutes.news)
  const rail = page.getByRole('navigation', { name: /Съдържание/ }).first()

  await expect(rail.getByRole('link')).toHaveCount(3)
  await rail.getByRole('link', { name: 'Тестов раздел две' }).click()
  await expect(page.locator('#testov-razdel-dve')).toBeInViewport()
  await expect(rail.getByRole('link', { name: 'Тестов раздел две' })).toHaveAttribute(
    'aria-current',
    'location',
  )
})

test('the link card is one link to the other site, and the share link goes to Facebook', async ({
  page,
}) => {
  await page.goto(devRoutes.news)

  const card = page.getByRole('link', { name: /Тестова връзка/ })
  await expect(card).toHaveAttribute('href', 'https://example.com/test')
  await expect(card).toHaveAttribute('target', '_blank')
  await expect(page.getByRole('link', { name: /Сподели във Facebook/ })).toHaveAttribute(
    'href',
    /facebook\.com\/sharer\/sharer\.php\?u=https%3A%2F%2Fexample\.com/,
  )
})

test('the pagination marks the current page and links the others', async ({ page }) => {
  await page.goto(devRoutes.news)
  const pages = page.getByRole('navigation', { name: 'Страници' })

  await expect(pages.locator('[aria-current="page"]')).toHaveText(/2/)
  await expect(pages.getByRole('link', { name: 'Следваща' })).toHaveAttribute(
    'href',
    routes.news(3),
  )
  await expect(pages.getByRole('link', { name: 'Предишна' })).toHaveAttribute('href', routes.news())
})

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('the contents box opens the sections', async ({ page }) => {
    await page.goto(devRoutes.news)
    const toggle = page.getByRole('button', { name: /Съдържание · 1 мин. четене/ })

    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await page.getByRole('link', { name: 'Тестов раздел три' }).last().click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#testov-razdel-tri')).toBeInViewport()
  })
})
