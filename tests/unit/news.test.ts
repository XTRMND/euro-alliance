import { describe, expect, it } from 'vitest'
import {
  headingIds,
  newsAround,
  newsOutline,
  newsPage,
  newsPageCount,
  readingMinutes,
} from '@/lib/news'

const items = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }))

describe('news listing pages', () => {
  it('shows the lead story and six on page 1, then six a page', () => {
    expect(newsPageCount(0)).toBe(1)
    expect(newsPageCount(7)).toBe(1)
    expect(newsPageCount(8)).toBe(2)
    expect(newsPageCount(13)).toBe(2)
    expect(newsPageCount(14)).toBe(3)

    const first = newsPage(items, 1)
    expect(first.feature).toEqual({ id: 1 })
    expect(first.grid.map((item) => item.id)).toEqual([2, 3, 4, 5, 6, 7])
    const second = newsPage(items, 2)
    expect(second.feature).toBeNull()
    expect(second.grid.map((item) => item.id)).toEqual([8, 9, 10, 11, 12, 13])
    expect(newsPage([], 1)).toEqual({ feature: null, grid: [] })
  })
})

describe('article outline', () => {
  const heading = (text: string, tag = 'h2') => ({
    type: 'heading',
    tag,
    children: [{ type: 'text', text }],
  })

  it('lists the H2s with ids from their text, numbering repeats', () => {
    const body = {
      root: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'Текст' }] },
          heading('Онлайн платформа'),
          heading('Подробности', 'h3'),
          heading('Онлайн платформа'),
        ],
      },
    }
    expect(newsOutline(body)).toEqual([
      { id: 'onlayn-platforma', text: 'Онлайн платформа' },
      { id: 'onlayn-platforma-2', text: 'Онлайн платформа' },
    ])
    expect(newsOutline(null)).toEqual([])
    expect(headingIds(['!', '!'])).toEqual(['razdel', 'razdel-2'])
  })

  it('reads at 200 words a minute, at least one', () => {
    expect(readingMinutes('дума '.repeat(10))).toBe(1)
    expect(readingMinutes('дума '.repeat(201), null)).toBe(2)
    expect(readingMinutes('')).toBe(1)
  })
})

describe('news around an article', () => {
  it('shows the latest without the article, and related then older ones under it', () => {
    const current = items[4]
    const { latest, more } = newsAround(items, current, [items[15]])
    expect(latest.map((item) => item.id)).toEqual([1, 2, 3])
    expect(more.map((item) => item.id)).toEqual([16, 6, 7])
  })

  it('fills with newer ones for the oldest article and never repeats one', () => {
    const current = items[19]
    const { more } = newsAround(items, current, [items[0], items[0]])
    expect(more.map((item) => item.id)).toEqual([1, 2, 3])
  })
})
