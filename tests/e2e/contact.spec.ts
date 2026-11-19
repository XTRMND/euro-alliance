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

// «Обучение» stands for a course, a voucher and company training (Trello #9).
test('Step 1 has four topics, and «Обучение» asks about the course, the voucher and the company', async ({
  page,
}) => {
  await page.goto(routes.contact())
  const topics = wizard(page).getByRole('list').first().getByRole('button')
  await expect(topics).toHaveCount(4)
  await expect(topics.first()).toContainText('Обучение')

  await topics.first().click()
  await expect(page.getByRole('heading', { name: 'Детайли за обучението' })).toBeFocused()
  await expect(page.getByLabel('Курс', { exact: true })).toHaveValue('')
  await expect(
    page.getByRole('group', { name: 'Имате ли ваучер от Агенцията по заетостта?' }),
  ).toBeVisible()
  await expect(page.getByLabel('Фирма', { exact: true })).toBeHidden()
  await noViolations(page)

  // Nothing is required until the training is for a company.
  await page.getByRole('checkbox', { name: 'Обучението е за фирма' }).check()
  await page.getByRole('button', { name: 'Напред' }).click()
  await expect(page.getByText('Попълнете това поле.')).toBeVisible()
  await expect(page.getByLabel('Фирма', { exact: true })).toBeFocused()
  await noViolations(page)
  await page.getByRole('checkbox', { name: 'Обучението е за фирма' }).uncheck()
  await page.getByRole('button', { name: 'Напред' }).click()
  await expect(page.getByRole('heading', { name: 'Вашите данни' })).toBeFocused()
})

test('the old links to the three kinds of training open «Обучение»', async ({ page }) => {
  await page.goto(routes.contact('kursove'))
  await expect(page.getByRole('heading', { name: 'Детайли за обучението' })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Обучението е за фирма' })).not.toBeChecked()

  // Company training opens with the company's fields.
  await page.goto(routes.contact('firmeno-obuchenie'))
  await expect(page.getByRole('checkbox', { name: 'Обучението е за фирма' })).toBeChecked()
  await expect(page.getByLabel('Фирма', { exact: true })).toBeVisible()

  // From a voucher page the voucher question has to be answered.
  await page.goto(routes.contact('vaucheri'))
  await page.getByRole('button', { name: 'Напред' }).click()
  await expect(page.getByText('Изберете една от възможностите.')).toBeVisible()
  await page.getByRole('radio', { name: 'Още не, искам информация' }).check()
  await page.getByRole('button', { name: 'Напред' }).click()
  await expect(page.getByRole('heading', { name: 'Вашите данни' })).toBeFocused()
})

test('a link preselects the topic and starts at Step 2', async ({ page }) => {
  await page.goto(routes.contact('prevodi'))

  await expect(page.getByRole('heading', { name: 'Детайли за превода' })).toBeVisible()
  await expect(page.getByText('Стъпка 2 от 3')).toBeVisible()
  await expect(
    page.getByRole('radiogroup', { name: 'Офис' }).or(page.getByRole('group', { name: 'Офис' })),
  ).toBeVisible()
  // Written and spoken translation are one option, chosen by default (Trello #8).
  const kinds = page.getByRole('group', { name: 'Вид превод' })
  await expect(kinds.getByRole('radio')).toHaveCount(2)
  await expect(kinds.getByRole('radio', { name: 'Писмен или устен превод' })).toBeChecked()
  await expect(kinds.getByRole('radio', { name: 'Легализация' })).not.toBeChecked()
  // The day it's needed by is optional (Trello #7): a past day is refused, an empty one isn't.
  const neededBy = page.getByLabel('До кога ви трябва? (по избор)')
  await expect(neededBy).toHaveAttribute('type', 'date')
  await expect(neededBy).toHaveAccessibleDescription('Оставете празно, ако няма срок.')
  await noViolations(page)

  await neededBy.fill('2020-01-01')
  await page.getByRole('button', { name: 'Напред' }).click()
  await expect(page.getByText('Изберете днешна или по-късна дата.')).toBeVisible()
  await neededBy.fill('')
  await page.getByRole('button', { name: 'Напред' }).click()
  await expect(page.getByText('Изберете днешна или по-късна дата.')).toBeHidden()
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

  // Working hours (Trello #10): the Office card has the week and the season's week, a Location
  // card the week that applies today.
  const central = page.getByRole('article').filter({ hasText: 'office@euro-alliance.net' })
  await expect(central.getByText('Работно време', { exact: true })).toBeVisible()
  await expect(central.getByText('Работно време от 15 юни до 1 септември')).toBeVisible()
  await expect(central.getByText('пон–чет')).toBeVisible()
  await expect(central.getByText('8:30–18:00')).toBeVisible()
  await expect(central.getByText('почивен ден')).toBeVisible()
  await expect(sofia.getByText('пон–пет')).toBeVisible()
  await expect(sofia.getByText('почивни дни')).toBeVisible()
  await expect(wizard(page)).toBeVisible()
})
