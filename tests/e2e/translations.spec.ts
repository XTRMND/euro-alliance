import { expect, test } from '@playwright/test'
import { routes } from '@/lib/routes'

// The Translations page (PR 14). Its Page counter (173:378) is gone since v0.24.0: the price
// section lists what the price depends on and sends the visitor to the wizard for a quote.

test.use({ viewport: { width: 1440, height: 900 } })

test('the hero links its sections and the footer links the two lists', async ({ page }) => {
  await page.goto(routes.translations())

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Преводи и легализация')
  await page.getByRole('link', { name: 'Как се формира цената' }).click()
  await expect(page.locator('#tsena')).toBeInViewport()

  const footer = page.getByRole('contentinfo')
  await expect(footer.getByRole('link', { name: 'Писмени преводи' })).toHaveAttribute(
    'href',
    `${routes.translations()}#pismeni-prevodi`,
  )
  await expect(page.locator('#pismeni-prevodi').getByRole('heading', { level: 2 })).toHaveText(
    'Какво включва всяка тематика',
  )
  await expect(page.locator('#ustni-prevodi').getByRole('heading', { level: 3 })).toHaveCount(4)
})

test('the price section has its factors and no page counter, and the quote opens the wizard', async ({
  page,
}) => {
  await page.goto(routes.translations())
  const price = page.locator('#tsena')

  await expect(price.getByRole('listitem')).toHaveCount(4)
  await expect(page.getByRole('group', { name: 'Брояч на страници' })).toHaveCount(0)
  await expect(price.locator('textarea, input[type="file"]')).toHaveCount(0)
  await expect(price.getByRole('link', { name: 'Рамков договор?' })).toHaveAttribute(
    'href',
    routes.contact('prevodi'),
  )
  await price.getByRole('link', { name: 'Поискай оферта' }).click()
  await expect(page).toHaveURL(routes.contact('prevodi'))
})
