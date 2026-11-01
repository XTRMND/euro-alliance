import { describe, expect, it } from 'vitest'
import { inboxOf, measurementIdOf, track } from '@/lib/analytics'

describe('analytics', () => {
  it('names the inbox of the three public addresses only', () => {
    expect(inboxOf('office@euro-alliance.net')).toBe('office')
    expect(inboxOf('Prevod@euro-alliance.net')).toBe('prevod')
    expect(inboxOf('trans@euro-alliance.net')).toBe('trans')
    expect(inboxOf('someone@example.com')).toBeUndefined()
  })

  it('does nothing outside the browser', () => {
    expect(track('tel_click', { office: 'courses', placement: 'header' })).toBeUndefined()
  })
})

describe('measurementIdOf', () => {
  it('takes a GA4 measurement ID and ignores a missing or placeholder one', () => {
    expect(measurementIdOf('G-TEST123456')).toBe('G-TEST123456')
    expect(measurementIdOf('G-XXXXXXXXXX')).toBeUndefined()
    expect(measurementIdOf('UA-12345-1')).toBeUndefined()
    expect(measurementIdOf(undefined)).toBeUndefined()
  })
})
