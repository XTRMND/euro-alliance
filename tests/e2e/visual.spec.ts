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
  { name: 'professions', path: routes.professions() },
  { name: 'teachers', path: routes.teachers() },
  { name: 'farmers', path: routes.farmers() },
  { name: 'computer-courses', path: routes.computerCourses() },
  { name: 'translations', path: routes.translations() },
  { name: 'news', path: routes.news() },
  { name: 'about', path: routes.about() },
  { name: 'privacy', path: routes.privacy() },
  { name: 'cookies', path: routes.cookies() },
  { name: 'search', path: routes.search('английски') },
  { name: 'not-found', path: '/nyama-takava-stranitsa' },
  { name: 'tokens', path: devRoutes.tokens },
  { name: 'components', path: devRoutes.components },
  { name: 'patterns', path: devRoutes.patterns },
  { name: 'visuals', path: devRoutes.visuals },
  { name: 'cards', path: devRoutes.cards },
  { name: 'course', path: devRoutes.course },
  { name: 'news-article', path: devRoutes.news },
]

for (const { name, path } of snapshots) {
  for (const width of [1440, 390]) {
    test(`${name} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(path, { waitUntil: 'networkidle' })
      // The handwriting (Caveat) arrives after the page has loaded (src/styles/font-hand.ts).
      await page.waitForFunction(() => document.documentElement.hasAttribute('data-hand-font'))
      await page.evaluate(() => document.fonts.load('700 30px Caveat'))
      await page.evaluate(() => document.fonts.ready)
      // A full-page shot doesn't scroll, so lazy images far down a long page may not have loaded
      // yet: load and decode them all first.
      await page.evaluate(async () => {
        const images = [...document.images]
        for (const image of images) image.loading = 'eager'
        await Promise.all(images.map((image) => image.decode().catch(() => undefined)))
      })

      // Sections that fade up as they come into view (RevealOnScroll) are shown as they end up.
      await page.evaluate(() => {
        for (const section of document.querySelectorAll<HTMLElement>('[data-reveal]')) {
          section.dataset.reveal = 'shown'
        }
      })

      await expect(page).toHaveScreenshot(`${name}-${width}.png`, { fullPage: true })
    })
  }
}
