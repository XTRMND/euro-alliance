import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { submitInquiry } from '@/lib/inquiry-submit'
import { deleteExpiredInquiries, retentionCutoff } from '@/jobs/retention'
import { seed } from '@/seed'

// The contact wizard's server side against a real database: routing, private files, spam and
// retention (PR 11's done-when). Visitors here are obviously fake.

let payload: Payload
const started = Date.now() - 60_000
const visitor = {
  name: 'Тестов посетител',
  email: 'test@example.com',
  privacyAck: true,
  startedAt: started,
}
// The smallest PDF Payload accepts as one.
const pdf = {
  name: 'test.pdf',
  type: 'application/pdf',
  data: Buffer.from(
    [
      '%PDF-1.4',
      '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
      '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 10 10]>>endobj',
      'xref',
      '0 1',
      '0000000000 65535 f ',
      'trailer<</Root 1 0 R>>',
      'startxref',
      '0',
      '%%EOF',
    ].join('\n'),
  ),
}

beforeAll(async () => {
  payload = await getPayload({ config })
  await seed(payload)
})

afterAll(async () => {
  await payload.delete({
    collection: 'inquiries',
    where: { id: { exists: true } },
    overrideAccess: true,
  })
  await payload.destroy()
})

describe('submitting an inquiry', () => {
  it.each([
    ['courses', undefined, 'office@euro-alliance.net'],
    ['translations', 'plovdiv', 'prevod@euro-alliance.net'],
    ['translations', 'sofia', 'trans@euro-alliance.net'],
    ['farmers', undefined, 'office@euro-alliance.net'],
  ])('routes %s (%s) to %s', async (topic, office, inbox) => {
    const result = await submitInquiry(payload, { ...visitor, topic, office }, [])
    expect(result.ok).toBe(true)
    const inquiry = await payload.findByID({
      collection: 'inquiries',
      id: (result as { id: number }).id,
      overrideAccess: true,
    })
    expect([inquiry.routedTo, inquiry.emailStatus, inquiry.status]).toEqual([
      inbox,
      'pending',
      'new',
    ])
  })

  it('names the missing and invalid fields', async () => {
    const result = await submitInquiry(
      payload,
      { topic: 'translations', email: 'not-an-email', phone: 'call me', startedAt: started },
      [],
    )
    expect(result).toEqual({
      ok: false,
      errors: {
        office: 'required',
        name: 'required',
        email: 'email',
        phone: 'phone',
        privacyAck: 'privacy',
      },
    })
  })

  it('refuses a file whose content is not what its type says', async () => {
    const fake = { name: 'x.pdf', type: 'application/pdf', data: Buffer.from('<html>') }
    const result = await submitInquiry(
      payload,
      { ...visitor, topic: 'translations', office: 'sofia' },
      [fake],
    )
    expect(result).toEqual({ ok: false, errors: { files: 'fileType' } })
  })

  it('stores nothing for a bot, and answers as if it had', async () => {
    const before = (await payload.count({ collection: 'inquiries', overrideAccess: true }))
      .totalDocs
    const filled = await submitInquiry(payload, { ...visitor, topic: 'courses', website: 'x' }, [])
    const fast = await submitInquiry(
      payload,
      { ...visitor, topic: 'courses', startedAt: Date.now() },
      [],
    )
    expect([filled, fast]).toEqual([
      { ok: true, id: null },
      { ok: true, id: null },
    ])
    expect((await payload.count({ collection: 'inquiries', overrideAccess: true })).totalDocs).toBe(
      before,
    )
  })

  it('keeps the uploaded files away from anyone not logged in', async () => {
    const result = await submitInquiry(
      payload,
      { ...visitor, topic: 'translations', office: 'plovdiv' },
      [pdf],
    )
    const inquiry = await payload.findByID({
      collection: 'inquiries',
      id: (result as { id: number }).id,
      depth: 0,
      overrideAccess: true,
    })
    expect(inquiry.files).toHaveLength(1)

    await expect(
      payload.find({ collection: 'inquiry-files', overrideAccess: false }),
    ).rejects.toThrow()
    await expect(payload.find({ collection: 'inquiries', overrideAccess: false })).rejects.toThrow()
  })
})

describe('retention', () => {
  it('deletes inquiries older than a year unless they led to a contract', async () => {
    const make = async (status: 'new' | 'contract', createdAt: string) =>
      (
        await payload.create({
          collection: 'inquiries',
          data: { name: 'Тест', email: 'test@example.com', privacyAck: true, status, createdAt },
          overrideAccess: true,
        })
      ).id
    const old = new Date(new Date(retentionCutoff()).getTime() - 86_400_000).toISOString()
    const expired = await make('new', old)
    const contract = await make('contract', old)
    const recent = await make('new', new Date().toISOString())

    const run = deleteExpiredInquiries.handler as (args: unknown) => Promise<unknown>
    await run({
      input: {},
      req: { payload },
    })

    const left = (
      await payload.find({
        collection: 'inquiries',
        where: { id: { in: [expired, contract, recent] } },
        overrideAccess: true,
      })
    ).docs.map((inquiry) => inquiry.id)
    expect(left.sort()).toEqual([contract, recent].sort())
  })
})
