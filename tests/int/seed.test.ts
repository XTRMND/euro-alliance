import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { seed } from '@/seed'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
  await seed(payload)
})

afterAll(() => payload.destroy())

describe('seed', () => {
  it('fills in the company facts', async () => {
    const site = await payload.findGlobal({ slug: 'site', locale: 'bg' })

    expect(site.legalName).toBe('ЕВРО-АЛИАНС ООД')
    expect(site.companyId).toBe('115302753')
    expect(site.licence?.number).toBe('200312088')
    expect(site.bank?.iban).toBe('BG58 IORT 8129 1003 0255 00')
  })

  it('creates the three offices, published', async () => {
    const { docs } = await payload.find({ collection: 'offices', sort: 'id', locale: 'bg' })

    expect(docs.map((o) => [o.role, o.emails?.[0]?.email, o._status])).toEqual([
      ['courses', 'office@euro-alliance.net', 'published'],
      ['translations-plovdiv', 'prevod@euro-alliance.net', 'published'],
      ['translations-sofia', 'trans@euro-alliance.net', 'published'],
    ])
  })

  it('never duplicates or overwrites', async () => {
    const { docs } = await payload.find({ collection: 'offices', sort: 'id', limit: 1 })
    await payload.update({ collection: 'offices', id: docs[0].id, data: { name: 'Edited' } })

    await seed(payload)

    const after = await payload.find({ collection: 'offices', sort: 'id' })
    expect(after.totalDocs).toBe(3)
    expect(after.docs[0].name).toBe('Edited')
  })
})
