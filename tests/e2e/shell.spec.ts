import { expect, test } from '@playwright/test'

// Header, mobile menu and footer (PR 5): landmarks, the skip link, the menu dialog and the logo.

test.describe('desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('has the page landmarks, with labelled navigation', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('banner')).toHaveCount(1)
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('contentinfo')).toHaveCount(1)
    await expect(page.getByRole('navigation', { name: 'Основна навигация' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Връзки в долния колонтитул' })).toBeVisible()
  })

  test('starts with a skip link to the content', async ({ page }) => {
    await page.goto('/')

    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Към съдържанието' })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()

    await page.keyboard.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
  })

  test('the logo on the homepage goes back to the top and focuses the content', async ({
    page,
  }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    await page.getByRole('banner').getByRole('link', { name: 'Евро Алианс, начало' }).click()

    await expect(page.getByRole('main')).toBeFocused()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    expect(new URL(page.url()).pathname).toBe('/')
  })

  test('«Професионално обучение» is a disclosure with its three programmes', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Основна навигация' })
    const button = nav.getByRole('button', { name: 'Професионално обучение' })
    await expect(button).toHaveAttribute('aria-expanded', 'false')

    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    for (const name of ['ЦПО професии', 'Педагогически специалисти', 'Земеделски производители']) {
      await expect(nav.getByRole('link', { name })).toBeVisible()
    }

    await page.keyboard.press('Escape')
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(button).toBeFocused()
    await expect(nav.getByRole('link', { name: 'ЦПО професии' })).toBeHidden()
  })

  test('the cookie settings button asks the consent dialog to open', async ({ page }) => {
    await page.goto('/')
    const opened = page.evaluate(
      () =>
        new Promise<boolean>((resolve) =>
          window.addEventListener('ea:open-cookie-settings', () => resolve(true), { once: true }),
        ),
    )

    await page.getByRole('button', { name: 'Настройки на бисквитките' }).click()

    expect(await opened).toBe(true)
  })
})

// The header's controls never run into each other or the logo, on either side of the switch to
// the desktop header (1200px).
for (const width of [1440, 1200, 1199, 1024, 768, 390, 360]) {
  test(`header controls don't overlap at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')

    const overlaps = await page.getByRole('banner').evaluate((header) => {
      const boxes = [...header.querySelectorAll('a, button')]
        .map((element) => ({ element, box: element.getBoundingClientRect() }))
        .filter(({ box }) => box.width > 0 && box.height > 0)
      const found: string[] = []
      for (const [i, a] of boxes.entries()) {
        for (const b of boxes.slice(i + 1)) {
          if (a.element.contains(b.element) || b.element.contains(a.element)) continue
          const x = Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left)
          const y = Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top)
          if (x > 0 && y > 0) found.push(`${a.element.textContent} × ${b.element.textContent}`)
        }
      }
      return found
    })

    expect(overlaps).toEqual([])
  })
}

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('opens as a dialog, keeps focus inside and closes with Esc', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('button', { name: 'Меню', exact: true })
    await expect(button).toHaveAttribute('aria-expanded', 'false')

    await button.focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog', { name: 'Меню' })
    await expect(dialog).toBeVisible()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(dialog.getByRole('link', { name: 'Курсове' })).toBeVisible()

    // The page behind is inert: Tab never reaches it. Past the last item, focus goes to the
    // browser's own controls (body here) and then back into the menu, as with any modal <dialog>.
    let leftToBrowser = false
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab')
      const where = await dialog.evaluate((el) =>
        el.contains(document.activeElement) ? 'dialog' : document.activeElement?.tagName,
      )
      expect(['dialog', 'BODY']).toContain(where)
      if (where === 'BODY') leftToBrowser = true
      else if (leftToBrowser) break
    }
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(button).toBeFocused()
    await expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  test('opens «Професионално обучение» as a group; Esc closes only the group', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Меню', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Меню' })
    const group = dialog.getByRole('button', { name: 'Професионално обучение' })

    await group.click()
    await expect(group).toHaveAttribute('aria-expanded', 'true')
    await expect(dialog.getByRole('link', { name: 'Земеделски производители' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(group).toHaveAttribute('aria-expanded', 'false')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'Езици' })).toHaveAttribute(
      'href',
      '/kursove?kategoria=ezitsi',
    )
  })

  test('closes with its close button', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Меню', exact: true }).click()

    await page.getByRole('button', { name: 'Затвори менюто' }).click()

    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('shows the central office phone and email', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Меню', exact: true }).click()

    const dialog = page.getByRole('dialog', { name: 'Меню' })
    await expect(dialog.getByRole('link', { name: '+359 886 601 108' })).toHaveAttribute(
      'href',
      'tel:+359886601108',
    )
    await expect(dialog.getByRole('link', { name: 'office@euro-alliance.net' })).toHaveAttribute(
      'href',
      'mailto:office@euro-alliance.net',
    )
  })
})
