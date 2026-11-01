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
