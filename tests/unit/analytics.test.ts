import { describe, expect, it } from 'vitest'
import { inboxOf, track } from '@/lib/analytics'

describe('analytics', () => {
  it('names the inbox of the three public addresses only', () => {
    expect(inboxOf('office@euro-alliance.net')).toBe('office')
    expect(inboxOf('Prevod@euro-alliance.net')).toBe('prevod')
    expect(inboxOf('trans@euro-alliance.net')).toBe('trans')
    expect(inboxOf('someone@example.com')).toBeUndefined()
  })

  it('does nothing until GA4 is connected (PR 20)', () => {
    expect(track('tel_click', { office: 'courses', placement: 'header' })).toBeUndefined()
  })
})
