import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { routes } from '@/lib/routes'

// An imported news item's old address (src/hooks/legacy-redirect.ts) redirects to it only while
// it's published. Obviously fake: News/99999 never existed on the old site.

let payload: Payload
const legacyUrl = 'https://euro-alliance.net/News/99999/TEST-NOVINA'
const from = '/news/99999/test-novina'
let id: number | undefined

const redirect = async () =>
  (
    await payload.find({
      collection: 'redirects',
      where: { from: { equals: from } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]

beforeAll(async () => {
  payload = await getPayload({ config })
})

afterAll(async () => {
  if (id) await payload.delete({ collection: 'news', id })
  const left = await redirect()
  if (left) await payload.delete({ collection: 'redirects', id: left.id })
})

describe('an imported news item', () => {
  it('redirects its old address while published, and stops when unpublished or deleted', async () => {
    const news = await payload.create({
      collection: 'news',
      locale: 'bg',
      data: {
        title: 'Тестова новина от стария сайт',
        slug: 'testova-novina-ot-stariya-sayt',
        date: '2099-01-01T12:00:00.000Z',
        legacyUrl,
        _status: 'published',
      },
    })
    id = news.id
    expect((await redirect())?.to).toBe(routes.newsArticle('testova-novina-ot-stariya-sayt'))
    expect((await redirect())?.source).toBe('import')

    await payload.update({
      collection: 'news',
      id,
      locale: 'bg',
      data: { slug: 'testova-novina-nov-adres' },
    })
    expect((await redirect())?.to).toBe(routes.newsArticle('testova-novina-nov-adres'))

    await payload.update({ collection: 'news', id, locale: 'bg', data: { _status: 'draft' } })
    expect(await redirect()).toBeUndefined()

    await payload.update({ collection: 'news', id, locale: 'bg', data: { _status: 'published' } })
    expect(await redirect()).toBeDefined()

    await payload.delete({ collection: 'news', id })
    id = undefined
    expect(await redirect()).toBeUndefined()
  })
})
