import { randomUUID } from 'node:crypto'
import AxeBuilder from '@axe-core/playwright'
import { expect as baseExpect, type Page, test } from '@playwright/test'

// The admin's shell (docs/admin-redesign.md, PR 6; Figma «07 CMS admin»): the login, the sidebar
// that mirrors the site, the top bar and the hairline sub-nav. The first account of an empty
// database is made here (CI's database has none); against a database that already has accounts,
// give one in E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.

// The admin's screens render on the server with their data: on a busy runner a navigation can
// take longer than the default 5 seconds.
const expect = baseExpect.configure({ timeout: 15_000 })

test.describe.configure({ mode: 'serial' })
// No stored consent: the admin sets no cookie banner. A dark system must not darken the admin.
test.use({
  viewport: { width: 1440, height: 960 },
  storageState: { cookies: [], origins: [] },
  colorScheme: 'dark',
})

const account = {
  email: process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@example.test',
  password: process.env.E2E_ADMIN_PASSWORD ?? randomUUID(),
}
let ready = false

test.beforeAll(async ({ request }) => {
  if (process.env.E2E_ADMIN_EMAIL) {
    ready = true
    return
  }
  const response = await request.post('/api/users/first-register', {
    data: { ...account, name: 'Тест Админ' },
  })
  ready = response.ok()
})

async function logIn(page: Page) {
  test.skip(
    !ready,
    'The database already has accounts: set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.',
  )
  await page.goto('/admin/login')
  await page.getByLabel('Имейл').fill(account.email)
  await page.getByLabel('Парола').fill(account.password)
  await page.getByRole('button', { name: 'Вход' }).click()
  await expect(page.getByRole('complementary', { name: 'Меню' })).toBeVisible()
}

const axe = async (page: Page, include?: string[], withoutRules: string[] = []) => {
  let builder = new AxeBuilder({ page }).disableRules(withoutRules)
  for (const selector of include ?? []) builder = builder.include(selector)
  const { violations } = await builder.analyze()
  return violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`)
}

test('the login has the brand panel and the card, light whatever the system says', async ({
  page,
}) => {
  await page.goto('/admin/login')
  await expect(page.getByRole('heading', { level: 1, name: 'Вход' })).toBeVisible()
  await expect(page.getByText('Управление на съдържанието')).toBeVisible()
  await expect(page.getByText('ЕВРО-АЛИАНС ООД · от 1999 г.')).toBeVisible()
  await expect(page.getByText('Забравена парола?')).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  // The card sits on paper, to the right of the navy panel.
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(background).toBe('rgb(247, 243, 236)')
  // Payload's small-screen template has no <main>: its two landmark rules aside, nothing.
  expect(await axe(page, undefined, ['landmark-one-main', 'region'])).toEqual([])
})

test('the sidebar mirrors the site and marks the open screen', async ({ page }) => {
  await logIn(page)
  const menu = page.getByRole('complementary', { name: 'Меню' })
  const content = menu.getByRole('navigation', { name: 'Съдържание' })
  await expect(content.locator('> ul > li')).toHaveText([
    /^Табло$/,
    /^Запитвания/,
    /^Начална страница$/,
    /^Обучения$/,
    /^Цени$/,
    /^Преводи$/,
    /^Новини$/,
    /^За нас$/,
    /^Контакти$/,
    /^Сайт$/,
  ])
  await expect(menu).not.toContainText('Глобални')
  await expect(menu).not.toContainText('Медия')
  await expect(menu.getByRole('navigation', { name: 'Профил' }).getByRole('link')).toHaveText([
    'Потребители',
    'Изход',
  ])
  await expect(content.getByRole('link', { name: 'Табло' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('navigation', { name: 'Път' })).toHaveText(/Съдържание\s*\/\s*Табло/)
  // Payload's own header and nav toggle are gone.
  await expect(page.locator('.app-header')).toBeHidden()
})

test('the dashboard is one card: the overview, the two lists and the shortcuts', async ({
  page,
}) => {
  await logIn(page)
  await expect(page.getByRole('heading', { level: 1, name: 'Табло' })).toBeVisible()
  for (const label of ['Нови запитвания', 'Започват до 30 дни', 'Новини'])
    await expect(page.getByRole('term').filter({ hasText: label })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'Последни запитвания',
    'Започват скоро',
    'Често редактирани',
  ])
  // No list of collections, and nothing called «Глобални».
  await expect(page.locator('.template-default__wrap')).not.toContainText('Глобални')
  await expect(page.getByRole('link', { name: '+ Нов курс' })).toHaveAttribute(
    'href',
    '/admin/collections/courses/create',
  )
  await expect(page.getByRole('link', { name: /Правни страници/ }).last()).toHaveAttribute(
    'href',
    '/admin/collections/legal-pages',
  )
  // The card fills the height under the top bar and the width beside the menu, 32px around it
  // (the user, 12.11.2026: the dashboard's card isn't held to 1096px).
  const card = await page.locator('[data-admin="card"]').boundingBox()
  expect(Math.round(card!.x)).toBe(280 + 32)
  expect(Math.round(card!.x + card!.width)).toBe(1440 - 32)
  expect(Math.round(card!.y + card!.height)).toBe(960 - 32)
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(960)
  expect(await axe(page, ['[data-admin="dashboard"]'])).toEqual([])
})

test('a branch opens to a filtered list, with the sub-nav of its siblings', async ({ page }) => {
  await logIn(page)
  const content = page.getByRole('navigation', { name: 'Съдържание' })
  const branch = content.getByRole('button', { name: 'Обучения' })
  await expect(branch).toHaveAttribute('aria-expanded', 'false')
  await branch.click()
  await expect(branch).toHaveAttribute('aria-expanded', 'true')
  await content.getByRole('button', { name: 'Езикови курсове' }).click()
  await content.getByRole('link', { name: 'Курсове', exact: true }).first().click()

  await expect(page).toHaveURL(/\/admin\/collections\/courses\?where/)
  expect(new URL(page.url()).searchParams.get('where[category][equals]')).toBe('languages')
  await expect(content.getByRole('link', { name: 'Курсове', exact: true }).first()).toHaveAttribute(
    'aria-current',
    'page',
  )
  const tabs = page.getByRole('navigation', { name: 'Раздел' }).getByRole('link')
  await expect(tabs).toHaveText(['Програми', 'Курсове', 'Учебни системи', 'Сертификати'])
  await expect(tabs.nth(1)).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('navigation', { name: 'Път' })).toHaveText(
    /Обучения\s*\/\s*Езикови курсове\s*\/\s*Курсове/,
  )

  // A sibling in the sub-nav opens its own list and takes the mark.
  await tabs.nth(3).click()
  await expect(page).toHaveURL(/\/admin\/collections\/certificates/)
  await expect(tabs.nth(3)).toHaveAttribute('aria-current', 'page')
})

test('the course list is one card, grouped by language, under its branch', async ({ page }) => {
  await logIn(page)
  await page.goto('/admin/collections/courses?where[category][equals]=languages')
  await expect(page.getByRole('heading', { level: 1, name: 'Курсове' })).toBeVisible()
  await expect(page.getByText('Езикови курсове · групирани по език')).toBeVisible()
  await expect(page.getByRole('columnheader')).toHaveText([
    'Заглавие',
    'Аудитория и формат',
    'Ниво',
    'Начало',
    'Места',
    'Цена',
  ])
  // Every language has its group, in the list's order; the seeded database has no courses.
  const groups = page.locator('[data-admin="card"] tbody button')
  await expect(groups).toHaveText([
    /^Английски/,
    /^Немски/,
    /^Френски/,
    /^Български/,
    /^Испански/,
    /^Италиански/,
    /^Руски/,
  ])
  await expect(groups.first()).toContainText('няма курсове')
  await expect(page.getByRole('link', { name: '+ Нов курс' })).toHaveAttribute(
    'href',
    '/admin/collections/courses/create',
  )
  // «Групирай по» keeps the branch's filter in the address.
  await page.getByLabel('Групирай по').selectOption('audience')
  await expect(page).toHaveURL(/group=audience/)
  expect(new URL(page.url()).searchParams.get('where[category][equals]')).toBe('languages')
  await expect(page.getByText('Езикови курсове · групирани по аудитория')).toBeVisible()
  // The layout rule: one card to the bottom margin, no page scroll.
  const card = await page.locator('[data-admin="card"]').boundingBox()
  expect(Math.round(card!.y + card!.height)).toBe(960 - 32)
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(960)
  expect(await axe(page, ['[data-admin="list"]'])).toEqual([])
})

test('the news list and the inquiries follow the same pattern', async ({ page }) => {
  await logIn(page)
  await page.goto('/admin/collections/news')
  await expect(page.getByRole('heading', { level: 1, name: 'Новини' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Чернови' })).toBeVisible()
  await expect(page.getByText('Тук още няма новини.')).toBeVisible()
  expect(await axe(page, ['[data-admin="list"]'])).toEqual([])

  await page.goto('/admin/collections/inquiries')
  await expect(page.getByRole('heading', { level: 1, name: 'Запитвания' })).toBeVisible()
  await expect(
    page.getByText('Пазят се 1 година, освен ако не са довели до договор.'),
  ).toBeVisible()
  // The three statuses of the brief, and «Всички». (Other specs send inquiries through the
  // wizard, so how many are new isn't fixed here.)
  const chips = page.locator('[data-admin="list"] > header').getByRole('link')
  await expect(chips).toHaveText([/^Нови \(\d+\)$/, 'В работа', 'Приключени', 'Всички'])
  await chips.nth(2).click()
  await expect(page).toHaveURL(/status=closed/)
  await expect(chips.nth(2)).toHaveAttribute('aria-current', 'true')
  await expect(page.getByText('Няма запитвания с този филтър.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Маршрутизиране на запитвания' })).toHaveAttribute(
    'href',
    '/admin/globals/inquiry-routing',
  )
  expect(await axe(page, ['[data-admin="list"]'])).toEqual([])
})

test('a course is edited in tabs, and its groups are rows with real names', async ({ page }) => {
  await logIn(page)
  // An obviously fake course (the year 2099), removed again at the end.
  const created = await page.request.post('/api/courses?locale=bg', {
    data: { title: 'Тестов курс E2E', category: 'languages', topic: 'english', _status: 'draft' },
  })
  expect(created.ok()).toBe(true)
  const { doc } = (await created.json()) as { doc: { id: number } }
  try {
    await page.goto(`/admin/collections/courses/${doc.id}`)
    await expect(page.getByRole('heading', { level: 1, name: 'Тестов курс E2E' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Път' })).toHaveText(
      /Обучения\s*\/\s*Езикови курсове\s*\/\s*Курсове\s*\/\s*Тестов курс E2E/,
    )
    const tabs = page.locator('.tabs-field__tabs').getByRole('button')
    await expect(tabs).toHaveText(['Съдържание', 'Групи', 'Цени', 'SEO и адрес'])
    // No «API» tab; «Версии» sits beside the title.
    await expect(page.locator('.doc-tabs')).not.toContainText('API')
    // A localized field carries the content language's badge instead of «— Български».
    const badge = page.locator('.field-label .localized').first()
    expect(await badge.evaluate((el) => getComputedStyle(el, '::after').content)).toBe('"БГ"')

    await tabs.nth(1).click()
    await expect(page.getByText('Курсът няма групи')).toBeVisible()
    await page.getByRole('button', { name: 'Добави група' }).click()
    await page.getByLabel('Начало').fill('2099-11-03')
    await page.getByLabel(/^Учебни дни/).fill('тестови дни')
    await page.getByLabel('Свободни места').fill('5')
    await page.getByRole('button', { name: 'Запази групата' }).click()
    // The row is named by its start date and days, never «Item 01».
    const row = page.getByRole('button', { name: /3 ноември 2099 · тестови дни/ })
    await expect(row).toBeVisible()
    await expect(row).toContainText('5 свободни места')
    await expect(row).not.toContainText('Незаписано')
    await expect(page.locator('body')).not.toContainText('Item 01')

    await tabs.nth(2).click()
    await expect(page.getByText('Курсът няма цена: на сайта е «Попитайте».')).toBeVisible()
    await expect(page.getByRole('link', { name: /Промени в «Цени»/ })).toBeVisible()
  } finally {
    await page.request.delete(`/api/courses/${doc.id}`)
  }
})

test('prices are typed in place and stored only on «Запази промените»', async ({ page }) => {
  await logIn(page)
  // An obviously fake course with a group in 2099, removed again at the end.
  const created = await page.request.post('/api/courses?locale=bg', {
    data: { title: 'Тестов курс Цени', category: 'languages', topic: 'english', _status: 'draft' },
  })
  expect(created.ok()).toBe(true)
  const { doc } = (await created.json()) as { doc: { id: number } }
  try {
    const group = await page.request.post('/api/groups?locale=bg', {
      data: { course: doc.id, start: '2099-11-03T00:00:00.000Z' },
    })
    expect(group.ok()).toBe(true)

    await page
      .getByRole('navigation', { name: 'Съдържание' })
      .getByRole('link', { name: 'Цени' })
      .click()
    await expect(page.getByRole('heading', { level: 1, name: 'Цени' })).toBeVisible()
    // One card at the full height: the page itself doesn't scroll.
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight),
    ).toBe(true)
    const save = page.getByRole('button', { name: 'Запази промените' })
    await expect(save).toBeDisabled()

    // The course has a row for the whole course and one for its group.
    const base = page.getByLabel('Цена: Тестов курс Цени, Целия курс', { exact: true })
    const ofGroup = page.getByLabel('Цена: Тестов курс Цени, Група · 03.11.2099', { exact: true })
    await expect(base).toHaveValue('')
    await base.fill('abc')
    await expect(page.locator('[data-admin="list"]').getByRole('status')).toHaveText(
      '1 незаписана промяна',
    )
    await save.click()
    await expect(page.getByText('Цената е число, например 495 или 460,16.')).toBeVisible()
    await page.getByRole('button', { name: 'Отмени' }).click()
    await expect(base).toHaveValue('')
    await expect(page.locator('[data-admin="list"]').getByRole('status')).toHaveText('')

    await base.fill('1234,5')
    await ofGroup.fill('999')
    await page.getByLabel('Редовна цена: Тестов курс Цени, Група · 03.11.2099').fill('1234,5')
    await page.getByLabel('Етикет: Тестов курс Цени, Група · 03.11.2099').fill('тестов етикет')
    await expect(page.locator('[data-admin="list"]').getByRole('status')).toHaveText(
      '2 незаписани промени',
    )
    await expect(page.getByText('Незаписано')).toHaveCount(2)
    // Nothing is stored before the save.
    const stored = async () =>
      (
        (await (
          await page.request.get(`/api/prices?where[course][equals]=${doc.id}&depth=0&locale=bg`)
        ).json()) as { docs: { price: number; group?: number; label?: string }[] }
      ).docs
    expect(await stored()).toHaveLength(0)
    await save.click()
    await expect(page.locator('[data-admin="list"]').getByRole('status')).toHaveText('')
    await expect(save).toBeDisabled()
    await expect.poll(async () => (await stored()).length).toBe(2)
    const prices = await stored()
    expect(prices.map((price) => price.price).sort((a, b) => a - b)).toEqual([999, 1234.5])
    expect(prices.find((price) => price.group)?.label).toBe('тестов етикет')

    // «Промоции» keeps the group's row (it has a regular price), not the base price.
    await page.getByRole('button', { name: 'Промоции' }).click()
    await expect(ofGroup).toHaveValue('999')
    await expect(base).toHaveCount(0)
    await page.getByRole('button', { name: 'Всички', exact: true }).click()

    // An emptied row deletes its price.
    await ofGroup.fill('')
    await page.getByLabel('Редовна цена: Тестов курс Цени, Група · 03.11.2099').fill('')
    await page.getByLabel('Етикет: Тестов курс Цени, Група · 03.11.2099').fill('')
    await save.click()
    await expect(save).toBeDisabled()
    await expect.poll(async () => (await stored()).length).toBe(1)

    expect(await axe(page, ['[data-admin="list"]'])).toEqual([])
  } finally {
    await page.request.delete(`/api/courses/${doc.id}`)
  }
})

test('the live preview shows the page from what is typed, before it is saved', async ({
  page,
  browser,
}) => {
  await logIn(page)
  // An obviously fake draft course, removed again at the end.
  const created = await page.request.post('/api/courses?locale=bg', {
    data: {
      title: 'Тестов курс Преглед',
      category: 'languages',
      topic: 'english',
      _status: 'draft',
    },
  })
  expect(created.ok()).toBe(true)
  const { doc } = (await created.json()) as { doc: { id: number } }
  try {
    // The preview is the course's own address with a marker. It's for editors: a visitor gets
    // the 404 page of an unpublished course. Only a preview may be framed, and only by the site.
    const address = `/kursove/preview?preview=courses.${doc.id}&locale=bg`
    const visitor = await browser.newContext()
    expect((await visitor.request.get(address)).status()).toBe(404)
    await visitor.close()
    const framed = await page.request.get(address)
    expect(framed.status()).toBe(200)
    expect(framed.headers()['content-security-policy']).toContain("frame-ancestors 'self'")
    expect(framed.headers()['x-frame-options']).toBe('SAMEORIGIN')
    const home = await page.request.get('/')
    expect(home.headers()['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(home.headers()['x-frame-options']).toBe('DENY')

    await page.goto(`/admin/collections/courses/${doc.id}`)
    await page.locator('.live-preview-toggler').click()
    const preview = page.frameLocator('.live-preview-window iframe')
    // The draft's own page, in the site's template.
    await expect(preview.getByRole('heading', { level: 1 })).toHaveText('Тестов курс Преглед')
    await expect(preview.getByRole('contentinfo')).toBeVisible()
    await expect(preview.locator('section[aria-labelledby="consent-title"]')).toBeHidden()

    await page.locator('#field-title').fill('Тестов курс, още незаписан')
    await expect(preview.getByRole('heading', { level: 1 })).toHaveText(
      'Тестов курс, още незаписан',
    )
    // Nothing was saved by previewing.
    const stored = (await (
      await page.request.get(`/api/courses/${doc.id}?draft=true&locale=bg`)
    ).json()) as { title: string }
    expect(stored.title).toBe('Тестов курс Преглед')
  } finally {
    await page.request.delete(`/api/courses/${doc.id}`)
  }
})

test('a global sits where its page is on the site', async ({ page }) => {
  await logIn(page)
  const content = page.getByRole('navigation', { name: 'Съдържание' })
  await content.getByRole('button', { name: 'Сайт' }).click()
  await content.getByRole('link', { name: 'Навигация' }).click()
  await expect(page).toHaveURL(/\/admin\/globals\/navigation/)
  await expect(page.getByRole('heading', { level: 1, name: 'Навигация' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Път' })).toHaveText(/Сайт\s*\/\s*Навигация/)
  await expect(content.getByRole('link', { name: 'Навигация' })).toHaveAttribute(
    'aria-current',
    'page',
  )
})

test('the top bar links to the site and opens the account menu, without a language switch', async ({
  page,
}) => {
  await logIn(page)
  await page.goto('/admin/globals/home')
  // No БГ / EN switch: the content is edited in Bulgarian until the English site exists.
  await expect(page.getByRole('group', { name: 'Език на съдържанието' })).toHaveCount(0)

  await expect(page.getByRole('link', { name: /Виж сайта/ })).toHaveAttribute('target', '_blank')
  const avatar = page.getByRole('button', { name: /^Профил:/ })
  await avatar.click()
  await expect(avatar).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('link', { name: 'Профил', exact: true })).toHaveAttribute(
    'href',
    '/admin/account',
  )
  await page.keyboard.press('Escape')
  await expect(avatar).toHaveAttribute('aria-expanded', 'false')
})

test('the shell has no axe violations, with a branch open', async ({ page }) => {
  await logIn(page)
  await page.goto('/admin/collections/courses?where[category][equals]=languages')
  await expect(page.getByRole('navigation', { name: 'Раздел' })).toBeVisible()
  expect(await axe(page, ['aside[aria-label="Меню"]', '[data-admin="top"]'])).toEqual([])
})
