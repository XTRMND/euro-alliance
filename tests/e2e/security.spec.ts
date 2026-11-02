import { expect, type Page, test } from '@playwright/test'
import { routes } from '@/lib/routes'

// Security headers (PR 24, src/lib/security-headers.ts): the shared headers, a Content-Security-
// Policy whose nonce is fresh per response and on every script, and nothing the policy refuses on
// the pages with something special: the 404 page (built in the browser), the admin, and GA4 after
// consent (gtag.js stubbed). pages.spec.ts fails every other page on a console error, which is how
// Chrome reports a refused resource.

/** Records every CSP violation on the page from its first script on. */
async function watchPolicy(page: Page) {
  await page.addInitScript(() => {
    const page = window as unknown as { violations: string[] }
    page.violations = []
    document.addEventListener('securitypolicyviolation', (event) =>
      page.violations.push(`${event.violatedDirective}: ${event.blockedURI || 'inline'}`),
    )
  })
  return () => page.evaluate(() => (window as unknown as { violations: string[] }).violations)
}

const nonceOf = (policy: string | undefined) => policy?.match(/'nonce-([^']+)'/)?.[1]

test('pages carry the security headers and a fresh nonce on every script', async ({
  page,
  request,
}) => {
  const response = await page.goto(routes.home())
  const headers = response!.headers()
  expect(headers['strict-transport-security']).toBe('max-age=300')
  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(headers['x-frame-options']).toBe('DENY')
  expect(headers['permissions-policy']).toContain('camera=()')

  const policy = headers['content-security-policy']
  const scriptSrc = policy.split('; ').find((directive) => directive.startsWith('script-src '))
  expect(scriptSrc).toContain("'strict-dynamic'")
  expect(scriptSrc).not.toContain("'unsafe-inline'")
  expect(scriptSrc).not.toContain("'unsafe-eval'")
  expect(policy).toContain("frame-ancestors 'none'")
  expect(policy).toContain("object-src 'none'")

  const nonce = nonceOf(policy)
  expect(nonce).toBeTruthy()
  // Every script in the HTML carries it (JSON-LD is data, not run); chunks the runtime adds later
  // are trusted through 'strict-dynamic'.
  const scripts = (await response!.text())
    .match(/<script\b[^>]*>/g)!
    .filter((tag) => !tag.includes('application/ld+json'))
  expect(scripts.length).toBeGreaterThan(0)
  expect(scripts.filter((tag) => !tag.includes(`nonce="${nonce}"`))).toEqual([])

  const again = await request.get(routes.home())
  expect(nonceOf(again.headers()['content-security-policy'])).not.toBe(nonce)
})

test('the 404 page runs under the policy', async ({ page }) => {
  const violations = await watchPolicy(page)
  const response = await page.goto('/nyama-takava-stranitsa')

  expect(response?.status()).toBe(404)
  expect(response?.headers()['content-security-policy']).toContain("'strict-dynamic'")
  await expect(page.locator('h1')).toHaveCount(1)
  expect(await violations()).toEqual([])
})

test('the admin runs under the policy', async ({ page }) => {
  const violations = await watchPolicy(page)
  const response = await page.goto('/admin')

  expect(response?.headers()['content-security-policy']).toContain("'strict-dynamic'")
  await expect(page.locator('form')).toBeVisible()
  expect(await violations()).toEqual([])
})

test.describe('with statistics consent', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('gtag.js loads under the policy', async ({ page }) => {
    await page.route('https://www.googletagmanager.com/**', (route) =>
      route.fulfill({ contentType: 'text/javascript', body: '' }),
    )
    const violations = await watchPolicy(page)
    await page.goto(routes.home())
    const script = page.waitForRequest((request) => request.url().includes('/gtag/js?id='))
    await page
      .getByRole('region', { name: 'Бисквитки' })
      .getByRole('button', { name: 'Приеми всички' })
      .click()
    await script

    expect(await violations()).toEqual([])
  })
})
