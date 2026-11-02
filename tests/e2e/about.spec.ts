import { expect, test } from '@playwright/test'
import { aboutSections, routes } from '@/lib/routes'

// The About page (PR 16), from the seeded `about` global.

// Reduced motion: anchors jump instead of scrolling smoothly, which under a busy CPU can outlast
// the assertion's timeout (the tests are about where the links lead, not the motion).
test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })

test('the subnav links the sections and marks the one in view', async ({ page }) => {
  await page.goto(routes.about())
  const subnav = page.getByRole('navigation', { name: 'Раздели на страницата' })

  await expect(subnav.getByRole('link')).toHaveCount(6)
  await expect(subnav.getByRole('link', { name: 'История' })).toHaveAttribute(
    'aria-current',
    'true',
  )
  await subnav.getByRole('link', { name: 'Проекти' }).click()
  await expect(page.locator(`#${aboutSections.projects}`)).toBeInViewport()
  await expect(subnav.getByRole('link', { name: 'Проекти' })).toHaveAttribute(
    'aria-current',
    'true',
  )
})

test('the footer’s About links reach their sections', async ({ page }) => {
  for (const section of ['history', 'documents', 'projects'] as const) {
    await page.goto(routes.about(section))
    await expect(page.locator(`#${aboutSections[section]}`)).toBeInViewport()
  }
})

test('a licence opens full size and closes again', async ({ page }) => {
  await page.goto(routes.about())
  await page.getByRole('link', { name: 'Виж лицензите' }).click()
  await expect(page.locator(`#${aboutSections.licences}`)).toBeInViewport()

  await page.getByRole('button', { name: 'Виж в цял размер: Лиценз за ЦПО от НАПОО' }).click()
  const dialog = page.getByRole('dialog', { name: 'Лиценз за ЦПО от НАПОО' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('img')).toHaveAttribute('alt', /200312088/)
  await dialog.getByRole('button', { name: 'Затвори' }).click()
  await expect(dialog).toBeHidden()
})

test('both funded projects show with their EU logos', async ({ page }) => {
  await page.goto(routes.about('projects'))
  const projects = page.locator(`#${aboutSections.projects}`).getByRole('article')

  await expect(projects).toHaveCount(2)
  await expect(projects.nth(1)).toContainText('BG16RFPR001-1.004-1004')
  for (const project of await projects.all()) {
    await expect(project.getByRole('img')).toBeVisible()
  }
})
