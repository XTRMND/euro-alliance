import { describe, expect, it } from 'vitest'
import { pageWindow } from '@/lib/pagination'

describe('the news pagination', () => {
  it('shows every page when there are few', () => {
    expect(pageWindow(1, 1)).toEqual([1])
    expect(pageWindow(2, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('leaves out the pages far from the current one', () => {
    expect(pageWindow(1, 34)).toEqual([1, 2, 3, 4, 5, 'gap', 34])
    expect(pageWindow(10, 34)).toEqual([1, 'gap', 9, 10, 11, 'gap', 34])
    expect(pageWindow(34, 34)).toEqual([1, 'gap', 30, 31, 32, 33, 34])
  })

  it('never hides a single page behind a gap', () => {
    expect(pageWindow(4, 34)).toEqual([1, 2, 3, 4, 5, 'gap', 34])
    expect(pageWindow(5, 34)).toEqual([1, 'gap', 4, 5, 6, 'gap', 34])
  })
})
