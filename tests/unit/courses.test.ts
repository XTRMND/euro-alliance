import { describe, expect, it } from 'vitest'
import { courseTags, matchesUpcomingFilter, upcomingFilters } from '@/lib/courses'
import { destinations, hrefOf } from '@/lib/destinations'
import { routes } from '@/lib/routes'

const labels = {
  audience: { students: 'Ученици', adults: 'Възрастни', companies: 'Фирми' },
  format: { 'in-person': 'Присъствено', online: 'Онлайн' },
  voucher: 'С ваучер',
}

describe('course card tags', () => {
  it('follow the four cards in Figma (48:242)', () => {
    expect(courseTags({ audience: 'adults', format: 'online' }, labels)).toEqual([
      'Възрастни',
      'Онлайн',
    ])
    expect(
      courseTags({ audience: 'adults', format: 'online', voucherEligible: true }, labels),
    ).toEqual(['Възрастни', 'С ваучер'])
    expect(
      courseTags({ audience: 'students', audienceNote: '12 клас', format: 'in-person' }, labels),
    ).toEqual(['Ученици 12 клас', 'Присъствено'])
    expect(
      courseTags({ audience: 'adults', format: 'in-person', cardTag: 'Вечерна група' }, labels),
    ).toEqual(['Възрастни', 'Вечерна група'])
  })

  it('leave out what isn’t set', () => {
    expect(courseTags({}, labels)).toEqual([])
  })
})

describe('upcoming course tabs', () => {
  it('sort a course into every tab it belongs to', () => {
    const course = { audience: 'students', format: 'online', voucherEligible: true } as const
    expect(upcomingFilters.filter((filter) => matchesUpcomingFilter(course, filter))).toEqual([
      'all',
      'students',
      'voucher',
      'online',
    ])
  })
})

describe('destinations', () => {
  it('give «Изпити и сертификати» and «Компютърни курсове» their fixed targets', () => {
    expect(destinations.certificates.href).toBe('/ezitsi/angliyski/vazrastni#sertifikati')
    expect(destinations.computerCourses.href).toBe(routes.computerCourses())
  })

  it('resolve only known destinations', () => {
    expect(hrefOf('vouchers')).toBe('/vaucheri')
    expect(hrefOf('nowhere')).toBeUndefined()
    expect(hrefOf(null)).toBeUndefined()
  })
})
