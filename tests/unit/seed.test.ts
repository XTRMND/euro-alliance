import type { Payload } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { same } from '../../scripts/seed/compare'
import { pendingMigrations } from '../../scripts/seed/migrations'
import { markAdminEdit } from '../../src/hooks/admin-edits'
import { noteSkipped, recording, Tally } from '../../src/seed/tally'

function fakePayload() {
  return {
    logger: { info: vi.fn() },
    find: vi.fn(async () => ({ docs: [{ id: 1, title: 'Test A' }] })),
    create: vi.fn(async (args: { data: object }) => ({ id: 7, ...args.data })),
    update: vi.fn(async (args: { id: number; data: object }) => ({ id: args.id, ...args.data })),
    updateGlobal: vi.fn(async (args: { data: object }) => args.data),
    delete: vi.fn(async (args: { id: number }) => ({ id: args.id })),
  }
}

describe('recording', () => {
  it('writes nothing in a dry run, and counts and lists what it would write', async () => {
    const real = fakePayload()
    const tally = new Tally(true)
    const payload = recording(real as unknown as Payload, tally)

    const created = await payload.create({
      collection: 'news',
      data: { title: 'Test A' } as never,
    })
    await payload.update({ collection: 'courses', id: 3, data: { title: 'Test B' } as never })
    await payload.updateGlobal({ slug: 'site', data: {} as never })
    await payload.delete({ collection: 'courses', id: 4 })
    const found = await payload.find({ collection: 'news' })

    expect(real.create).not.toHaveBeenCalled()
    expect(real.update).not.toHaveBeenCalled()
    expect(real.updateGlobal).not.toHaveBeenCalled()
    expect(real.delete).not.toHaveBeenCalled()
    expect(real.find).toHaveBeenCalledOnce()
    expect(found.docs).toHaveLength(1)
    expect(created.id).toBeLessThan(0)
    expect(tally.counts.get('news')).toMatchObject({ created: 1 })
    expect(tally.counts.get('courses')).toMatchObject({ updated: 1, deleted: 1 })
    expect(tally.counts.get('global:site')).toMatchObject({ updated: 1 })
    expect(tally.planned).toContain('create news «Test A»')
  })

  it('writes in a real run', async () => {
    const real = fakePayload()
    const tally = new Tally(false)
    const payload = recording(real as unknown as Payload, tally)

    await payload.create({ collection: 'news', data: { title: 'Test A' } as never })

    expect(real.create).toHaveBeenCalledTimes(1)
    expect(tally.counts.get('news')).toMatchObject({ created: 1 })
  })

  it('counts what the base seed leaves alone, and does nothing without a tally', () => {
    const tally = new Tally(false)
    const payload = recording(fakePayload() as unknown as Payload, tally)
    noteSkipped(payload, 'offices', 3)
    noteSkipped(fakePayload() as unknown as Payload, 'offices')
    expect(tally.counts.get('offices')).toMatchObject({ skipped: 3 })
  })
})

describe('same', () => {
  it('ignores keys the fixture leaves out, such as row ids', () => {
    expect(same([{ label: 'Test' }], [{ id: 'abc', label: 'Test', seats: null }])).toBe(true)
    expect(same({ a: 1 }, { a: 1, b: 2 })).toBe(true)
  })

  it('treats null, empty and missing values alike', () => {
    expect(same(null, undefined)).toBe(true)
    expect(same('', null)).toBe(true)
    expect(same([], undefined)).toBe(true)
    expect(same(null, 'Test')).toBe(false)
  })

  it('sees a changed value, a changed order or a different length', () => {
    expect(same({ title: 'Test A' }, { title: 'Test B' })).toBe(false)
    expect(same(['a', 'b'], ['b', 'a'])).toBe(false)
    expect(same([1], [1, 2])).toBe(false)
    expect(same(460.16, '460.16')).toBe(true)
  })
})

describe('markAdminEdit', () => {
  const run = (user: object | null) =>
    markAdminEdit({
      data: { title: 'Test A' },
      req: { user },
    } as unknown as Parameters<typeof markAdminEdit>[0]) as Record<string, unknown>

  it('dates a change a signed-in person makes', () => {
    expect(run({ id: 1 }).adminEditedAt).toEqual(expect.any(String))
  })

  it('leaves the seed’s own writes (no user) unmarked', () => {
    expect(run(null)).toEqual({ title: 'Test A' })
  })
})

describe('pendingMigrations', () => {
  const names = ['20261101_a', '20261109_b']

  it('lists the migrations the database hasn’t applied, in order', async () => {
    const payload = { find: vi.fn(async () => ({ docs: [{ name: '20261101_a' }] })) }
    expect(await pendingMigrations(payload as unknown as Payload, names)).toEqual(['20261109_b'])
  })

  it('lists them all on an empty database (no migrations table)', async () => {
    const payload = { find: vi.fn(async () => Promise.reject(new Error('no table'))) }
    expect(await pendingMigrations(payload as unknown as Payload, names)).toEqual(names)
  })
})
