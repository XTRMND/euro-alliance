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
