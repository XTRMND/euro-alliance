import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { staticRedirects } from '@/lib/redirects'
import { routes } from '@/lib/routes'

// The 404 page and the old site's addresses (PR 19, docs/content-import.md § 5).

// Reduced motion: axe checks the copy after its fade-in, not halfway through it.
test.use({ reducedMotion: 'reduce' })

test('an unknown address is a real 404, with search and places to start', async ({ page }) => {
  const response = await page.goto('/nyama-takava-stranitsa')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Тази страница я няма')
  await expect(page.getByRole('searchbox', { name: 'Търсене в сайта' })).toBeVisible()
  await expect(
    page
      .getByRole('navigation', { name: 'Основни раздели' })
      .getByRole('link', { name: 'Курсове' }),
  ).toHaveAttribute('href', routes.courses())

  await page.getByRole('searchbox', { name: 'Търсене в сайта' }).fill('бисквитки')
  await page.getByRole('button', { name: 'Търси' }).click()
  await expect(page).toHaveURL(/\/tarsene\?q=/)
})

for (const width of [1440, 390]) {
  test(`the 404 page has no axe violations at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/nyama-takava-stranitsa')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations.map((v) => v.id)).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    )
  })
}

test('every old address redirects once, with a 301, whatever its case', async ({ request }) => {
  for (const [from, to] of Object.entries(staticRedirects)) {
    // As the old site wrote it (capitalized) and with a trailing slash.
    const old = from.replace(/(^|[/-])([a-z])/g, (_, sep, c: string) => sep + c.toUpperCase())
    for (const path of [old, `${from}/`]) {
      const response = await request.get(path, { maxRedirects: 0 })
      expect(response.status(), path).toBe(301)
      const location = new URL(response.headers().location, 'http://localhost')
      expect(location.pathname + location.search + location.hash, path).toBe(to)
    }
    // One hop: the target isn't a redirect. Language pages other than English have no content
    // yet, so they're 404s until the client adds them (CLAUDE.md § 12).
    const target = await request.get(to.split('#')[0], { maxRedirects: 0 })
    const pending = to.startsWith('/ezitsi/') && !to.startsWith('/ezitsi/angliyski/')
    expect(pending ? [200, 404] : [200], to).toContain(target.status())
  }
})

test('an old address the map doesn’t know is a 404, not the homepage', async ({ request }) => {
  const response = await request.get('/About-us/Something-Else', { maxRedirects: 0 })
  expect(response.status()).toBe(404)
})

test('a new address with a trailing slash loses it', async ({ request }) => {
  const response = await request.get('/kursove/', { maxRedirects: 0 })
  expect(response.status()).toBe(308)
  expect(response.headers().location).toMatch(/\/kursove$/)
})
