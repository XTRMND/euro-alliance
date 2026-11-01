import { expect, type Page, test } from '@playwright/test'
import { routes } from '@/lib/routes'
import { docx, pdf } from '../documents'

// The Translations page (PR 14) and its Page counter (173:378): 1800 characters with spaces make
// a standard page, counted in the browser from pasted text or a file.

test.use({ viewport: { width: 1440, height: 900 } })

const counter = (page: Page) => page.getByRole('group', { name: 'Брояч на страници' })

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

test('the counter counts pasted text in standard pages', async ({ page }) => {
  await page.goto(routes.translations())
  const box = counter(page)

  await box.getByLabel('Текст за преброяване').fill('а'.repeat(2700))
  await expect(box.getByText('1,5', { exact: true })).toBeVisible()
  await box.getByLabel('Текст за преброяване').fill('')
  await expect(box.getByText('0', { exact: true })).toBeVisible()
})

test('the counter counts a Word file and a PDF, and removes them', async ({ page }) => {
  await page.goto(routes.translations())
  const box = counter(page)
  const input = box.locator('input[type="file"]')

  await input.setInputFiles({
    name: 'dogovor.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: docx(['а'.repeat(1800), 'б'.repeat(1800)]),
  })
  await expect(box.getByText('3600 знака с интервалите')).toBeVisible()
  await expect(box.getByText('2', { exact: true })).toBeVisible()

  await box.getByRole('button', { name: /Премахни/ }).click()
  await input.setInputFiles({
    name: 'test.pdf',
    mimeType: 'application/pdf',
    buffer: pdf(Array.from({ length: 10 }, () => 'x'.repeat(90))),
  })
  await expect(box.getByText('900 знака с интервалите')).toBeVisible({ timeout: 15_000 })
  await expect(box.getByText('0,5', { exact: true })).toBeVisible()
})

test('a photo can’t be counted here, and the quote opens the wizard', async ({ page }) => {
  await page.goto(routes.translations())
  const box = counter(page)

  await box.locator('input[type="file"]').setInputFiles({
    name: 'snimka.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
  })
  await expect(box.getByText(/не можем да го преброим тук/)).toBeVisible()
  await box.getByRole('button', { name: 'Поискай оферта' }).click()
  await expect(page).toHaveURL(routes.contact('prevodi'))
})
