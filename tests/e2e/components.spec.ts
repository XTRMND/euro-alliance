import { expect, test } from '@playwright/test'
import { devRoutes } from '@/lib/routes'

// Keyboard and screen-reader behaviour of the base components (PR 4), on the dev gallery.
// Roles, names and states are what assistive technology gets.

test.beforeEach(async ({ page }) => {
  await page.goto(devRoutes.components)
})

test('a button activates with Enter and Space', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Натисни' })
  await button.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Space')

  await expect(page.getByTestId('clicks')).toHaveText('2')
})

test('a disabled button is announced as disabled', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Label' }).and(page.locator(':disabled')),
  ).toBeDisabled()
})

test('a filter chip toggles its pressed state', async ({ page }) => {
  const chip = page.getByRole('button', { name: 'Онлайн' })
  await expect(chip).toHaveAttribute('aria-pressed', 'false')

  await chip.focus()
  await page.keyboard.press('Space')

  await expect(chip).toHaveAttribute('aria-pressed', 'true')
})

test('a checkbox has its label as name and toggles with Space', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'Ученици' })
  await expect(checkbox).not.toBeChecked()

  await checkbox.focus()
  await page.keyboard.press('Space')

  await expect(checkbox).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Онлайн' })).toBeDisabled()
})

test('radio cards form a group and move with the arrow keys', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Опции' })
  await expect(group.getByRole('radio')).toHaveCount(3)

  await group.getByRole('radio', { name: 'Опция 1' }).focus()
  await page.keyboard.press('ArrowDown')

  await expect(group.getByRole('radio', { name: 'Опция 2' })).toBeChecked()
  await expect(group.getByRole('radio', { name: 'Опция 1' })).not.toBeChecked()
})

test('a toggle is a switch that flips with Space', async ({ page }) => {
  const toggle = page.getByRole('switch', { name: 'Статистика' })
  await expect(toggle).not.toBeChecked()

  await toggle.focus()
  await page.keyboard.press('Space')

  await expect(toggle).toBeChecked()
})

test('a locked toggle is on and can’t be changed', async ({ page }) => {
  const locked = page.getByRole('switch', { name: 'Заключено' })

  await expect(locked).toBeChecked()
  await expect(locked).toBeDisabled()
})

test('focus is visible on every control', async ({ page }) => {
  for (const control of [
    page.getByRole('button', { name: 'Натисни' }),
    page.getByRole('checkbox', { name: 'Ученици' }),
    page.getByRole('radio', { name: 'Опция 1' }),
    page.getByRole('switch', { name: 'Статистика' }),
  ]) {
    await control.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    // The ring sits on the control or on the drawn element next to it.
    const outline = await control.evaluate((el) => {
      const drawn = el.matches('input') ? (el.nextElementSibling ?? el) : el
      const card = el.closest('label')
      const style = [drawn, card, el]
        .filter((node): node is Element => Boolean(node))
        .map((node) => getComputedStyle(node))
        .find((s) => s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0)
      return style?.outlineWidth ?? '0px'
    })
    expect(outline).toBe('3px')
  }
})

// The translation's language pair (Trello #6): chips, not dropdowns.
test('the language pair is two radio groups that never hold the same language', async ({
  page,
}) => {
  const section = page.getByRole('region', { name: 'Language pair' })
  const from = section.getByRole('group', { name: 'От' })
  const to = section.getByRole('group', { name: 'На' })
  const result = page.getByTestId('pair')

  await expect(section.getByRole('combobox')).toHaveCount(0)
  await expect(from.getByRole('radio')).toHaveCount(10)
  await expect(from.getByRole('radio', { name: 'Български' })).toBeChecked()
  await expect(to.getByRole('radio', { checked: true })).toHaveCount(0)

  await to.getByRole('radio', { name: 'Английски' }).check()
  await expect(result).toHaveText('Български → Английски')

  // Picking the other side's language swaps the two.
  await from.getByRole('radio', { name: 'Английски' }).check()
  await expect(result).toHaveText('Английски → Български')

  await section.getByRole('button', { name: 'Размени езиците' }).click()
  await expect(result).toHaveText('Български → Английски')

  // Arrow keys move inside a group, as in any radio group.
  await to.getByRole('radio', { name: 'Английски' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(result).toHaveText('Български → Френски')
})

test('the language pair fits a 320px screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  const section = page.getByRole('region', { name: 'Language pair' })
  await section.scrollIntoViewIfNeeded()

  const outside = await section.evaluate(
    (element) =>
      [...element.querySelectorAll('label, button')].filter((item) => {
        const box = item.getBoundingClientRect()
        return box.left < 0 || box.right > window.innerWidth
      }).length,
  )
  expect(outside).toBe(0)
})
