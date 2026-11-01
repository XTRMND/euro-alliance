import { expect, test, type Locator, type Page } from '@playwright/test'
import { devRoutes } from '@/lib/routes'

// The visuals (PR 7) on the dev gallery: the strips' speed and pause control, the globe drawing
// only while the page scrolls, and stillness with reduced motion (docs/motion.md §§ 2–4).

const strip = (page: Page) => page.getByRole('region', { name: 'Language strip' })

/** The moving element: the parent of the item sets. */
const track = (region: Locator) => region.locator('ul').first().locator('..')

/** Opens the gallery with the strip on screen: it only moves while visible. */
async function openStrip(page: Page) {
  await page.goto(devRoutes.visuals)
  const region = strip(page)
  await region.scrollIntoViewIfNeeded()
  return region
}

test.describe('language strip', () => {
  test('moves at 18 px/s and exposes one set of names', async ({ page }) => {
    const region = await openStrip(page)
    const moving = track(region)
    await expect(moving).toHaveCSS('animation-play-state', 'running')

    const { duration, half } = await moving.evaluate((element) => {
      const sets = [...element.children] as HTMLElement[]
      const setWidth = sets[0].getBoundingClientRect().width
      return {
        duration: parseFloat(getComputedStyle(element).animationDuration),
        half: (setWidth * sets.length) / 2,
      }
    })
    expect(half / duration).toBeCloseTo(18, 1)

    await expect(region.getByRole('listitem')).toHaveCount(7)
    await expect(region.getByRole('listitem').filter({ hasText: 'Deutsch' })).toHaveAttribute(
      'lang',
      'de',
    )
    const copies = region.locator('ul[aria-hidden="true"]')
    expect(await copies.count()).toBeGreaterThan(0)
    for (const copy of await copies.all()) await expect(copy).toHaveAttribute('inert', '')
  })

  test('pauses and plays with its button', async ({ page }) => {
    const region = await openStrip(page)
    const moving = track(region)
    await expect(moving).toHaveCSS('animation-play-state', 'running')

    await region.getByRole('button', { name: 'Спри движението' }).click()
    await expect(moving).toHaveCSS('animation-play-state', 'paused')

    await region.getByRole('button', { name: 'Пусни движението' }).click()
    await page.mouse.move(0, 0)
    await expect(moving).toHaveCSS('animation-play-state', 'running')
  })

  test('pauses on hover', async ({ page }) => {
    const region = await openStrip(page)
    const moving = track(region)
    await expect(moving).toHaveCSS('animation-play-state', 'running')

    // Not locator.hover(): it waits for the target to stop moving.
    const box = await region.boundingBox()
    if (!box) throw new Error('The strip has no box')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)

    await expect(moving).toHaveCSS('animation-play-state', 'paused')
  })

  test('pauses while it is off screen', async ({ page }) => {
    const region = await openStrip(page)
    const moving = track(region)
    await expect(moving).toHaveCSS('animation-play-state', 'running')

    await page.getByRole('region', { name: 'Flags' }).scrollIntoViewIfNeeded()

    await expect(moving).toHaveCSS('animation-play-state', 'paused')
  })

  test('stands still as one set with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(devRoutes.visuals, { waitUntil: 'networkidle' })
    const region = strip(page)

    await expect(track(region)).toHaveCSS('animation-name', 'none')
    await expect(region.locator('ul[aria-hidden="true"]').first()).toBeHidden()
    await expect(region.getByRole('button')).toBeHidden()
  })
})

test('the partner logos are named by their alt text', async ({ page }) => {
  await page.goto(devRoutes.visuals)
  const region = page.getByRole('region', { name: 'Partner logos' })

  await expect(region.getByRole('img')).toHaveCount(8)
  await expect(region.getByRole('img', { name: 'Oxford University Press' })).toBeVisible()
})

// Every draw clears the canvas once, so counting clearRect calls counts draws.
async function countDraws(page: Page) {
  await page.addInitScript(() => {
    const clear = CanvasRenderingContext2D.prototype.clearRect
    ;(window as unknown as { draws: number }).draws = 0
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      ;(window as unknown as { draws: number }).draws++
      return clear.apply(this, args)
    }
  })
}

const draws = (page: Page) => page.evaluate(() => (window as unknown as { draws: number }).draws)

async function settled(page: Page) {
  let last = -1
  await expect
    .poll(
      async () => {
        const now = await draws(page)
        const same = now === last
        last = now
        return same
      },
      { intervals: [300] },
    )
    .toBe(true)
  return last
}

test.describe('globe', () => {
  test('draws only while the page scrolls', async ({ page }) => {
    await countDraws(page)
    await page.goto(devRoutes.visuals, { waitUntil: 'networkidle' })
    await expect.poll(() => draws(page)).toBeGreaterThan(0)

    const still = await settled(page)
    await page.waitForTimeout(1000)
    expect(await draws(page)).toBe(still)

    await page.mouse.wheel(0, 300)
    await expect.poll(() => draws(page)).toBeGreaterThan(still)

    const stopped = await settled(page)
    await page.waitForTimeout(1000)
    expect(await draws(page)).toBe(stopped)
  })

  test('is drawn once and stays still with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await countDraws(page)
    await page.goto(devRoutes.visuals, { waitUntil: 'networkidle' })
    await expect.poll(() => draws(page)).toBeGreaterThan(0)
    const drawn = await settled(page)

    await page.mouse.wheel(0, 300)
    await page.waitForTimeout(1000)

    expect(await draws(page)).toBe(drawn)
  })

  test('is hidden from assistive technology', async ({ page }) => {
    await page.goto(devRoutes.visuals)

    await expect(page.locator('canvas')).toHaveAttribute('aria-hidden', 'true')
  })
})

test.describe('landing motion', () => {
  test('the Course visual settles from Pose=Intro once', async ({ page }) => {
    await page.goto(devRoutes.visuals)
    const animations = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => (animation as CSSAnimation).animationName?.includes('sticker-drop'))
        .map((animation) => animation.effect?.getComputedTiming().iterations),
    )

    expect(animations).toEqual([1])
  })

  test('does not run with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(devRoutes.visuals)

    const names = await page.evaluate(() =>
      document.getAnimations().map((animation) => (animation as CSSAnimation).animationName),
    )
    expect(names).toEqual([])
  })
})
