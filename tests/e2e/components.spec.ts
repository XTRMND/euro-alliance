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
