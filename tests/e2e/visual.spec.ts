import { expect, test } from '@playwright/test'
import { devRoutes } from '@/lib/routes'

// Visual regression against the last approved build (docs/git-workflow.md § 5). The snapshots
// are CI's Linux renders, so this runs on Linux only. CI writes missing snapshots and uploads
// them as an artifact; commit them to make them the baseline.

test.skip(process.platform !== 'linux', 'Snapshots are Linux renders')

const snapshots = [
  { name: 'tokens', path: devRoutes.tokens },
  { name: 'components', path: devRoutes.components },
  { name: 'patterns', path: devRoutes.patterns },
  { name: 'visuals', path: devRoutes.visuals },
]

for (const { name, path } of snapshots) {
  for (const width of [1440, 390]) {
    test(`${name} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(path, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)

      await expect(page).toHaveScreenshot(`${name}-${width}.png`, { fullPage: true })
    })
  }
}
