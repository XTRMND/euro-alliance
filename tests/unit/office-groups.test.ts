import { describe, expect, it } from 'vitest'
import {
  fullAddress,
  groupOffices,
  hasHours,
  locationAnchorOf,
  sameAddress,
  sameHours,
} from '@/lib/office-groups'
import type { OfficeHours } from '@/lib/office-hours'

const week: OfficeHours = { regular: [{ from: 'mon', to: 'fri', opens: '8:30', closes: '17:00' }] }
const summer: OfficeHours = {
  ...week,
  seasonal: {
    startDay: 15,
    startMonth: '6',
    endDay: 1,
    endMonth: '9',
    rows: [{ from: 'mon', to: 'fri', opens: '8:30', closes: '16:00' }],
  },
}
const office = (name: string, address: string, hours?: OfficeHours) => ({ name, address, hours })

describe('sameAddress', () => {
  it('takes an address with the building in front as the same address', () => {
    expect(sameAddress('Test building, Town 1000, Test St 1', 'Town 1000, Test St 1')).toBe(true)
    expect(sameAddress('Town 1000,  Test St 1', 'town 1000, test st 1')).toBe(true)
  })

  it('tells different addresses apart', () => {
    expect(sameAddress('Town 1000, Test St 1', 'Town 1000, Test St 13')).toBe(false)
    expect(sameAddress('Town 1000, Test St 1', 'Other 2000, Test St 1')).toBe(false)
    expect(sameAddress('', '')).toBe(false)
  })
})

describe('sameHours', () => {
  it('compares the week and the season', () => {
    expect(sameHours(week, { regular: [...week.regular!] })).toBe(true)
    expect(sameHours(week, summer)).toBe(false)
    expect(sameHours(undefined, null)).toBe(true)
  })

  it('reads a single day with or without its last day', () => {
    const sat = (to?: 'sat') => ({
      regular: [{ from: 'sat' as const, to, opens: '9:00', closes: '13:00' }],
    })
    expect(sameHours(sat(), sat('sat'))).toBe(true)
  })
})

describe('groupOffices', () => {
  it('puts offices at one address together, in their order', () => {
    const a = office('Test office A', 'Test building, Town 1000, Test St 1', week)
    const b = office('Test office B', 'Other 2000, Test St 9', week)
    const c = office('Test office C', 'Town 1000, Test St 1', week)
    expect(groupOffices([a, b, c])).toEqual([[a, c], [b]])
  })

  it('keeps offices apart when their hours differ', () => {
    const a = office('Test office A', 'Town 1000, Test St 1', week)
    const b = office('Test office B', 'Town 1000, Test St 1', summer)
    expect(groupOffices([a, b])).toEqual([[a], [b]])
  })
})

it('fullAddress is the longest way the address is written', () => {
  expect(
    fullAddress([
      office('A', 'Town 1000, Test St 1'),
      office('B', 'Test building, Town 1000, Test St 1'),
    ]),
  ).toBe('Test building, Town 1000, Test St 1')
})

it('hasHours needs a week or a season', () => {
  expect(hasHours(week)).toBe(true)
  expect(hasHours({ regular: [] })).toBe(false)
  expect(hasHours(null)).toBe(false)
})

it('locationAnchorOf pairs the offices with the two locations', () => {
  expect(locationAnchorOf('courses')).toBe('plovdiv')
  expect(locationAnchorOf('translations-plovdiv')).toBe('plovdiv')
  expect(locationAnchorOf('translations-sofia')).toBe('sofia')
})
