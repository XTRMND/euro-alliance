import { randomUUID } from 'node:crypto'
import AxeBuilder from '@axe-core/playwright'
import { expect as baseExpect, type Page, test } from '@playwright/test'
import { docxType, zip } from '../zip'

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
  await expect(tabs).toHaveText(['Програми', 'Курсове', 'Учебни системи', 'Изпити и сертификати'])
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

test('a programme’s sections are named rows, added from a grouped drawer', async ({ page }) => {
  await logIn(page)
  const programmes = (await (
    await page.request.get('/api/programs?where[type][equals]=language&limit=1&depth=0&draft=true')
  ).json()) as { docs: { id: number }[] }
  test.skip(programmes.docs.length === 0, 'No language programme in this database.')
  await page.goto(`/admin/collections/programs/${programmes.docs[0].id}`)
  const tabs = page.locator('.tabs-field__tabs').first().getByRole('button')
  await expect(tabs.filter({ visible: true })).toHaveText([
    'Начало на страницата',
    'Курсове',
    'Тетрадката',
    'Секции',
    'SEO и адрес',
  ])
  await tabs.filter({ hasText: 'Секции' }).click()
  await expect(page.getByText('Секциите се показват на страницата в този ред.')).toBeVisible()
  // A row says what it is and what it holds, never «Item 01» or the block's code name.
  const rows = page.locator('.blocks-field__row')
  await expect(rows.first()).toBeVisible()
  await expect(page.locator('.blocks-field')).not.toContainText(/Item \d|features|faqColumns/)

  await page.getByRole('button', { name: 'Добави секция' }).click()
  const drawer = page.locator('.drawer--is-open')
  await expect(drawer.getByRole('heading', { name: 'Добави секция' })).toBeVisible()
  // The search is ready to type in as the panel opens.
  await expect(drawer.getByPlaceholder('Търси секция…')).toBeFocused()
  await expect(drawer.locator('.blocks-drawer__block-group-label')).toHaveText([
    'Съдържание',
    'Курсове и програми',
    'Контакт и проекти',
  ])
  await expect(drawer.getByRole('button', { name: 'Въпроси в две колони' })).toBeVisible()
  await expect(drawer.getByRole('button', { name: 'От какво зависи цената' })).toBeVisible()
})

test('«За нас» is edited by section, and Навигация shows where its links go', async ({ page }) => {
  await logIn(page)
  await page.goto('/admin/globals/about')
  const rail = page.locator('.section-rail > .tabs-field__tabs-wrap').getByRole('button')
  await expect(rail).toHaveText([
    'Начало',
    'История',
    'В цифри',
    'Кого обучаваме',
    'Екип',
    'Стандарти',
    'Лицензи',
    'Документи',
    'Проекти',
    'Онлайн обучение',
    'SEO',
  ])
  // The rail stands beside the form, not above it.
  const [railBox, formBox] = await Promise.all([
    page.locator('.section-rail > .tabs-field__tabs-wrap').boundingBox(),
    page.locator('.section-rail > .tabs-field__content-wrap').boundingBox(),
  ])
  expect(railBox!.x + railBox!.width).toBeLessThanOrEqual(formBox!.x)
  await rail.filter({ hasText: 'История' }).click()
  await expect(page.getByText('Години', { exact: true }).first()).toBeVisible()

  await page.goto('/admin/globals/navigation')
  await expect(page.locator('.tabs-field__tabs').first().getByRole('button')).toHaveText([
    'Горна лента',
    'Мобилно меню',
    'Долна част',
  ])
  // The preview lays the header out from the form: a link's text shows in it.
  const preview = page.getByRole('img', { name: 'Преглед на горната лента на сайта' })
  await expect(preview).toBeVisible()
  const first = page.locator('.array-field__row').first()
  await expect(first).toContainText(/Страница · |Програма|Курс|Само подменю|Адрес/)
  await expect(page.locator('.global-edit--navigation')).not.toContainText(/Item \d/)
  await expect(page.getByRole('button', { name: 'Добави връзка' }).first()).toBeVisible()
})

test('lists are named in Bulgarian, and a wrong address gets the admin’s own 404', async ({
  page,
}) => {
  await logIn(page)
  // Every screen's card spans the width beside the menu, 32px around it (the user, 13.11.2026).
  for (const path of [
    '/admin/collections/courses',
    '/admin/collections/news',
    '/admin/collections/prices',
    '/admin/collections/inquiries',
  ]) {
    await page.goto(path)
    const card = await page.locator('[data-admin="card"]').first().boundingBox()
    expect(Math.round(card!.x)).toBe(280 + 32)
    expect(Math.round(card!.x + card!.width)).toBe(1440 - 32)
  }
  // No list says «Item 01» or «Добави Item», whatever the form.
  for (const path of ['/admin/globals/home', '/admin/globals/site', '/admin/globals/contact']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const form = page.locator('form.collection-edit__form')
    await expect(form).not.toContainText(/Item \d|Добави Item|Add /)
  }
  await page.goto('/admin/globals/home')
  await expect(page.getByRole('button', { name: 'Добави карта' })).toBeVisible()
  // The controls that carry a fixed English label in Payload's code are put into Bulgarian.
  await expect(page.locator('[aria-label="Известия"]')).toHaveCount(1)

  await page.goto('/admin/collections/no-such-list')
  await expect(page.getByRole('heading', { name: 'Страницата не е намерена' })).toBeVisible()
  await expect(page.getByText('Няма такава страница в админа.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Към таблото' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Път' })).toHaveText(
    /Съдържание\s*\/\s*Страницата не е намерена/,
  )
  // Nothing in the menu is marked as open.
  await expect(
    page.getByRole('navigation', { name: 'Съдържание' }).locator('[aria-current="page"]'),
  ).toHaveCount(0)
})

test('exams and certificates have a kind and a «Кога», and empty cells are dashes', async ({
  page,
}) => {
  await logIn(page)
  const content = page.getByRole('navigation', { name: 'Съдържание' })
  await content.getByRole('button', { name: 'Обучения' }).click()
  await content.getByRole('button', { name: 'Езикови курсове' }).click()
  await content.getByRole('link', { name: 'Изпити и сертификати' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Изпити и сертификати' })).toBeVisible()
  const table = page.locator('.collection-list table')
  await expect(table.locator('thead')).toContainText('Вид')
  await expect(table.locator('thead')).toContainText('Кога')
  // The two state exams say when they're taken, and have no issuer: a dash, not «<Няма …>».
  const matura = table.locator('tbody tr', { hasText: 'ДЗИ' })
  await expect(matura).toContainText('Държавен изпит')
  await expect(matura).toContainText('12. клас')
  await expect(matura.locator('.cell-issuer')).toHaveText('—')
  await expect(table.locator('tbody tr', { hasText: 'FCE' })).toContainText(
    'Международен сертификат',
  )
  await expect(table).not.toContainText('<Няма')

  // The ЦПО's exams are «Изпитни сесии».
  await page.goto('/admin/collections/exams')
  await expect(page.getByRole('heading', { level: 1, name: 'Изпитни сесии' })).toBeVisible()
  await expect(content.getByRole('link', { name: 'Изпитни сесии' })).toHaveAttribute(
    'aria-current',
    'page',
  )

  // On the site the card reads as before: «12. клас» on its first line.
  await page.goto('/ezitsi/balgarski/uchenitsi')
  const card = page.getByRole('article').filter({ hasText: 'Държавен зрелостен изпит по БЕЛ' })
  await expect(card.locator('p').first()).toHaveText('12. клас')
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

// A Word file Payload takes for one: its list of parts names the main document.
const docx = (extra: { name: string; data: string }[] = []) =>
  zip([
    {
      name: '[Content_Types].xml',
      data: `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="${docxType}.main+xml"/></Types>`,
    },
    { name: 'word/document.xml', data: '<w:document/>' },
    ...extra,
  ])

// The smallest PDF Payload accepts as one.
const minimalPdf = Buffer.from(
  [
    '%PDF-1.4',
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 10 10]>>endobj',
    'xref',
    '0 1',
    '0000000000 65535 f ',
    'trailer<</Root 1 0 R>>',
    'startxref',
    '0',
    '%%EOF',
  ].join('\n'),
)

// A visitor's upload from the wizard to the office (v0.24.1): stored under a random name, shown
// with the name it came with, and served to signed-in staff as a download only.
test('a visitor’s file reaches staff under a random name, as a download only', async ({ page }) => {
  test.skip(!ready, 'The database already has accounts.')
  await page.goto('/kontakti?tema=prevodi')
  // No stored consent in this file: the banner would cover the wizard's buttons.
  await page
    .getByRole('button', { name: 'Само задължителни' })
    .click({ timeout: 8000 })
    .catch(() => undefined)

  // Without translation languages in the CMS the pair is two text fields.
  await page.getByLabel('От', { exact: true }).fill('Английски')
  await page.getByLabel('На', { exact: true }).fill('Български')
  await page
    .getByRole('radiogroup', { name: 'Офис' })
    .or(page.getByRole('group', { name: 'Офис' }))
    .getByRole('radio')
    .first()
    .check({ force: true })
  await page.locator('input[type="file"]').first().setInputFiles({
    name: '../dogovor.html.pdf',
    mimeType: 'application/pdf',
    buffer: minimalPdf,
  })
  await page.getByRole('button', { name: 'Напред' }).click()
  await page.getByLabel('Име', { exact: true }).fill('Тестов посетител')
  await page.getByLabel('Имейл', { exact: true }).fill('test@example.com')
  await page.getByRole('checkbox', { name: /Съгласен съм/ }).check()
  // The server ignores anything sent within 3 s of opening the wizard.
  await page.waitForTimeout(3100)
  await page.getByRole('button', { name: 'Изпрати' }).click()
  await expect(page.getByRole('heading', { name: 'Благодарим!' })).toBeVisible()

  // Not signed in: no list, no file.
  expect((await page.request.get('/api/inquiry-files')).status()).toBe(403)

  await logIn(page)
  const list = await page.request.get('/api/inquiry-files?limit=1&sort=-createdAt')
  const [file] = ((await list.json()) as { docs: Record<string, string>[] }).docs
  expect(file!.filename).toMatch(/^[0-9a-f-]{36}\.pdf$/)
  expect(file!.originalName).toBe('dogovor.html.pdf')

  const download = await page.request.get(file!.url!)
  expect(download.status()).toBe(200)
  expect(download.headers()).toMatchObject({
    'content-type': 'application/pdf',
    'content-disposition': 'attachment',
    'content-security-policy': "default-src 'none'; sandbox",
    'x-content-type-options': 'nosniff',
    'cache-control': 'private, no-store',
  })
})

// «Файлове» (v0.29.0, hardened in v0.29.1): staff upload a document and get the address to link
// to from a text. The address works for a visitor; the list doesn't; what isn't a plain document
// is refused; and Payload's API doesn't read a large form from someone who isn't signed in.
test('a file uploaded in «Файлове» gets an address a visitor can open', async ({
  page,
  browser,
}) => {
  await logIn(page)
  await page.goto('/admin/collections/files/create')
  // No fetching a file from an address.
  await expect(page.getByRole('button', { name: /URL/ })).toHaveCount(0)
  // A name that isn't the type's, in Cyrillic.
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: 'Правилник.html', mimeType: 'application/pdf', buffer: minimalPdf })
  await page.getByLabel('Име', { exact: false }).first().fill('Тестов правилник')
  await page.getByRole('button', { name: 'Запази' }).click()

  const address = page.locator('code', { hasText: '/api/files/file/' })
  await expect(address).toBeVisible()
  const href = (await address.textContent())!.trim()
  expect(href).toMatch(/^\/api\/files\/file\/pravilnik-[0-9a-f]{8}\.pdf$/)
  await expect(page.getByRole('button', { name: 'Копирай адреса' })).toBeVisible()

  const upload = (name: string, mimeType: string, buffer: Buffer, request = page.request) =>
    request.post('/api/files', {
      multipart: { _payload: JSON.stringify({ title: name }), file: { name, mimeType, buffer } },
    })
  const pdf = 'application/pdf'

  // A visitor, not signed in: the file, but not the list, and no upload.
  const visitor = await browser.newContext()
  const file = await visitor.request.get(href)
  expect(file.status()).toBe(200)
  expect(file.headers()).toMatchObject({
    'content-type': pdf,
    'content-disposition': 'inline',
    'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
    'x-content-type-options': 'nosniff',
  })
  expect((await visitor.request.get('/api/files')).status()).toBe(403)
  expect((await upload('a.pdf', pdf, minimalPdf, visitor.request)).status()).toBe(403)
  // A large form without a session never reaches Payload; nor with a made-up one.
  const large = Buffer.concat([minimalPdf, Buffer.alloc(200 * 1024, 0x20)])
  expect((await upload('a.pdf', pdf, large, visitor.request)).status()).toBe(401)
  // Unsigned, built here so no token is written in the repository.
  const part = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const unsigned = `${part({ alg: 'none' })}.${part({ id: 1, exp: 9999999999 })}.`
  const forged = await visitor.request.post('/api/files', {
    headers: { cookie: `payload-token=${unsigned}` },
    multipart: { _payload: '{}', file: { name: 'a.pdf', mimeType: pdf, buffer: large } },
  })
  expect(forged.status()).toBe(401)
  await visitor.close()

  // Signed in. A web page named as a PDF; a PDF that runs a script; a picture; too large a file.
  expect((await upload('page.pdf', pdf, Buffer.from('<html></html>'))).status()).toBe(400)
  const script = Buffer.from(
    minimalPdf.toString().replace('/Type/Catalog', '/Type/Catalog/OpenAction<</S/JavaScript>>'),
  )
  expect((await upload('script.pdf', pdf, script)).status()).toBe(400)
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  expect((await upload('photo.pdf', pdf, png)).status()).toBe(400)
  expect((await upload('big.pdf', pdf, Buffer.alloc(22 * 1024 * 1024, 0x20))).status()).toBe(413)

  // A file larger than the proxy's default copy of a body (10 MB) arrives whole.
  const padded = Buffer.from(
    minimalPdf.toString().replace('%PDF-1.4\n', `%PDF-1.4\n%${'a'.repeat(12 * 1024 * 1024)}\n`),
  )
  const stored = await upload('golyam.pdf', pdf, padded)
  expect(stored.status()).toBe(201)
  const { doc } = (await stored.json()) as { doc: { filesize: number; uploadedBy: unknown } }
  expect(doc.filesize).toBe(padded.length)
  expect(doc.uploadedBy).toBeTruthy()

  // A Word file is only ever a download.
  const word = await upload('Договор.docx', docxType, docx())
  expect(word.status()).toBe(201)
  const { doc: wordDoc } = (await word.json()) as { doc: { url: string; filename: string } }
  expect(wordDoc.filename).toMatch(/^dogovor-[0-9a-f]{8}\.docx$/)
  expect((await page.request.get(wordDoc.url)).headers()).toMatchObject({
    'content-disposition': 'attachment',
    'content-security-policy': "default-src 'none'; sandbox",
  })
  // With macros: refused.
  const macros = docx([{ name: 'word/vbaProject.bin', data: 'x' }])
  expect((await upload('macro.docx', docxType, macros)).status()).toBe(400)
})
