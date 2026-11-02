import { describe, expect, it } from 'vitest'
import { contentSecurityPolicy, createNonce, securityHeaders } from '@/lib/security-headers'

const directive = (policy: string, name: string) =>
  policy.split('; ').find((part) => part.startsWith(`${name} `))

describe('the Content-Security-Policy', () => {
  it('trusts scripts by nonce only, with no eval or inline code in production', () => {
    const scripts = directive(contentSecurityPolicy({ nonce: 'abc' }), 'script-src')
    expect(scripts).toBe("script-src 'self' 'nonce-abc' 'strict-dynamic'")
  })

  it('allows eval and the dev server socket in development', () => {
    const policy = contentSecurityPolicy({ nonce: 'abc', dev: true })
    expect(directive(policy, 'script-src')).toContain("'unsafe-eval'")
    expect(directive(policy, 'connect-src')).toContain('ws:')
  })

  it('names Google Analytics only when a measurement ID is set', () => {
    expect(contentSecurityPolicy({ nonce: 'abc' })).not.toContain('google')
    const policy = contentSecurityPolicy({ nonce: 'abc', analytics: true })
    expect(directive(policy, 'connect-src')).toContain('https://*.google-analytics.com')
    expect(directive(policy, 'img-src')).toContain('https://*.googletagmanager.com')
  })

  it('forbids framing, plugins and other bases and form targets', () => {
    const policy = contentSecurityPolicy({ nonce: 'abc' })
    expect(policy).toContain("frame-ancestors 'none'")
    expect(policy).toContain("object-src 'none'")
    expect(policy).toContain("base-uri 'self'")
    expect(policy).toContain("form-action 'self'")
  })
})

describe('the nonce', () => {
  it('is 128 random bits, new every time', () => {
    const nonce = createNonce()
    expect(atob(nonce)).toHaveLength(16)
    expect(createNonce()).not.toBe(nonce)
  })
})

describe('the shared headers', () => {
  it('send HSTS in production only', () => {
    const keys = (production: boolean) => securityHeaders({ production }).map(({ key }) => key)
    expect(keys(true)).toContain('Strict-Transport-Security')
    expect(keys(false)).not.toContain('Strict-Transport-Security')
  })
})
