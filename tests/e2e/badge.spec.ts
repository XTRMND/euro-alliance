import { expect, test } from '@playwright/test'
import { routes } from '@/lib/routes'

// The logo badge (src/components/visuals/LogoBadge) stays a circle wherever it's used, in WebKit
// as in Chromium (playwright.config runs this file in both): the About hero's bubble and the map
// pins on the contact page. WebKit stretched the old pin's SVG into an oval.

const usages = [
  { page: routes.about(), count: 1 },
  { page: routes.contact(), count: 2 },
]

for (const { page: path, count } of usages) {
  test(`the logo badges on ${path} are circles`, async ({ page }) => {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(path)
      const badges = page.locator('[data-badge]')
      await expect(badges).toHaveCount(count)
      for (const badge of await badges.all()) {
        await badge.scrollIntoViewIfNeeded()
        await expect(badge.locator('img')).toHaveJSProperty('complete', true)
        const size = await badge.evaluate((element) => {
          const mark = element.querySelector('img')!
          const rect = element.getBoundingClientRect()
          const markRect = mark.getBoundingClientRect()
          return {
            box: [(element as HTMLElement).offsetWidth, (element as HTMLElement).offsetHeight],
            rect: [rect.width, rect.height],
            mark: [markRect.width, markRect.height],
          }
        })
        const label = `${path} at ${width}px: ${JSON.stringify(size)}`
        expect(size.box[0], label).toBeGreaterThan(0)
        expect(size.box[0], label).toBe(size.box[1])
        // Rotated badges have a larger bounding box, still square.
        expect(Math.abs(size.rect[0] - size.rect[1]), label).toBeLessThan(0.5)
        expect(Math.abs(size.mark[0] - size.mark[1]), label).toBeLessThan(0.5)
      }
    }
  })
}

test('the logo files keep their aspect ratio', async ({ request }) => {
  const svg = await (await request.get('/icon.svg')).text()
  expect(svg).not.toContain('preserveAspectRatio="none"')
  expect(svg).toMatch(/viewBox="0 0 (\d+) \1"/)
})
