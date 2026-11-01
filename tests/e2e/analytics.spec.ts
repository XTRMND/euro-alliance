import { expect, type Page, test } from '@playwright/test'
import { routes } from '@/lib/routes'

// GA4 behind statistics consent (PR 20, docs/measurement.md § 1). The server runs with the test
// ID G-TEST123456 (playwright.config.ts) and gtag.js is stubbed, so the checks read `dataLayer`.

test.use({ storageState: { cookies: [], origins: [] }, viewport: { width: 1440, height: 900 } })

const gaId = 'G-TEST123456'

test.beforeEach(async ({ page }) => {
  await page.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '' }),
  )
})

const banner = (page: Page) => page.getByRole('region', { name: 'Бисквитки' })

/** `dataLayer` as arrays (gtag pushes `arguments` objects). */
const layer = (page: Page) =>
  page.evaluate(() =>
    ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).map((entry) =>
      Array.from(entry),
    ),
  )

test('nothing goes to Google before consent, or with essential cookies only', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto(routes.home())
  await banner(page).getByRole('button', { name: 'Само задължителни' }).click()
  await page.goto(routes.search('английски'))

  expect(requests.filter((url) => url.includes('googletagmanager'))).toEqual([])
  expect((await layer(page)).filter(([command]) => command === 'event')).toEqual([])
})

test('with statistics consent GA4 loads, with 12-month cookies, and gets the events', async ({
  page,
}) => {
  await page.goto(routes.home())
  const script = page.waitForRequest(`https://www.googletagmanager.com/gtag/js?id=${gaId}`)
  await banner(page).getByRole('button', { name: 'Приеми всички' }).click()
  await script

  const entries = await layer(page)
  const config = entries.findIndex(([command]) => command === 'config')
  const choice = entries.findIndex(
    ([command, name]) => command === 'event' && name === 'cookie_consent',
  )
  expect(entries[config]).toEqual(['config', gaId, { cookie_expires: 31536000 }])
  expect(entries[choice]).toEqual([
    'event',
    'cookie_consent',
    { choice: 'all', functional: true, statistics: true, marketing: true },
  ])
  expect(config).toBeLessThan(choice)

  await page.goto(routes.search('английски'))
  await expect
    .poll(async () => (await layer(page)).find(([, name]) => name === 'search'))
    .toMatchObject(['event', 'search', { search_term: 'английски', tab: 'all' }])
})

test('withdrawing statistics stops GA', async ({ page }) => {
  await page.goto(routes.home())
  await banner(page).getByRole('button', { name: 'Приеми всички' }).click()

  await page.getByRole('button', { name: 'Настройки на бисквитките' }).click()
  const dialog = page.getByRole('dialog', { name: 'Настройки на бисквитките' })
  await dialog.getByRole('switch', { name: 'Статистика' }).focus()
  await page.keyboard.press('Space')
  await dialog.getByRole('button', { name: 'Запази избора' }).click()

  expect(
    await page.evaluate(
      (id) => (window as unknown as Record<string, unknown>)[`ga-disable-${id}`],
      gaId,
    ),
  ).toBe(true)
})
