import { expect, test } from '@playwright/test'
import { devRoutes, routes } from '@/lib/routes'

// Visual regression against the last approved build (docs/git-workflow.md § 5). The snapshots
// are CI's Linux renders, so this runs on Linux only. CI writes missing snapshots and uploads
// them as an artifact; commit them to make them the baseline.

test.skip(process.platform !== 'linux', 'Snapshots are Linux renders')

const snapshots = [
  { name: 'home', path: routes.home() },
  { name: 'courses', path: routes.courses() },
  { name: 'contact', path: routes.contact() },
  { name: 'english-adults', path: routes.languageProgram('english', 'adults') },
  { name: 'english-students', path: routes.languageProgram('english', 'students') },
  { name: 'vouchers', path: routes.vouchers() },
  { name: 'tokens', path: devRoutes.tokens },
  { name: 'components', path: devRoutes.components },
  { name: 'patterns', path: devRoutes.patterns },
  { name: 'visuals', path: devRoutes.visuals },
  { name: 'cards', path: devRoutes.cards },
  { name: 'course', path: devRoutes.course },
]

for (const { name, path } of snapshots) {
  for (const width of [1440, 390]) {
    test(`${name} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(path, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      // A full-page shot doesn't scroll, so lazy images far down a long page may not have loaded
      // yet: load and decode them all first.
      await page.evaluate(async () => {
        const images = [...document.images]
        for (const image of images) image.loading = 'eager'
        await Promise.all(images.map((image) => image.decode().catch(() => undefined)))
      })

      await expect(page).toHaveScreenshot(`${name}-${width}.png`, { fullPage: true })
    })
  }
}
