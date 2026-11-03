import config from '@payload-config'
import { createLocalReq, getPayload, registerFirstUserOperation, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Users } from '@/collections/Users'
import type { User } from '@/payload-types'
import { seed } from '@/seed'

let payload: Payload
let admin: User
let editor: User
let otherEditor: User

const asUser = (user: User) => ({ overrideAccess: false, user })
const anonymous = { overrideAccess: false }

beforeAll(async () => {
  payload = await getPayload({ config })
  await seed(payload)
  const { totalDocs } = await payload.count({ collection: 'users' })
  expect(totalDocs).toBe(0)

  // Through /admin/create-first-user's operation. The role is hidden there and defaults to
  // «editor»; the first account becomes the admin regardless.
  await registerFirstUserOperation({
    collection: payload.collections.users,
    data: { email: 'admin@test.invalid', password: 'test-password-1', role: 'editor' },
    req: await createLocalReq({}, payload),
  })
  const { docs } = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@test.invalid' } },
  })
  admin = docs[0]
  editor = await payload.create({
    collection: 'users',
    data: { email: 'editor@test.invalid', password: 'test-password-2', role: 'editor' },
    ...asUser(admin),
  })
  otherEditor = await payload.create({
    collection: 'users',
    data: { email: 'other@test.invalid', password: 'test-password-3', role: 'editor' },
    ...asUser(admin),
  })
})

afterAll(() => payload.destroy())

describe('users', () => {
  it('makes the first account the admin', () => {
    expect(admin.role).toBe('admin')
    expect(editor.role).toBe('editor')
  })

  it('hides the role only where nobody is logged in', () => {
    const row = Users.fields.find(
      (f) => f.type === 'row' && f.fields.some((sub) => 'name' in sub && sub.name === 'role'),
    )
    const shows = (user: User | null) =>
      row?.admin?.condition?.({}, {}, { blockData: {}, operation: 'create', path: [], user })

    expect([shows(null), shows(admin), shows(editor)]).toEqual([false, true, true])
  })

  it('lets the admin set roles', async () => {
    const created = await payload.create({
      collection: 'users',
      data: { email: 'second-admin@test.invalid', password: 'test-password-5', role: 'admin' },
      ...asUser(admin),
    })
    const updated = await payload.update({
      collection: 'users',
      id: created.id,
      data: { role: 'editor' },
      ...asUser(admin),
    })

    expect([created.role, updated.role]).toEqual(['admin', 'editor'])
  })

  it('shows editors only their own account', async () => {
    const { docs } = await payload.find({ collection: 'users', ...asUser(editor) })

    expect(docs.map((u) => u.email)).toEqual(['editor@test.invalid'])
  })

  it('stops editors from changing roles or other accounts', async () => {
    const self = await payload.update({
      collection: 'users',
      id: editor.id,
      data: { role: 'admin', name: 'Editor' },
      ...asUser(editor),
    })
    expect([self.role, self.name]).toEqual(['editor', 'Editor'])

    await expect(
      payload.update({
        collection: 'users',
        id: otherEditor.id,
        data: { name: 'Hijacked' },
        ...asUser(editor),
      }),
    ).rejects.toThrow()
  })

  it('stops editors from creating accounts', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: { email: 'new@test.invalid', password: 'test-password-4', role: 'editor' },
        ...asUser(editor),
      }),
    ).rejects.toThrow()
  })

  it('hides every account from the public', async () => {
    await expect(payload.find({ collection: 'users', ...anonymous })).rejects.toThrow()
  })
})

describe('offices', () => {
  it('are readable by the public but not editable', async () => {
    const { docs } = await payload.find({ collection: 'offices', ...anonymous })
    expect(docs).toHaveLength(3)

    await expect(
      payload.update({ collection: 'offices', id: docs[0].id, data: { name: 'X' }, ...anonymous }),
    ).rejects.toThrow()
  })

  it('let editors edit everything but the inquiry role', async () => {
    const { docs } = await payload.find({
      collection: 'offices',
      where: { role: { equals: 'courses' } },
    })

    const updated = await payload.update({
      collection: 'offices',
      id: docs[0].id,
      data: { department: 'Test', role: 'translations-sofia' },
      ...asUser(editor),
    })

    expect([updated.department, updated.role]).toEqual(['Test', 'courses'])
  })
})

describe('site', () => {
  it('is readable by the public and editable by editors only', async () => {
    const site = await payload.findGlobal({ slug: 'site', ...anonymous })
    expect(site.companyId).toBe('115302753')

    await expect(
      payload.updateGlobal({
        slug: 'site',
        data: { facebook: 'https://example.com/x' },
        ...anonymous,
      }),
    ).rejects.toThrow()
    const updated = await payload.updateGlobal({
      slug: 'site',
      data: { facebook: 'https://example.com/test' },
      ...asUser(editor),
    })
    expect(updated.facebook).toBe('https://example.com/test')
  })
})

describe('courses and news', () => {
  it('show the public published documents only, and fill in the slug', async () => {
    const draft = await payload.create({
      collection: 'courses',
      locale: 'bg',
      data: { title: 'Тестов курс А', category: 'languages', topic: 'english', _status: 'draft' },
      ...asUser(editor),
    })
    const published = await payload.create({
      collection: 'news',
      locale: 'bg',
      data: { title: 'Тестова новина А', date: '2026-01-01T12:00:00.000Z', _status: 'published' },
      ...asUser(editor),
    })

    expect(draft.slug).toBe('testov-kurs-a')
    expect(published.slug).toBe('testova-novina-a')
    expect((await payload.find({ collection: 'courses', ...anonymous })).totalDocs).toBe(0)
    expect(
      (await payload.find({ collection: 'news', ...anonymous })).docs.map((n) => n.id),
    ).toEqual([published.id])
    await expect(
      payload.create({
        collection: 'news',
        data: { title: 'X', date: '2026-01-01T12:00:00.000Z' },
        ...anonymous,
      }),
    ).rejects.toThrow()
  })
})

describe('home', () => {
  it('rejects a highlight that is not part of the heading', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'home',
        locale: 'bg',
        data: { hero: { heading: 'Заглавие', highlight: 'друго' } },
        ...asUser(editor),
      }),
    ).rejects.toThrow()
  })
})
