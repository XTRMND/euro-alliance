import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { parseConsent } from '@/lib/consent'
import { routes } from '@/lib/routes'

// Cookie consent (PR 17, docs/motion.md § 7): a first visit without a stored choice.

test.use({ storageState: { cookies: [], origins: [] }, viewport: { width: 1440, height: 900 } })

const stored = async (page: Page) =>
  parseConsent((await page.context().cookies()).find((c) => c.name === 'ea_consent')?.value)

const banner = (page: Page) => page.getByRole('region', { name: 'Бисквитки' })

// gtag.js loads once statistics is granted («Приеми всички»): stubbed, nothing leaves the machine.
test.beforeEach(async ({ page }) => {
  await page.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '' }),
  )
})

test('a first visit sets no cookie and asks nobody else', async ({ page, baseURL }) => {
  const hosts = new Set<string>()
  page.on('request', (request) => hosts.add(new URL(request.url()).host))
  await page.goto(routes.home())

  await expect(banner(page)).toBeVisible()
  expect(await page.context().cookies()).toEqual([])
  expect([...hosts]).toEqual([new URL(baseURL!).host])
})

test('«Само задължителни» is stored and remembered', async ({ page }) => {
  await page.goto(routes.home())
  await banner(page).getByRole('button', { name: 'Само задължителни' }).click()

  await expect(banner(page)).toBeHidden()
  expect(await stored(page)).toMatchObject({
    functional: false,
    statistics: false,
    marketing: false,
  })
  await page.reload()
  await expect(banner(page)).toBeHidden()
})

test('the settings save a choice, and the footer reopens them with it', async ({ page }) => {
  await page.goto(routes.home())
  await banner(page).getByRole('button', { name: 'Настройки' }).click()
  const dialog = page.getByRole('dialog', { name: 'Настройки на бисквитките' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('switch', { name: /Задължителни/ })).toBeDisabled()

  await dialog.getByRole('switch', { name: 'Статистика' }).focus()
  await page.keyboard.press('Space')
  await dialog.getByRole('button', { name: 'Запази избора' }).click()
  await expect(dialog).toBeHidden()
  expect(await stored(page)).toMatchObject({ statistics: true, marketing: false })

  await page.getByRole('button', { name: 'Настройки на бисквитките' }).click()
  await expect(dialog.getByRole('switch', { name: 'Статистика' })).toBeChecked()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('«Приеми всички» grants every category', async ({ page }) => {
  await page.goto(routes.home())
  await banner(page).getByRole('button', { name: 'Приеми всички' }).click()
  expect(await stored(page)).toMatchObject({ functional: true, statistics: true, marketing: true })
})

for (const width of [1440, 390]) {
  test(`the banner and the settings have no axe violations at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(routes.home())
    await expect(banner(page)).toBeVisible()
    // Not halfway through its fade-in, when its text is still faint.
    await banner(page).evaluate((element) =>
      Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished)),
    )
    let results = await new AxeBuilder({ page })
      .include('[aria-labelledby="consent-title"]')
      .analyze()
    expect(results.violations.map((v) => v.id)).toEqual([])

    await banner(page).getByRole('button', { name: 'Настройки' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    results = await new AxeBuilder({ page }).include('dialog').analyze()
    expect(results.violations.map((v) => v.id)).toEqual([])
  })
}
