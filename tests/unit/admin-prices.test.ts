import { describe, expect, it } from 'vitest'
import {
  isDirty,
  matchesFilter,
  parseAmount,
  priceChange,
  priceRows,
  priceSections,
  sectionCount,
  unsavedLabel,
} from '@/lib/admin-prices'

// Obviously fake courses: the rows of the «Цени» screen, its filters and what a save does.
const courses = [
  { id: 1, title: 'Test course A', category: 'languages' as const, voucherEligible: true },
  { id: 2, title: 'Test course B', category: 'farmers' as const, free: true },
  { id: 3, title: 'Test course C', category: 'computer' as const },
]
const groups = [
  { id: 8, course: 1, start: '2099-11-17T00:00:00.000Z', name: 'Test group' },
  { id: 7, course: 1, start: '2099-11-03T00:00:00.000Z' },
  { id: 9, course: 2, start: '2099-11-03T00:00:00.000Z' },
]
const prices = [
  { id: 20, course: 1, price: 460.16, currency: 'EUR' as const },
  {
    id: 21,
    course: 1,
    group: 7,
    price: 495,
    regularPrice: 580,
    currency: 'EUR' as const,
    label: 'промоция',
  },
]
const rows = priceRows(courses, groups, prices)
const row = (key: string) => rows.find((r) => r.key === key)!

describe('priceRows', () => {
  it('lists the base price, then the groups by start; a free course has one row', () => {
    expect(rows.map((r) => [r.key, r.scope])).toEqual([
      ['c1', 'Целия курс'],
      ['g7', 'Група · 03.11.2099'],
      ['g8', 'Група · 17.11.2099 · Test group'],
      ['c2', 'Целия курс'],
      ['c3', 'Целия курс'],
    ])
    expect(row('c2').free).toBe(true)
  })
  it('fills each row from its own stored price', () => {
    expect(row('c1')).toMatchObject({ priceId: 20, values: { price: '460,16', regularPrice: '' } })
    expect(row('g7').values).toEqual({
      price: '495',
      regularPrice: '580',
      label: 'промоция',
      note: '',
    })
    expect(row('g8').priceId).toBeUndefined()
  })
})

describe('filters and sections', () => {
  it('groups by programme and counts prices, or courses when there is none', () => {
    const sections = priceSections(rows)
    expect(sections.map((s) => s.label)).toEqual([
      'Езикови курсове',
      'Земеделски стопани',
      'Компютърни курсове',
    ])
    const count = (i: number) => sectionCount(sections[i].rows, (r) => r.values)
    expect([count(0), count(1), count(2)]).toEqual(['2 цени', '1 курс', '1 курс'])
  })
  it('matches vouchers and promotions', () => {
    const keys = (filter: Parameters<typeof matchesFilter>[2]) =>
      rows.filter((r) => matchesFilter(r, r.values, filter)).map((r) => r.key)
    expect(keys('vouchers')).toEqual(['c1', 'g7', 'g8'])
    expect(keys('promotions')).toEqual(['g7'])
    expect(keys('farmers')).toEqual(['c2'])
  })
})

describe('parseAmount', () => {
  it('reads a decimal comma or point and refuses the rest', () => {
    expect(parseAmount('460,16')).toBe(460.16)
    expect(parseAmount(' 1 200 ')).toBe(1200)
    expect(parseAmount('495.5')).toBe(495.5)
    expect(parseAmount('-5')).toBeUndefined()
    expect(parseAmount('495 €')).toBeUndefined()
  })
})

describe('priceChange', () => {
  const typed = (key: string, values: object) => ({ ...row(key).values, ...values })
  it('creates a price for a row without one, in euro', () => {
    expect(priceChange(row('g8'), typed('g8', { price: '520', note: ' test ' }))).toEqual({
      kind: 'save',
      id: undefined,
      data: {
        course: 1,
        group: 8,
        price: 520,
        currency: 'EUR',
        regularPrice: null,
        label: null,
        note: 'test',
      },
    })
  })
  it('updates a stored price and deletes an emptied one', () => {
    expect(priceChange(row('c1'), typed('c1', { price: '470' }))).toMatchObject({
      kind: 'save',
      id: 20,
    })
    expect(priceChange(row('g7'), { price: '', regularPrice: '', label: '', note: '' })).toEqual({
      kind: 'delete',
      id: 21,
    })
  })
  it('refuses a label without a price, a word, and a regular price that is not higher', () => {
    expect(priceChange(row('c3'), typed('c3', { label: 'test' }))).toMatchObject({
      kind: 'error',
      field: 'price',
    })
    expect(priceChange(row('c3'), typed('c3', { price: 'abc' }))).toMatchObject({
      kind: 'error',
      field: 'price',
    })
    expect(
      priceChange(row('c3'), typed('c3', { price: '500', regularPrice: '400' })),
    ).toMatchObject({
      kind: 'error',
      field: 'regularPrice',
    })
  })
})

describe('the unsaved state', () => {
  it('ignores spaces around what is typed', () => {
    expect(isDirty(row('c1'), typed('460,16 '))).toBe(false)
    expect(isDirty(row('c1'), typed('470'))).toBe(true)
    function typed(price: string) {
      return { ...row('c1').values, price }
    }
  })
  it('counts in Bulgarian', () => {
    expect([unsavedLabel(1), unsavedLabel(3)]).toEqual([
      '1 незаписана промяна',
      '3 незаписани промени',
    ])
  })
})
