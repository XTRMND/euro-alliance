import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { pages } from './pages'

// Definition of done, CLAUDE.md § 9.
const auditWidths = [1440, 1024, 768, 390, 360]
const designWidths = [1440, 390]

async function open(page: Page, path: string, width = 1440) {
  await page.setViewportSize({ width, height: 900 })
  return page.goto(path, { waitUntil: 'networkidle' })
}

for (const { name, path } of pages) {
  test.describe(`${name} (${path})`, () => {
    test('responds 200 without console errors', async ({ page }) => {
      const errors: string[] = []
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })
      page.on('pageerror', (error) => errors.push(error.message))

      const response = await open(page, path)

      expect(response?.status()).toBe(200)
      expect(errors).toEqual([])
    })

    test('has lang="bg" and exactly one h1', async ({ page }) => {
      await open(page, path)

      await expect(page.locator('html')).toHaveAttribute('lang', 'bg')
      await expect(page.locator('h1')).toHaveCount(1)
    })

    for (const width of auditWidths) {
      test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
        await open(page, path, width)

        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }))

        expect(scrollWidth).toBeLessThanOrEqual(innerWidth)
      })
    }

    test('gives every link and button a destination', async ({ page }) => {
      await open(page, path)

      const problems = await page.evaluate(() => {
        const found: string[] = []
        const describe = (element: Element) => element.outerHTML.slice(0, 120)

        for (const link of document.querySelectorAll('a')) {
          const href = link.getAttribute('href')
          if (!href || href === '#' || href.startsWith('javascript:')) {
            found.push(`link without destination: ${describe(link)}`)
          }
        }

        for (const button of document.querySelectorAll('button')) {
          // React keeps a button's props on the element; it's the only way to see an onClick
          // in a production build.
          const propsKey = Object.keys(button).find((key) => key.startsWith('__reactProps$'))
          const props = propsKey
            ? (button as unknown as Record<string, { onClick?: unknown }>)[propsKey]
            : undefined
          const submitsForm = button.type !== 'button' && button.form !== null
          const declarative =
            button.hasAttribute('popovertarget') || button.hasAttribute('commandfor')
          if (!props?.onClick && !submitsForm && !declarative) {
            found.push(`button without a handler: ${describe(button)}`)
          }
        }

        return found
      })

      expect(problems).toEqual([])
    })

    for (const width of designWidths) {
      test(`has no axe violations at ${width}px`, async ({ page }) => {
        await open(page, path, width)

        const { violations } = await new AxeBuilder({ page }).analyze()

        expect(violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`)).toEqual([])
      })
    }

    test('runs no animations with reduced motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await open(page, path)

      const running = await page.evaluate(
        () => document.getAnimations().filter((a) => a.playState === 'running').length,
      )

      expect(running).toBe(0)
    })
  })
}
