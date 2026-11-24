import { describe, expect, it } from 'vitest'
import { fileAddress, fileTypes } from '@/lib/files'
import { inspectFile } from '@/lib/upload-checks'

describe('«Файлове»', () => {
  it('gives a file an address without a host', () => {
    expect(fileAddress('pravilnik.pdf')).toBe('/api/files/file/pravilnik.pdf')
    expect(fileAddress('Правилник 2026.pdf')).toBe(
      '/api/files/file/%D0%9F%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%BD%D0%B8%D0%BA%202026.pdf',
    )
  })

  it('takes only documents the upload checks look into: no images, pages or scripts', () => {
    const types = Object.keys(fileTypes)
    expect(types).toContain('application/pdf')
    expect(types.some((type) => /image|html|svg|script|zip$/.test(type))).toBe(false)
    for (const type of types)
      expect(inspectFile(type, Buffer.from('<html></html>'))).toBe('fileType')
  })
})
