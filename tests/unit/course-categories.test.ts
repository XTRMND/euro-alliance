import { describe, expect, it } from 'vitest'
import { listingCategory, storedCategory } from '@/lib/courses'

// docs/admin-redesign.md, decision 4: five stored categories (the programme branches); the site's
// listing keeps its seven.

describe('course categories', () => {
  it('stores exam preparation and voucher courses under a programme branch', () => {
    expect(storedCategory({ category: 'exams', language: 'english' })).toEqual({
      category: 'languages',
      examPrep: true,
    })
    expect(storedCategory({ category: 'vouchers', language: 'english' })).toEqual({
      category: 'languages',
      voucherEligible: true,
    })
    expect(storedCategory({ category: 'vouchers' })).toEqual({
      category: 'computer',
      voucherEligible: true,
    })
    expect(storedCategory({ category: 'farmers' })).toEqual({ category: 'farmers' })
  })

  it('lists them on the site where they were before', () => {
    for (const course of [
      { category: 'exams' as const, language: 'bulgarian' },
      { category: 'vouchers' as const, language: 'english' },
      { category: 'vouchers' as const },
      { category: 'languages' as const, language: 'german' },
      { category: 'computer' as const },
    ])
      expect(listingCategory(storedCategory(course))).toBe(course.category)
  })
})
