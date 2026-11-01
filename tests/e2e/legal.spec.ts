import { expect, test } from '@playwright/test'
import { routes } from '@/lib/routes'

// The legal pages (PR 17), from the seeded Legal pages documents.

// Reduced motion: anchors jump instead of scrolling smoothly, which under a busy CPU can outlast
// the assertion's timeout (the tests are about where the links lead, not the motion).
test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })

test('the privacy page lists its sections and links them', async ({ page }) => {
  await page.goto(routes.privacy())
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Защита на личните данни')
  await expect(page.getByRole('main').getByRole('heading', { level: 2 })).toHaveCount(8)

  const rail = page.getByRole('navigation', { name: 'Съдържание' }).first()
  await expect(rail.getByRole('link')).toHaveCount(8)
  await rail.getByRole('link', { name: 'Вашите права' }).click()
  await expect(page.getByRole('heading', { name: 'Вашите права' })).toBeInViewport()

  await expect(page.getByRole('link', { name: 'office@euro-alliance.net' })).toHaveAttribute(
    'href',
    'mailto:office@euro-alliance.net',
  )
  await expect(page.getByRole('link', { name: 'www.cpdp.bg' })).toHaveAttribute('target', '_blank')
  await page.getByRole('main').getByRole('link', { name: 'Политика за бисквитките' }).click()
  await expect(page).toHaveURL(routes.cookies())
})

test('the cookie page shows the categories as a table', async ({ page }) => {
  await page.goto(routes.cookies())
  const table = page.getByRole('table', { name: 'Какви бисквитки използваме' })
  await expect(table.getByRole('columnheader')).toHaveText(['Вид', 'За какво служат', 'Съгласие'])
  await expect(table.getByRole('row')).toHaveCount(5)

  await page.getByRole('main').getByRole('link', { name: 'Защита на личните данни' }).click()
  await expect(page).toHaveURL(routes.privacy())
})

test('on a phone the contents open in a box', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(routes.cookies())
  const toggle = page.getByRole('button', { name: 'Съдържание' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await page.getByRole('link', { name: 'Лични данни' }).first().click()
  await expect(page.getByRole('heading', { name: 'Лични данни' })).toBeInViewport()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
})
