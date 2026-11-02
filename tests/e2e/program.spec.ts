import { expect, test } from '@playwright/test'
import { anchors, routes } from '@/lib/routes'

// The language program template (PR 12) with the seeded English pages. The seeded database has
// no courses, so «Предстоящи курсове» is hidden and the hero's first button goes to the listing.

const adults = routes.languageProgram('english', 'adults')
const students = routes.languageProgram('english', 'students')

test.describe('English for adults', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('the breadcrumb and the audience tabs link to their pages', async ({ page }) => {
    await page.goto(adults)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Английски език')
    const crumbs = page.getByRole('navigation', { name: 'Навигационен път' })
    await expect(crumbs.getByRole('link', { name: 'Езици' })).toHaveAttribute(
      'href',
      routes.courses('languages'),
    )

    const tabs = page.getByRole('navigation', { name: 'Аудитория' })
    await expect(tabs.getByRole('link', { name: 'За възрастни' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await tabs.getByRole('link', { name: 'За ученици' }).click()
    await expect(page).toHaveURL(students)
    await expect(tabs.getByRole('link', { name: 'За ученици' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('the hero buttons go to the courses and the level test', async ({ page }) => {
    await page.goto(adults)

    await expect(page.locator('#predstoyashti-kursove')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Виж предстоящите курсове' })).toHaveAttribute(
      'href',
      /^\/kursove\?.*ezik=angliyski/,
    )
    await expect(page.getByRole('link', { name: 'Направи входния тест' })).toHaveAttribute(
      'href',
      routes.contact('test-za-nivo'),
    )
  })

  test('shows the textbook systems and the certificates under their anchor', async ({ page }) => {
    await page.goto(`${adults}#${anchors.certificates}`)

    for (const name of ['New Total English', 'SpeakOut']) {
      await expect(page.getByRole('heading', { name, level: 3 })).toBeVisible()
    }
    const certificates = page.locator(`#${anchors.certificates}`)
    await expect(certificates).toBeInViewport()
    await expect(certificates.getByText('IELTS', { exact: true })).toBeVisible()
  })

  test('the FAQ starts with the first answer open and toggles each one', async ({ page }) => {
    await page.goto(adults)
    const first = page.getByRole('button', { name: 'Как да разбера нивото си?' })
    const second = page.getByRole('button', {
      name: 'Мога ли да платя с ваучер от Агенцията по заетостта?',
    })
    const answer = async (button: typeof first) =>
      page.locator(`[id="${await button.getAttribute('aria-controls')}"]`)

    await expect(first).toHaveAttribute('aria-expanded', 'true')
    await expect(await answer(first)).toBeVisible()
    await expect(second).toHaveAttribute('aria-expanded', 'false')
    await expect(await answer(second)).toBeHidden()

    await second.click()
    await expect(second).toHaveAttribute('aria-expanded', 'true')
    await expect(await answer(second)).toBeVisible()

    await first.click()
    await expect(await answer(first)).toBeHidden()
  })
})

test.describe('vouchers', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('the hero buttons go to the voucher inquiry and to how to apply', async ({ page }) => {
    await page.goto(routes.vouchers())

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Обучение с ваучери')
    await expect(page.getByRole('link', { name: 'Съгласувайте обучението' })).toHaveAttribute(
      'href',
      routes.contact('vaucheri'),
    )
    await page.getByRole('link', { name: 'Как да кандидатствате' }).click()
    const apply = page.locator('#kak-da-kandidatstvate')
    await expect(apply).toBeInViewport()
    await expect(
      apply.getByRole('heading', { name: 'Как да кандидатствате за безплатен ваучер' }),
    ).toBeVisible()
  })

  test('the callout links the phone and the email, and the steps follow it', async ({ page }) => {
    await page.goto(routes.vouchers())
    const apply = page.locator('#kak-da-kandidatstvate')

    await expect(apply.getByRole('link', { name: '0886 601 108' })).toHaveAttribute(
      'href',
      'tel:+359886601108',
    )
    await expect(apply.getByRole('link', { name: 'office@euro-alliance.net' })).toHaveAttribute(
      'href',
      'mailto:office@euro-alliance.net',
    )
    await expect(apply.getByRole('listitem')).toHaveCount(3)
  })

  test('shows the approved programmes and no upcoming courses without courses', async ({
    page,
  }) => {
    await page.goto(routes.vouchers())

    for (const name of ['Многоезикова компетентност', 'Цифрова компетентност']) {
      await expect(page.getByRole('heading', { name, level: 3 })).toBeVisible()
    }
    await expect(page.locator('#predstoyashti-kursove')).toHaveCount(0)
  })
})

test.describe('professions (ЦПО)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('lists the twenty professions in their five directions', async ({ page }) => {
    await page.goto(routes.professions())

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Професии и специалности')
    const list = page.locator('section', {
      has: page.getByRole('heading', { name: 'Нов списък с професии от 2026 г.' }),
    })
    await expect(list.getByRole('heading', { level: 3 })).toHaveCount(5)
    await expect(list.getByRole('listitem')).toHaveCount(20)
    await expect(
      list.getByRole('heading', { name: '041 Бизнес администрация', level: 3 }),
    ).toBeVisible()
    await expect(list.getByRole('listitem').first()).toContainText('Оперативно счетоводство')
    await expect(list.getByRole('listitem').first()).toContainText('II, III степен')
  })

  test('the hero links the exams, which show their empty state', async ({ page }) => {
    await page.goto(routes.professions())

    await expect(page.getByRole('link', { name: 'Попитайте за професия' })).toHaveAttribute(
      'href',
      routes.contact('drugo'),
    )
    await page.getByRole('link', { name: 'Изпити за квалификация' }).click()
    const exams = page.locator('#izpiti')
    await expect(exams).toBeInViewport()
    await expect(exams.getByRole('table')).toContainText('В момента няма обявени изпити.')
    await expect(exams.getByRole('columnheader')).toHaveCount(6)
  })
})

test.describe('pedagogical specialists', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('lists the 29 programmes by theme with their official numbers', async ({ page }) => {
    await page.goto(routes.teachers())

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Педагогически специалисти')
    await page.getByRole('link', { name: 'Всички 29 програми' }).click()
    const list = page.locator('#programi')
    await expect(list).toBeInViewport()
    await expect(list.getByRole('heading', { level: 3 })).toHaveCount(5)
    await expect(list.getByRole('listitem')).toHaveCount(29)
    const languages = list.locator('article', {
      has: page.getByRole('heading', { name: 'Чужди езици' }),
    })
    await expect(languages.getByRole('listitem')).toHaveCount(4)
    await expect(languages.getByRole('listitem').first()).toContainText('04')
  })

  test('shows the figures with their note, and the formats', async ({ page }) => {
    await page.goto(routes.teachers())
    const figures = page.locator('section', {
      has: page.getByRole('heading', { name: 'Как протичат обученията' }),
    })

    for (const figure of ['29', '10–25', '16–48', '1–3']) {
      await expect(figures.getByText(figure, { exact: true })).toBeVisible()
    }
    await expect(figures.getByText(/удостоверение с присъдения брой кредити/)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Безплатно обучение' })).toBeVisible()
  })
})

test.describe('farmers', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('who can take part: the curriculum, the conditions and the documents', async ({ page }) => {
    await page.goto(routes.farmers())

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Обучение за земеделци')
    await page.getByRole('link', { name: 'Кой може да участва' }).click()
    const part = page.locator('#uchastie')
    await expect(part).toBeInViewport()
    const card = (name: string) =>
      part.locator('article', { has: page.getByRole('heading', { name }) })
    await expect(card('Учебна програма').getByRole('listitem')).toHaveCount(7)
    await expect(card('Кой може да участва').getByRole('listitem')).toHaveCount(5)
    await expect(
      part.getByRole('heading', { name: 'Документи преди старта на обучението' }),
    ).toBeVisible()
  })

  test('the funding shows the project with its EU logos', async ({ page }) => {
    await page.goto(routes.farmers())

    const project = page.locator('article', {
      has: page.getByRole('heading', {
        name: 'Повишаване знанията на земеделски стопани чрез професионални обучения',
      }),
    })
    await expect(project).toContainText('808 140,00 лв (413 195,42 €)')
    await expect(
      project.getByRole('img', { name: /Съфинансирано от Европейския съюз/ }),
    ).toBeVisible()
  })
})

test.describe('computer courses', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('numbers the eight programmes on from card to card', async ({ page }) => {
    await page.goto(routes.computerCourses())

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Компютърно обучение')
    await page.getByRole('link', { name: 'Програмите' }).click()
    const programmes = page.locator('#programi')
    await expect(programmes).toBeInViewport()
    await expect(programmes.getByRole('listitem')).toHaveCount(8)
    const design = programmes.locator('article', {
      has: page.getByRole('heading', { name: 'Интернет и дизайн' }),
    })
    await expect(design.getByRole('listitem').first()).toContainText('05')
  })

  test('the callout under the formats leads to the vouchers page', async ({ page }) => {
    await page.goto(routes.computerCourses())

    await expect(page.getByRole('heading', { name: 'Безплатно с ваучер' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Обучение с ваучери' })).toHaveAttribute(
      'href',
      routes.vouchers(),
    )
  })
})

test('Bulgarian is one page with two tabs: БЕЛ and За чужденци', async ({ page }) => {
  await page.goto(routes.languageProgram('bulgarian', 'students'))
  const tabs = page.getByRole('navigation', { name: 'Аудитория' })
  await expect(tabs.getByRole('link')).toHaveText(['БЕЛ', 'За чужденци'])
  await expect(tabs.getByRole('link', { name: 'БЕЛ' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('heading', { name: 'Изпити, за които подготвяме' })).toBeVisible()
  await tabs.getByRole('link', { name: 'За чужденци' }).click()
  await expect(page).toHaveURL(routes.languageProgram('bulgarian', 'adults'))
  await expect(page.getByRole('heading', { name: 'Научете бързо български език' })).toBeVisible()
})

test('a language or audience without a page is not found', async ({ page }) => {
  for (const path of [
    '/ezitsi/klingonski/vazrastni',
    '/ezitsi/angliyski/firmi',
    '/ezitsi/ruski/vazrastni',
    routes.languageProgram('german', 'adults'),
  ]) {
    const response = await page.goto(path)
    expect(response?.status(), path).toBe(404)
  }
})

test('the notebook writes by hand once the page has loaded, without a preload', async ({
  page,
}) => {
  await page.goto(routes.languageProgram('english', 'adults'))
  await expect(page.locator('link[rel="preload"][href*="Caveat"]')).toHaveCount(0)
  await expect(page.locator('html')).toHaveAttribute('data-hand-font', '')
  await expect.poll(() => page.evaluate(() => document.fonts.check('700 20px Caveat'))).toBe(true)
})
