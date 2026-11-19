import { describe, expect, it } from 'vitest'
import { figureText, longestPart } from '@/components/patterns/FigureCard'
import { figureColumns } from '@/components/patterns/FigureGrid'

describe('figureText', () => {
  it('keeps a number’s thousands on one line', () => {
    expect(figureText('над 40 000')).toBe('над 40 000')
    expect(figureText('808 140')).toBe('808 140')
  })

  it('leaves the spaces between words', () => {
    expect(figureText('Test words')).toBe('Test words')
  })
})

describe('longestPart', () => {
  it('counts the longest part that can’t wrap', () => {
    expect(longestPart('2010-2016')).toBe(9)
    expect(longestPart('Test words')).toBe(5)
    expect(longestPart(figureText('над 40 000'))).toBe(6)
  })

  it('is never zero', () => {
    expect(longestPart('')).toBe(1)
  })
})

describe('figureColumns', () => {
  it('puts up to five cards in one row', () => {
    expect([1, 2, 3, 4, 5].map(figureColumns)).toEqual([1, 2, 3, 4, 5])
  })

  it('evens out the rows of more than five', () => {
    expect([6, 7, 8, 9, 10, 11].map(figureColumns)).toEqual([3, 4, 4, 5, 5, 4])
  })
})
