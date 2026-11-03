import { expect, test, type Page } from '@playwright/test'
import { destinations } from '@/lib/destinations'
import { devRoutes, routes } from '@/lib/routes'
import { partners } from '@/seed/data'

// The homepage (PR 8) against the seeded database: Figma's copy, the classroom photo, the program
// cards, the About island and the partner logos. Courses and news are never seeded, so their sections are hidden
// here; their cards are checked on the dev gallery with test data.

/** Names of the CSS animations running on elements inside `selector`. */
const animationsIn = (page: Page, selector: string) =>
  page.evaluate(
    (selector) =>
      document
        .getAnimations()
        .filter((animation) => {
          const target = (animation.effect as KeyframeEffect | null)?.target
          return target instanceof Element && target.closest(selector)
        })
        .map((animation) => ({
          name: (animation as CSSAnimation).animationName,
          iterations: animation.effect?.getComputedTiming().iterations,
          fades: (animation.effect as KeyframeEffect)
            .getKeyframes()
            .some((frame) => frame.opacity !== undefined),
          target: ((animation.effect as KeyframeEffect).target as Element).tagName,
        })),
    selector,
  )

test.describe('hero', () => {
  test('shows the headline with «от 1999 г.» highlighted and both buttons', async ({ page }) => {
    await page.goto(routes.home())
    const heading = page.getByRole('heading', { level: 1 })

    await expect(heading).toHaveText('Езиково и професионално обучение от 1999 г.')
    await expect(heading.locator('span')).toHaveText('от 1999 г.')
    await expect(page.getByRole('link', { name: 'Виж предстоящите курсове' })).toHaveAttribute(
      'href',
      routes.courses(),
    )
    await expect(
      page.getByRole('link', { name: 'Изпрати документ за превод' }).first(),
    ).toHaveAttribute('href', routes.contact('prevodi'))
  })

  test('shows the classroom photo in its 88% tint and the «7 езика» bubble', async ({ page }) => {
    await page.goto(routes.home())
    const photo = page.getByRole('img', { name: /Деца в класна стая/ })

    await expect(photo).toHaveAttribute('src', /-hero\.jpg/)
    await expect(photo).toHaveAttribute('fetchpriority', 'high')
    await expect(page.getByText('7', { exact: true })).toBeVisible()
    await expect(page.getByText('езика', { exact: true })).toBeVisible()
  })

  test('lands once, never fading in the headline or the photo', async ({ page }) => {
    await page.goto(routes.home())
    const animations = await animationsIn(page, 'section[aria-labelledby="home-title"]')

    expect(animations.length).toBeGreaterThan(0)
    expect(animations.every((animation) => animation.iterations === 1)).toBe(true)
    const lcpCandidates = animations.filter(
      (animation) => animation.target === 'H1' || animation.name.includes('photo-in'),
    )
    expect(lcpCandidates.length).toBe(2)
    expect(lcpCandidates.some((animation) => animation.fades)).toBe(false)
  })

  test('stays still with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(routes.home())

    expect(await animationsIn(page, 'main')).toEqual([])
  })
})

test.describe('sections', () => {
  test('hide courses and news while there are none', async ({ page }) => {
    await page.goto(routes.home())

    await expect(page.getByRole('heading', { name: 'Предстоящи курсове' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Новини и проекти' })).toHaveCount(0)
  })

  test('link the eight program cards to their pages, in order', async ({ page }) => {
    await page.goto(routes.home())
    const cards = page.getByRole('region', { name: 'Какво предлагаме' }).getByRole('link')

    await expect(cards).toHaveText([
      'Езици за ученици',
      'Езици за възрастни',
      'Изпити и сертификати',
      'Професионално и фирмено обучение',
      'Обучение с ваучери',
      'Педагогически специалисти',
      'Обучение за земеделци',
      'Компютърни курсове',
    ])
    const hrefs = await cards.evaluateAll((links) => links.map((link) => link.getAttribute('href')))
    expect(hrefs[2]).toBe(destinations.certificates.href)
    expect(hrefs[7]).toBe(destinations.computerCourses.href)
  })

  test('show the partner logos with their names', async ({ page }) => {
    await page.goto(routes.home())
    const strip = page.getByRole('region', { name: 'Партньори и акредитации' })

    for (const { name } of partners) {
      await expect(strip.getByRole('img', { name, exact: true })).toHaveCount(1)
    }
  })

  test('show the About island: the team photo in its 30% tint, the sticker and the history link', async ({
    page,
  }) => {
    await page.goto(routes.home())
    const island = page.getByRole('region', { name: 'Вярваме в потенциала на всеки ученик' })

    await expect(island.getByRole('heading', { level: 2 }).locator('span')).toHaveText(
      'всеки ученик',
    )
    await expect(island.getByRole('img', { name: /Екипът на ЕВРО-АЛИАНС/ })).toHaveAttribute(
      'src',
      /-news\.jpg/,
    )
    await expect(island.getByText('Нашият екип, 2026')).toBeVisible()
    await expect(island.getByRole('link', { name: 'Повече за нашата история' })).toHaveAttribute(
      'href',
      destinations.aboutHistory.href,
    )
  })

  test("straighten the About island's polaroid on hover", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(routes.home())
    const polaroid = page.locator('section[aria-labelledby="about-island-title"] figure')

    await polaroid.scrollIntoViewIfNeeded()
    await expect(polaroid).not.toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    await polaroid.hover()
    await expect(polaroid).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  })

  test('fade the About island up once, the first time it comes into view', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(routes.home())
    const selector = 'section[aria-labelledby="about-island-title"]'
    const island = page.locator(selector)

    await expect(island).toHaveAttribute('data-reveal', 'waiting')
    await island.scrollIntoViewIfNeeded()
    await expect(island).toHaveAttribute('data-reveal', 'shown')
    const animations = await animationsIn(page, selector)
    expect(animations.map((animation) => animation.name).sort()).toEqual([
      expect.stringContaining('fade-up'),
      expect.stringContaining('fade-up'),
    ])
    expect(animations.every((animation) => animation.iterations === 1)).toBe(true)
  })

  test('keep the About island still and shown with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(routes.home())
    const selector = 'section[aria-labelledby="about-island-title"]'
    const island = page.locator(selector)

    await island.scrollIntoViewIfNeeded()
    await expect(island.getByRole('heading', { level: 2 })).toHaveCSS('opacity', '1')
    await expect(island).not.toHaveAttribute('data-reveal')
    expect(await animationsIn(page, selector)).toEqual([])
  })

  test('send a chosen file on to the contact wizard', async ({ page }) => {
    await page.goto(routes.home())
    const chooser = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Избери файл' }).click()

    await (
      await chooser
    ).setFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 test'),
    })

    await expect(page).toHaveURL(routes.contact('prevodi'))
  })
})

test.describe('cards (dev gallery)', () => {
  test('a course card is one link to the course, with its tags, start and price', async ({
    page,
  }) => {
    await page.goto(devRoutes.cards)
    const card = page.getByRole('article').filter({ hasText: 'Тестов курс 1' })

    await expect(card.getByRole('link')).toHaveCount(1)
    await expect(card.getByRole('link')).toHaveAttribute('href', routes.course('testov-kurs-1'))
    await expect(card).toContainText('Възрастни • Онлайн')
    await expect(card).toContainText('Старт: 15 януари 2099')
    await expect(card).toContainText('100 €')
    await expect(card).toContainText('B2')
  })

  test('a course without level, start or price shows none of them', async ({ page }) => {
    await page.goto(devRoutes.cards)
    const card = page.getByRole('article').filter({ hasText: 'Тестов курс 4' })

    await expect(card).toContainText('Тестов етикет')
    await expect(card).not.toContainText('Старт')
    await expect(card).not.toContainText('€')
    await expect(card).not.toContainText('Ниво')
  })

  test('a news photo clears to full colour on hover', async ({ page }) => {
    await page.goto(devRoutes.cards)
    const card = page.getByRole('article').filter({ hasText: 'Тестова новина 1' })
    const tint = card.locator('img[src*="fixture-home-news"]')

    await expect(tint).toHaveCSS('opacity', '1')
    await card.hover()
    await expect(tint).toHaveCSS('opacity', '0')
  })

  test('a news item without a photo shows no image', async ({ page }) => {
    await page.goto(devRoutes.cards)
    const card = page.getByRole('article').filter({ hasText: 'Тестова новина 3' })

    await expect(card.getByRole('img')).toHaveCount(0)
  })
})
