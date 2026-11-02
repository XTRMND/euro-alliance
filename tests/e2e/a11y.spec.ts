import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { topicSegments } from '@/lib/inquiries'
import { devRoutes, routes } from '@/lib/routes'
import { pages } from './pages'

// The accessibility pass (PR 25, docs/pr-plan.md § 25), beyond pages.spec.ts (axe at 1440 and 390,
// overflow, reduced motion) and the component tests:
// - axe on the open states not covered elsewhere (menu, dropdown, dialogs, the wizard's Step 2);
// - reflow at 320 CSS px (WCAG 1.4.10, the width of 1280 px at 400% zoom);
// - text spacing (WCAG 1.4.12): with the spacing a reader may set, no sideways scroll and no
//   text cut off. Excluded: visually hidden labels (1 × 1 px by design) and line-clamped card
//   titles, cut at two lines by design with the full title on the course page;
// - keyboard: the skip link comes first, and every Tab stop is on screen with a visible focus
//   state (a screenshot of the stop, or of its card, changes when it's focused).

const textSpacing = `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important } p { margin-bottom: 2em !important }`

async function noViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze()
  expect(violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`)).toEqual([])
}

test.describe('open states', () => {
  // Checked at rest: axe would measure contrast halfway through an opening transition.
  test.use({ reducedMotion: 'reduce' })

  test('the header dropdown', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(routes.home())
    await page
      .getByRole('navigation', { name: 'Основна навигация' })
      .getByRole('button', { name: 'Професионално обучение' })
      .click()
    await noViolations(page)
  })

  test('the mobile menu, with its group open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(routes.home())
    await page.getByRole('button', { name: 'Меню', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Меню' })
    await dialog.getByRole('button', { name: 'Професионално обучение' }).click()
    await noViolations(page)
  })

  test('a licence in full size', async ({ page }) => {
    await page.goto(routes.about())
    await page.getByRole('button', { name: 'Виж в цял размер: Лиценз за ЦПО от НАПОО' }).click()
    await expect(page.getByRole('dialog', { name: 'Лиценз за ЦПО от НАПОО' })).toBeVisible()
    await noViolations(page)
  })

  test('the article’s contents box on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(devRoutes.news)
    await page.getByRole('button', { name: /Съдържание · 1 мин. четене/ }).click()
    await noViolations(page)
  })

  for (const [topic, segment] of Object.entries(topicSegments)) {
    test(`the wizard’s Step 2 for ${topic}`, async ({ page }) => {
      await page.goto(routes.contact(segment))
      await expect(page.getByText('Стъпка 2 от 3')).toBeVisible()
      await noViolations(page)
    })
  }
})

for (const { name, path } of pages) {
  test.describe(`${name} (${path})`, () => {
    test.use({ reducedMotion: 'reduce' })

    test('reflows at 320px', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 })
      await page.goto(path, { waitUntil: 'networkidle' })
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })

    // Not the dev reference pages: they clip their samples' landing poses to the page.
    for (const width of path.startsWith('/dev/') ? [] : [390, 1440]) {
      test(`keeps all text with wider text spacing at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(path, { waitUntil: 'networkidle' })
        await page.addStyleTag({ content: textSpacing })

        const { overflow, clipped } = await page.evaluate(() => {
          const found: string[] = []
          for (const element of document.querySelectorAll<HTMLElement>('body *')) {
            if (element.closest('[aria-hidden="true"], dialog:not([open]), [hidden]')) continue
            const style = getComputedStyle(element)
            if (style.display === 'none' || style.visibility === 'hidden') continue
            if (element.clientWidth <= 1 || element.clientHeight <= 1) continue
            if (style.webkitLineClamp !== 'none') continue
            if (!element.textContent?.trim()) continue
            const clips = (value: string) => value === 'hidden' || value === 'clip'
            const cut =
              (clips(style.overflowX) && element.scrollWidth > element.clientWidth + 1) ||
              (clips(style.overflowY) && element.scrollHeight > element.clientHeight + 1)
            if (cut)
              found.push(`${element.tagName}.${element.className} «${element.textContent.trim()}»`)
          }
          return {
            overflow: document.documentElement.scrollWidth - window.innerWidth,
            clipped: found.map((text) => text.slice(0, 120)),
          }
        })

        expect(overflow).toBeLessThanOrEqual(0)
        expect(clipped).toEqual([])
      })
    }

    test('shows where keyboard focus is, from the skip link on', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(path, { waitUntil: 'networkidle' })

      const problems: string[] = []
      const seen = new Set<string>()
      for (let stop = 0; stop < 80; stop++) {
        await page.keyboard.press('Tab')
        const focused = await page.evaluate((stop) => {
          const element = document.activeElement as HTMLElement | null
          if (!element || element === document.body) return null
          element.dataset.tabStop ??= String(stop)
          element.scrollIntoView({ block: 'center', inline: 'nearest' })
          // A card shows focus around the whole card.
          const box = (element.closest('article') ?? element).getBoundingClientRect()
          const onScreen =
            box.width > 0 &&
            box.height > 0 &&
            box.bottom > 0 &&
            box.right > 0 &&
            box.left < window.innerWidth &&
            box.top < window.innerHeight
          return {
            id: element.dataset.tabStop,
            label: `${element.tagName} «${(element.innerText || element.getAttribute('aria-label') || '').trim().slice(0, 40)}»`,
            box: { x: box.x, y: box.y, width: box.width, height: box.height },
            onScreen,
          }
        }, stop)
        if (!focused || seen.has(focused.id)) break
        seen.add(focused.id)
        if (stop === 0) expect(focused.label).toContain('Към съдържанието')
        if (!focused.onScreen) {
          problems.push(`off screen: ${focused.label}`)
          continue
        }

        const x = Math.max(0, focused.box.x - 8)
        const y = Math.max(0, focused.box.y - 8)
        const clip = {
          x,
          y,
          width: Math.min(focused.box.width + 16, 1440 - x),
          height: Math.min(focused.box.height + 16, 900 - y),
        }
        const withFocus = await page.screenshot({ clip, animations: 'disabled' })
        await page.evaluate(() => (document.activeElement as HTMLElement).blur())
        const without = await page.screenshot({ clip, animations: 'disabled' })
        await page.evaluate(
          (id) => document.querySelector<HTMLElement>(`[data-tab-stop="${id}"]`)?.focus(),
          focused.id,
        )
        if (withFocus.equals(without)) problems.push(`no visible focus: ${focused.label}`)
      }

      expect(seen.size).toBeGreaterThan(0)
      expect(problems).toEqual([])
    })
  })
}
