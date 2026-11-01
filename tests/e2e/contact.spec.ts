import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { routes } from '@/lib/routes'

// The contact page and wizard (PR 11; docs/motion.md § 9). Submissions here are obviously fake.

const wizard = (page: Page) => page.locator('form').filter({ hasText: 'Стъпка' }).first()

async function noViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze()
  expect(violations).toEqual([])
}

test('a visitor picks a topic, answers, and sends an inquiry', async ({ page }) => {
  await page.goto(routes.contact())
  await expect(
    page.getByRole('heading', { level: 2, name: 'С какво можем да помогнем?' }),
  ).toBeVisible()
  await expect(page.getByText('Стъпка 1 от 3')).toBeVisible()
  await noViolations(page)

  await page.getByRole('button', { name: /^Друго/ }).click()
  const step2 = page.getByRole('heading', { name: 'За какво става дума?' })
  await expect(step2).toBeFocused()

  await page.getByRole('button', { name: 'Напред' }).click()
  await expect(page.getByText('Попълнете това поле.')).toBeVisible()
  await expect(page.getByLabel('Тема', { exact: true })).toBeFocused()
  await page.getByLabel('Тема', { exact: true }).fill('Тестов въпрос')
  await page.getByRole('button', { name: 'Напред' }).click()

  await expect(page.getByRole('heading', { name: 'Вашите данни' })).toBeFocused()
  await page.getByRole('button', { name: 'Изпрати' }).click()
  await expect(page.getByText('Нужно е съгласието ви, за да изпратим запитването.')).toBeVisible()
  await expect(page.getByLabel('Имейл', { exact: true })).toHaveAttribute('aria-invalid', 'true')
  await noViolations(page)

  // Back keeps what was entered.
  await page.getByRole('button', { name: 'Назад' }).click()
  await expect(page.getByLabel('Тема', { exact: true })).toHaveValue('Тестов въпрос')
  await page.getByRole('button', { name: 'Напред' }).click()

  await page.getByLabel('Име', { exact: true }).fill('Тестов посетител')
  await page.getByLabel('Имейл', { exact: true }).fill('test@example.com')
  await page.getByRole('checkbox', { name: /Съгласен съм/ }).check()
  // The server ignores anything sent within 3 s of opening the wizard.
  await page.waitForTimeout(3100)
  await page.getByRole('button', { name: 'Изпрати' }).click()

  await expect(page.getByRole('heading', { name: 'Благодарим!' })).toBeFocused()
  await expect(page.getByRole('link', { name: 'Към началната страница' })).toBeVisible()
  await noViolations(page)
})

test('a link preselects the topic and starts at Step 2', async ({ page }) => {
  await page.goto(routes.contact('prevodi'))

  await expect(page.getByRole('heading', { name: 'Детайли за превода' })).toBeVisible()
  await expect(page.getByText('Стъпка 2 от 3')).toBeVisible()
  await expect(
    page.getByRole('radiogroup', { name: 'Офис' }).or(page.getByRole('group', { name: 'Офис' })),
  ).toBeVisible()
  await noViolations(page)

  await page.getByRole('button', { name: 'Напред' }).click()
  await expect(page.getByText('Изберете една от възможностите.')).toBeVisible()
})

test('files dropped on the homepage reach the wizard', async ({ page }) => {
  await page.goto(routes.home())
  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Избери файл' }).click()
  await (
    await chooser
  ).setFiles({
    name: 'diploma.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test'),
  })

  await expect(page).toHaveURL(routes.contact('prevodi'))
  await expect(page.getByText('diploma.pdf')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Премахни diploma.pdf' })).toBeVisible()
})

test('the offices and locations', async ({ page }) => {
  await page.goto(routes.contact())

  await expect(page.getByRole('link', { name: '+359 886 601 108' })).toHaveAttribute(
    'href',
    'tel:+359886601108',
  )
  await expect(page.getByRole('link', { name: 'trans@euro-alliance.net' })).toHaveAttribute(
    'href',
    'mailto:trans@euro-alliance.net',
  )
  const sofia = page.locator('#sofia')
  await expect(sofia.getByRole('heading', { name: 'ул. Георги С. Раковски 125' })).toBeVisible()
  await expect(sofia.getByRole('link', { name: 'Маршрут' })).toHaveAttribute(
    'href',
    /google\.com\/maps\/dir/,
  )
  await expect(sofia.getByRole('button', { name: 'Копирай адреса' })).toBeVisible()
  await expect(wizard(page)).toBeVisible()
})
