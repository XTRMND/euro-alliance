import { expect, test } from '@playwright/test'
import { routes } from '@/lib/routes'

// Search (PR 18), over the seeded pages: the programs, the legal pages and About.

test.use({ viewport: { width: 1440, height: 900 } })

test('a search finds the pages and marks the words', async ({ page }) => {
  await page.goto(routes.search('бисквитки'))
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Резултати за «бисквитки»')
  await expect(page.getByRole('searchbox', { name: 'Търсене в сайта' })).toHaveValue('бисквитки')

  const result = page.getByRole('link', { name: /Политика за бисквитките/ })
  await expect(result).toHaveAttribute('href', routes.cookies())
  await expect(result.locator('mark').first()).toHaveText(/бисквитки/i)
})

test('the field searches, and a typo still finds the page', async ({ page }) => {
  await page.goto(routes.search())
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Търсене')
  await expect(page.getByRole('tablist')).toHaveCount(0)

  await page.getByRole('searchbox', { name: 'Търсене в сайта' }).fill('англйски')
  await page.getByRole('button', { name: 'Търси' }).click()
  await expect(page).toHaveURL(/\?q=/)
  await expect(page.getByRole('link', { name: /Английски език за възрастни/ })).toBeVisible()
})

test('the tabs filter the results and stay in the address', async ({ page }) => {
  await page.goto(routes.search('английски'))
  const tabs = page.getByRole('tablist', { name: 'Резултати по вид' })
  const all = tabs.getByRole('tab', { name: /Всичко \(\d+\)/ })
  const pages = tabs.getByRole('tab', { name: /Страници \(\d+\)/ })
  await expect(all).toHaveAttribute('aria-selected', 'true')

  await pages.click()
  await expect(pages).toHaveAttribute('aria-selected', 'true')
  await expect(page).toHaveURL(/vid=stranitsi/)
  await expect(page.getByRole('heading', { name: 'Страници', level: 2 })).toBeVisible()

  await page.keyboard.press('Home')
  await expect(all).toBeFocused()
  await expect(all).toHaveAttribute('aria-selected', 'true')
  await expect(page).not.toHaveURL(/vid=/)

  await page.goto(routes.search('английски', 'pages'))
  await expect(pages).toHaveAttribute('aria-selected', 'true')
})

test('without results it says so and offers the main sections', async ({ page }) => {
  await page.goto(routes.search('xyzzy'))
  await expect(page.getByText('Няма резултати за «xyzzy».', { exact: false })).toBeVisible()
  await expect(
    page
      .getByRole('navigation', { name: 'Основни раздели' })
      .getByRole('link', { name: 'Курсове' }),
  ).toHaveAttribute('href', routes.courses())
})

test('the results page isn’t indexed', async ({ page }) => {
  await page.goto(routes.search('английски'))
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})
