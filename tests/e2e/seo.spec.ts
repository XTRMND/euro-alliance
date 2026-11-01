import { expect, test } from '@playwright/test'
import { routes } from '@/lib/routes'
import { pages } from './pages'

// SEO (PR 22): every public page has one canonical address, its own title and description, a
// sharing image and valid structured data. The test server doesn't set ALLOW_INDEXING, so it
// also checks that nothing is indexable outside production.

const publicPages = pages.filter(
  (page) => !page.path.startsWith('/dev') && !page.path.startsWith(routes.search()),
)

test('every page has one canonical, its own title and description, and a sharing image', async ({
  page,
}) => {
  const titles = new Map<string, string>()
  const descriptions = new Map<string, string>()
  for (const { name, path } of publicPages) {
    await page.goto(path)
    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical, name).toHaveCount(1)
    expect(new URL((await canonical.getAttribute('href'))!).pathname, name).toBe(path.split('?')[0])
    await expect(page.locator('meta[property="og:image"]').first(), name).toHaveAttribute(
      'content',
      /^https?:\/\//,
    )

    const title = await page.title()
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description, name).toBeTruthy()
    expect(titles.get(title), `${name}: title «${title}»`).toBeUndefined()
    expect(descriptions.get(description!), `${name}: description`).toBeUndefined()
    titles.set(title, name)
    descriptions.set(description!, name)

    for (const json of await page.locator('script[type="application/ld+json"]').allTextContents()) {
      expect(() => JSON.parse(json), name).not.toThrow()
    }
  }
})

test('the homepage describes the school, a page with a breadcrumb its trail', async ({ page }) => {
  await page.goto(routes.home())
  const data = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
    (json) => JSON.parse(json),
  )
  expect(data).toContainEqual(
    expect.objectContaining({
      '@type': 'EducationalOrganization',
      identifier: { '@type': 'PropertyValue', propertyID: 'ЕИК', value: '115302753' },
    }),
  )

  await page.goto(routes.about())
  const trail = (await page.locator('script[type="application/ld+json"]').allTextContents())
    .map((json) => JSON.parse(json))
    .find((item) => item['@type'] === 'BreadcrumbList')
  expect(trail.itemListElement.map((item: { name: string }) => item.name)).toEqual([
    'Начало',
    'За нас',
  ])
})

test('outside production nothing is indexable', async ({ page, request }) => {
  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toMatch(/Disallow: \/\s*$/m)
  await page.goto(routes.home())
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})

test('the sitemap lists the published pages and not the search', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const path of [routes.courses(), routes.about(), routes.privacy(), routes.translations()]) {
    expect(sitemap).toContain(`${path}</loc>`)
  }
  expect(sitemap).not.toContain(routes.search())
})
