import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { activePdf, fileAddress, fileHeaders, fileTypes, storedFileName } from '@/lib/files'
import { signedSession, signingKey } from '@/lib/session-token'
import { inspectFile } from '@/lib/upload-checks'
import { apiBudget, apiFormStatus, isApiForm } from '@/lib/upload-guard'

// «Файлове» and the door in front of Payload's API (v0.29.1).

describe('«Файлове»', () => {
  it('gives a file an address without a host', () => {
    expect(fileAddress('pravilnik-1a2b3c4d.pdf')).toBe('/api/files/file/pravilnik-1a2b3c4d.pdf')
  })

  it('takes only documents the upload checks look into: no images, pages or scripts', () => {
    const types = Object.keys(fileTypes)
    expect(types).toContain('application/pdf')
    expect(types.some((type) => /image|html|svg|script|zip$/.test(type))).toBe(false)
    for (const type of types)
      expect(inspectFile(type, Buffer.from('<html></html>'))).toBe('fileType')
  })

  it('stores a file under its own name: Latin, a random part, the checked type’s extension', () => {
    const pdf = 'application/pdf'
    expect(storedFileName('Правилник 2026 (нов).PDF', pdf, 'abcd1234')).toBe(
      'pravilnik-2026-nov-abcd1234.pdf',
    )
    // The extension it came with doesn't survive, nor a path.
    expect(storedFileName('faktura.html', pdf, 'abcd1234')).toBe('faktura-abcd1234.pdf')
    expect(storedFileName('../../etc/passwd', pdf, 'abcd1234')).toBe('passwd-abcd1234.pdf')
    expect(storedFileName('.pdf', pdf, 'abcd1234')).toBe('fayl-abcd1234.pdf')
    expect(storedFileName('a'.repeat(300) + '.pdf', pdf, 'abcd1234')).toHaveLength(60 + 13)
    expect(storedFileName('x.pdf', pdf)).not.toBe(storedFileName('x.pdf', pdf))
    expect(storedFileName('x.pdf', pdf)).toMatch(/^x-[0-9a-f]{8}\.pdf$/)
    // The text editor takes an address only if it's plain: one with «%» in it (a space in the
    // name, v0.29.0) was rewritten into a link that led nowhere. The editor's own pattern:
    const editorTakes = /^\/[\w\-./]*$/
    for (const name of ['Daniela Georgieva.pdf', 'Правилник №2 (2026).pdf', 'a%20b&c?.pdf'])
      expect(fileAddress(storedFileName(name, pdf))).toMatch(editorTakes)
  })

  it('finds a PDF that runs a script, starts a program or carries a file', () => {
    const pdf = (body: string) => Buffer.from(`%PDF-1.4\n${body}\n%%EOF`)
    expect(activePdf(pdf('1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj'))).toBe(false)
    expect(activePdf(pdf('<</S/JavaScript/JS(app.alert(1))>>'))).toBe(true)
    expect(activePdf(pdf('<</OpenAction<</S/Launch/F(cmd.exe)>>>>'))).toBe(true)
    expect(activePdf(pdf('<</Type/EmbeddedFile>>'))).toBe(true)
    // Written with «#» codes, as a file that hides it would.
    expect(activePdf(pdf('<</S/#4AavaScr#69pt>>'))).toBe(true)
    // A word that only starts the same way isn't one of them.
    expect(activePdf(pdf('<</JSONData 1/Launcher 2>>'))).toBe(false)
  })

  it('shows a PDF in the browser and only ever downloads the rest', () => {
    const pdf = fileHeaders(new Headers({ 'Content-Type': 'application/pdf' }))
    expect(pdf.get('Content-Disposition')).toBe('inline')
    expect(pdf.get('Content-Security-Policy')).toBe("default-src 'none'; frame-ancestors 'none'")
    expect(pdf.get('X-Content-Type-Options')).toBe('nosniff')

    const word = fileHeaders(new Headers({ 'Content-Type': 'application/msword' }))
    expect(word.get('Content-Disposition')).toBe('attachment')
    expect(word.get('Content-Security-Policy')).toBe("default-src 'none'; sandbox")
    expect(word.get('X-Content-Type-Options')).toBe('nosniff')
  })
})

describe('a session Payload signed', () => {
  const secret = 'test-secret'
  const now = Date.UTC(2026, 10, 24)
  const part = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const token = (exp: number, key = signingKey(secret), alg = 'HS256') => {
    const signed = `${part({ alg, typ: 'JWT' })}.${part({ id: 1, exp })}`
    return `${signed}.${createHmac('sha256', key).update(signed).digest('base64url')}`
  }
  const later = now / 1000 + 3600
  const cookie = (value: string) => ({ cookie: `a=b; payload-token=${value}`, authorization: null })

  it('is accepted from the cookie or the header while it lasts', () => {
    expect(signedSession(cookie(token(later)), secret, now)).toBe(true)
    expect(signedSession({ cookie: null, authorization: `JWT ${token(later)}` }, secret, now)).toBe(
      true,
    )
  })

  it('is refused when it’s missing, expired, signed with another key or not signed', () => {
    expect(signedSession({ cookie: null, authorization: null }, secret, now)).toBe(false)
    expect(signedSession(cookie('anything'), secret, now)).toBe(false)
    expect(signedSession(cookie(token(now / 1000 - 1)), secret, now)).toBe(false)
    expect(signedSession(cookie(token(later, signingKey('other'))), secret, now)).toBe(false)
    expect(signedSession(cookie(token(later, signingKey(secret), 'none')), secret, now)).toBe(false)
    const [head, body] = token(later).split('.')
    expect(signedSession(cookie(`${head}.${body}.`), secret, now)).toBe(false)
    // No secret set: nothing is trusted.
    expect(signedSession(cookie(token(later, signingKey(''))), '', now)).toBe(false)
  })
})

describe('a form sent to Payload’s API', () => {
  it('is a multipart POST, PATCH or PUT', () => {
    expect(isApiForm('POST', 'multipart/form-data; boundary=x')).toBe(true)
    expect(isApiForm('PATCH', 'Multipart/Form-Data; boundary=x')).toBe(true)
    expect(isApiForm('GET', 'multipart/form-data; boundary=x')).toBe(false)
    expect(isApiForm('POST', 'application/json')).toBe(false)
  })

  it('passes small without a session, and up to one file with one', () => {
    const { anonymousBytes, signedBytes } = apiBudget
    expect(apiFormStatus('2000', false)).toBeUndefined()
    expect(apiFormStatus(String(anonymousBytes + 1), false)).toBe(401)
    expect(apiFormStatus(String(anonymousBytes + 1), true)).toBeUndefined()
    expect(apiFormStatus(String(signedBytes + 1), true)).toBe(413)
    expect(apiFormStatus(String(signedBytes + 1), false)).toBe(413)
    // Without a length there's nothing to judge by.
    expect(apiFormStatus(null, true)).toBe(411)
    expect(apiFormStatus('abc', true)).toBe(411)
  })
})
