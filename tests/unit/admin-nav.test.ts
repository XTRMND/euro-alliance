import { describe, expect, it } from 'vitest'
import { activeNavKey, adminFooterNav, adminNav, navTrail, type NavNode } from '@/lib/admin-nav'

// The admin's menu (docs/admin-redesign.md, decision 1; Figma «Admin / Sidebar v2»).

const tree = adminNav({
  adminRoute: '/admin',
  programIds: { vocational: 4, translations: 8 },
  newInquiries: 3,
})
const find = (key: string) => navTrail(tree, key).at(-1)
const labels = (nodes: NavNode[] = []) => nodes.map((node) => node.label)

describe('the menu mirrors the site', () => {
  it('has the site’s sections in order, and nothing called «Глобални»', () => {
    expect(labels(tree)).toEqual([
      'Табло',
      'Запитвания',
      'Начална страница',
      'Обучения',
      'Цени',
      'Преводи',
      'Новини',
      'За нас',
      'Контакти',
      'Сайт',
    ])
    expect(labels(find('Обучения')?.children)).toEqual([
      'Езикови курсове',
      'Професии (ЦПО)',
      'Педагогически специалисти',
      'Земеделски стопани',
      'Компютърни курсове',
      'Ваучери',
      'Всички курсове',
    ])
    expect(labels(find('Обучения/Езикови курсове')?.children)).toEqual([
      'Програми',
      'Курсове',
      'Учебни системи',
      'Изпити и сертификати',
    ])
    expect(labels(find('Сайт')?.children)).toEqual([
      'Навигация',
      'Данни за фирмата',
      'Правни страници',
      'Пренасочвания',
    ])
    expect(labels(adminFooterNav('/admin'))).toEqual(['Потребители', 'Изход'])
    expect(JSON.stringify(tree)).not.toContain('Глобални')
  })

  it('opens filtered lists, a programme’s page and the globals where they are on the site', () => {
    expect(find('Обучения/Езикови курсове/Курсове')?.href).toBe(
      '/admin/collections/courses?where[category][equals]=languages',
    )
    expect(find('Обучения/Ваучери/Курсове')?.href).toBe(
      '/admin/collections/courses?where[voucherEligible][equals]=true',
    )
    expect(find('Обучения/Професии (ЦПО)/Страница')?.href).toBe('/admin/collections/programs/4')
    // A programme page that doesn't exist yet opens the list filtered to its type.
    expect(find('Обучения/Земеделски стопани/Страница')?.href).toBe(
      '/admin/collections/programs?where[type][equals]=farmers',
    )
    expect(find('Преводи/Езици')?.href).toBe(
      '/admin/collections/programs/8#field-translationLanguages',
    )
    expect(find('Начална страница')?.href).toBe('/admin/globals/home')
    expect(find('За нас/Страница')?.href).toBe('/admin/globals/about')
    expect(find('Запитвания')?.badge).toBe(3)
  })
})

describe('the item of the open screen', () => {
  it('is the dashboard, a global’s place on the site, or a collection’s item', () => {
    expect(activeNavKey({ path: '' })).toBe('Табло')
    expect(activeNavKey({ path: '/globals/navigation' })).toBe('Сайт/Навигация')
    expect(activeNavKey({ path: '/globals/contact' })).toBe('Контакти/Страница')
    expect(activeNavKey({ path: '/collections/news/12' })).toBe('Новини')
    expect(activeNavKey({ path: '/collections/exams' })).toBe(
      'Обучения/Професии (ЦПО)/Изпитни сесии',
    )
    expect(activeNavKey({ path: '/collections/users' })).toBe('Потребители')
    expect(activeNavKey({ path: '/account' })).toBeUndefined()
  })

  it('follows the course list’s filter, and a course’s own programme', () => {
    const list = '/collections/courses'
    expect(activeNavKey({ path: list })).toBe('Обучения/Всички курсове')
    expect(activeNavKey({ path: list, filter: { field: 'category', value: 'computer' } })).toBe(
      'Обучения/Компютърни курсове/Курсове',
    )
    expect(activeNavKey({ path: list, filter: { field: 'voucherEligible', value: 'true' } })).toBe(
      'Обучения/Ваучери/Курсове',
    )
    expect(activeNavKey({ path: `${list}/7`, doc: { category: 'languages' } })).toBe(
      'Обучения/Езикови курсове/Курсове',
    )
    // The teachers' branch has no course list: its course sits under «Всички курсове».
    expect(activeNavKey({ path: `${list}/9`, doc: { category: 'teachers' } })).toBe(
      'Обучения/Всички курсове',
    )
    expect(activeNavKey({ path: '/collections/groups/3', doc: { category: 'farmers' } })).toBe(
      'Обучения/Земеделски стопани/Курсове',
    )
  })

  it('puts a programme under its branch: a language page in the list, the others as «Страница»', () => {
    const page = '/collections/programs/5'
    expect(activeNavKey({ path: page, doc: { type: 'language' } })).toBe(
      'Обучения/Езикови курсове/Програми',
    )
    expect(activeNavKey({ path: page, doc: { type: 'vouchers' } })).toBe(
      'Обучения/Ваучери/Страница',
    )
    expect(activeNavKey({ path: page, doc: { type: 'translations' } })).toBe('Преводи/Страница')
  })

  it('gives the path to the item, for the breadcrumb and the sub-nav', () => {
    expect(labels(navTrail(tree, 'Обучения/Езикови курсове/Курсове'))).toEqual([
      'Обучения',
      'Езикови курсове',
      'Курсове',
    ])
    expect(navTrail(tree, 'No such item')).toEqual([])
    expect(navTrail(tree, undefined)).toEqual([])
  })
})
