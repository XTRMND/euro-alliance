// A ZIP archive made in memory for tests, its entries stored without compression. `unpacked`
// lets a test claim a size the entry doesn't have, as a decompression bomb's directory does.

type Entry = { name: string; data?: string; unpacked?: number }

export function zip(entries: Entry[], { comment = '' } = {}): Buffer {
  const locals: Buffer[] = []
  const central: Buffer[] = []
  let offset = 0
  for (const { name, data = '', unpacked } of entries) {
    const body = Buffer.from(data)
    const file = Buffer.from(name)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt32LE(body.length, 18)
    local.writeUInt32LE(unpacked ?? body.length, 22)
    local.writeUInt16LE(file.length, 26)
    locals.push(local, file, body)

    const record = Buffer.alloc(46)
    record.writeUInt32LE(0x02014b50, 0)
    record.writeUInt16LE(20, 4)
    record.writeUInt16LE(20, 6)
    record.writeUInt32LE(body.length, 20)
    record.writeUInt32LE(unpacked ?? body.length, 24)
    record.writeUInt16LE(file.length, 28)
    record.writeUInt32LE(offset, 42)
    central.push(record, file)
    offset += 30 + file.length + body.length
  }
  const directory = Buffer.concat(central)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(Buffer.byteLength(comment), 20)
  return Buffer.concat([...locals, directory, end, Buffer.from(comment)])
}

export const docxType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
export const odtType = 'application/vnd.oasis.opendocument.text'

export const docx = (extra: Entry[] = []) =>
  zip([
    { name: '[Content_Types].xml', data: '<Types/>' },
    { name: 'word/document.xml', data: '<w:document/>' },
    ...extra,
  ])

export const odt = (extra: Entry[] = []) =>
  zip([{ name: 'mimetype', data: odtType }, { name: 'content.xml', data: '<office/>' }, ...extra])

/** An old Office file: the container's signature, then the names of its streams as it writes them. */
export const oldOffice = (...streams: string[]) =>
  Buffer.concat([
    Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
    Buffer.alloc(504),
    ...streams.map((name) => Buffer.from(name, 'utf16le')),
  ])
