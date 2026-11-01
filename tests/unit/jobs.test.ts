import { describe, expect, it } from 'vitest'
import { cronAuthorized } from '@/jobs'
import { retentionCutoff } from '@/jobs/retention'

const secret = 'a'.repeat(32)
const request = (authorization?: string) => ({
  headers: new Headers(authorization ? { authorization } : {}),
})

describe('job endpoints', () => {
  it('accept only the exact cron secret', () => {
    expect(cronAuthorized(request(`Bearer ${secret}`), secret)).toBe(true)
    expect(cronAuthorized(request(`Bearer ${secret}x`), secret)).toBe(false)
    expect(cronAuthorized(request(), secret)).toBe(false)
  })

  it('are closed while no long enough secret is set', () => {
    expect(cronAuthorized(request('Bearer short'), 'short')).toBe(false)
    expect(cronAuthorized(request('Bearer '), undefined)).toBe(false)
  })
})

describe('retention', () => {
  it('keeps a year', () => {
    expect(retentionCutoff(new Date('2027-11-01T12:00:00.000Z'))).toBe('2026-11-01T12:00:00.000Z')
  })
})
