import { describe, expect, it } from 'vitest'
import { clientIp, trustedHops } from '@/lib/client-ip'
import { displayName } from '@/lib/inquiry-submit'
import { rateLimiter } from '@/lib/inquiries'
import { downloadOnly } from '@/lib/security-headers'
import { inspectFile, zipEntries, zipLimits } from '@/lib/upload-checks'
import { isUpload, uploadBudget, uploadGuard } from '@/lib/upload-guard'
import { docx, docxType, odt, odtType, oldOffice, zip } from '../zip'

// The contact wizard's uploads (Trello: «Harden the contact form's file upload»).

describe('a document is what its type says', () => {
  it('accepts a Word file, an OpenDocument file, an old .doc and a PDF', () => {
    expect(inspectFile(docxType, docx())).toBe('ok')
    expect(inspectFile(odtType, odt())).toBe('ok')
    expect(inspectFile('application/msword', oldOffice('WordDocument'))).toBe('ok')
    expect(inspectFile('application/pdf', Buffer.from('%PDF-1.4\n%%EOF'))).toBe('ok')
  })

  it('refuses any other archive sent as a document', () => {
    const archive = zip([{ name: 'setup.exe', data: 'MZ' }])
    expect(inspectFile(docxType, archive)).toBe('fileType')
    expect(inspectFile(odtType, archive)).toBe('fileType')
    // A Word file isn't an OpenDocument file, and the other way round.
    expect(inspectFile(odtType, docx())).toBe('fileType')
    expect(inspectFile(docxType, odt())).toBe('fileType')
    // Cut short: no directory to read.
    expect(inspectFile(docxType, docx().subarray(0, 40))).toBe('fileType')
  })

  it('refuses an Excel file or an installer sent as .doc, and a PDF that never ends', () => {
    expect(inspectFile('application/msword', oldOffice('Workbook'))).toBe('fileType')
    expect(inspectFile('application/msword', oldOffice())).toBe('fileType')
    expect(inspectFile('application/pdf', Buffer.from('%PDF-1.4 and nothing else'))).toBe(
      'fileType',
    )
  })

  it('refuses documents with macros', () => {
    expect(inspectFile(docxType, docx([{ name: 'word/vbaProject.bin', data: 'x' }]))).toBe(
      'fileUnsafe',
    )
    expect(inspectFile(odtType, odt([{ name: 'Basic/Standard/Module1.xml', data: 'x' }]))).toBe(
      'fileUnsafe',
    )
    expect(inspectFile('application/msword', oldOffice('WordDocument', '_VBA_PROJECT'))).toBe(
      'fileUnsafe',
    )
    expect(inspectFile(docxType, docx([{ name: 'word/embeddings/run.exe', data: 'x' }]))).toBe(
      'fileUnsafe',
    )
  })

  it('refuses a decompression bomb by what its directory claims', () => {
    const claims = docx([{ name: 'word/media/big.bin', data: 'x', unpacked: 0xfffffff0 }])
    expect(inspectFile(docxType, claims)).toBe('fileUnsafe')
    const many = zip(Array.from({ length: zipLimits.entries + 1 }, (_, i) => ({ name: `f${i}` })))
    expect(zipEntries(many)).toBeUndefined()
  })

  it('reads the directory behind a comment', () => {
    const entries = zipEntries(zip([{ name: 'a' }], { comment: 'hello' }))
    expect(entries?.map((entry) => entry.name)).toEqual(['a'])
  })
})

describe('the visitor’s address', () => {
  it('is the one our own proxy wrote, not what the visitor sent', () => {
    // Caddy alone: it writes the last value.
    expect(clientIp('203.0.113.9', 1)).toBe('203.0.113.9')
    expect(clientIp('1.2.3.4, 203.0.113.9', 1)).toBe('203.0.113.9')
    // A CDN in front of Caddy: the CDN wrote the one before last.
    expect(clientIp('1.2.3.4, 203.0.113.9, 198.51.100.7', 2)).toBe('203.0.113.9')
    expect(clientIp('203.0.113.9', 2)).toBe('203.0.113.9')
    expect(clientIp(null)).toBe('unknown')
    expect(clientIp(' , ')).toBe('unknown')
  })

  it('counts one proxy unless told otherwise', () => {
    expect(trustedHops(undefined)).toBe(1)
    expect(trustedHops('2')).toBe(2)
    expect(trustedHops('0')).toBe(1)
    expect(trustedHops('many')).toBe(1)
  })
})

describe('the door for uploads', () => {
  const MB = 1024 * 1024
  const size = (mb: number) => String(mb * MB)

  it('knows a form with files', () => {
    expect(isUpload('POST', 'multipart/form-data; boundary=x')).toBe(true)
    expect(isUpload('POST', 'text/plain;charset=UTF-8')).toBe(false)
    expect(isUpload('GET', null)).toBe(false)
  })

  it('needs a length, and refuses one request that is too large', () => {
    const guard = uploadGuard()
    expect(guard(null, 'a')).toBe('lengthRequired')
    expect(guard('lots', 'a')).toBe('lengthRequired')
    expect(guard(String(uploadBudget.requestBytes + 1), 'a')).toBe('tooLarge')
    expect(guard('2048', 'a')).toBe('ok')
  })

  it('limits how many large requests one address sends', () => {
    const guard = uploadGuard({ ...uploadBudget, perAddress: 2 })
    expect(guard(size(5), 'a', 0)).toBe('ok')
    expect(guard(size(5), 'a', 1)).toBe('ok')
    expect(guard(size(5), 'a', 2)).toBe('tooMany')
    expect(guard(size(5), 'b', 3)).toBe('ok')
    // Small forms don't count.
    expect(guard('2048', 'a', 4)).toBe('ok')
  })

  it('limits what all addresses send at once, and lets them in again later', () => {
    const guard = uploadGuard({ ...uploadBudget, windowBytes: 300 * MB })
    expect(guard(size(200), 'a', 0)).toBe('ok')
    expect(guard(size(200), 'b', 1000)).toBe('busy')
    expect(guard(size(100), 'b', 1000)).toBe('ok')
    expect(guard(size(200), 'c', uploadBudget.windowMs + 2000)).toBe('ok')
  })
})

describe('what staff are served and shown', () => {
  it('serves a visitor’s file as a download only', () => {
    const headers = downloadOnly(new Headers({ 'Content-Type': 'application/pdf' }))
    expect(headers.get('Content-Disposition')).toBe('attachment')
    expect(headers.get('Content-Security-Policy')).toBe("default-src 'none'; sandbox")
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(headers.get('Cache-Control')).toBe('private, no-store')
  })

  it('shows the file’s name without a path or hidden characters', () => {
    expect(displayName('C:\\Users\\Test\\dogovor.docx')).toBe('dogovor.docx')
    expect(displayName('../../etc/passwd')).toBe('passwd')
    expect(displayName('fdp.\u202eexe.pdf')).toBe('fdp.exe.pdf')
    expect(displayName('\u0000')).toBe('file')
    expect(displayName(`${'а'.repeat(300)}.pdf`)).toHaveLength(120)
  })
})

describe('the rate limiter', () => {
  it('forgets addresses that have gone quiet', () => {
    const allow = rateLimiter(1, 1000)
    for (let i = 0; i <= 10_000; i++) allow(`address-${i}`, 0)
    expect(allow('address-1', 500)).toBe(false)
    // Past the window, with the list over its size: the old ones are dropped and allowed again.
    expect(allow('new', 5000)).toBe(true)
    expect(allow('address-1', 5000)).toBe(true)
  })
})
