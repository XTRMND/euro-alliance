import { describe, expect, it } from 'vitest'
import { emailAdapter, parseFrom, redirect } from '@/lib/email'

describe('redirect', () => {
  it('sends to the override address only', () => {
    const message = redirect(
      {
        to: ['a@example.com', { name: 'B', address: 'b@example.com' }],
        cc: 'c@example.com',
        bcc: { name: 'D', address: 'd@example.com' },
        subject: 'Test',
        headers: { 'X-Test': '1' },
      },
      'override@example.com',
    )

    expect(message.to).toBe('override@example.com')
    expect(message).not.toHaveProperty('cc')
    expect(message).not.toHaveProperty('bcc')
    expect(message.subject).toBe('Test')
    expect(message.headers).toEqual({
      'X-Test': '1',
      'X-Original-Recipients': 'a@example.com, b@example.com, c@example.com, d@example.com',
    })
  })
})

describe('parseFrom', () => {
  it('reads a name and an address', () => {
    expect(parseFrom('Евро Алианс <no-reply@example.com>')).toEqual({
      name: 'Евро Алианс',
      address: 'no-reply@example.com',
    })
    expect(parseFrom('"Quoted Name" <q@example.com>')).toEqual({
      name: 'Quoted Name',
      address: 'q@example.com',
    })
  })

  it('accepts a bare address', () => {
    expect(parseFrom('no-reply@example.com')).toEqual({
      name: 'no-reply@example.com',
      address: 'no-reply@example.com',
    })
  })
})

describe('emailAdapter', () => {
  it('is off without SMTP_HOST', () => {
    expect(emailAdapter({})).toBeUndefined()
  })
})
