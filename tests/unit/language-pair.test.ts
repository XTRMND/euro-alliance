import { describe, expect, it } from 'vitest'
import { initialPair, pickLanguage } from '@/components/wizard/LanguagePair'

const languages = ['Home', 'Second', 'Third']

describe('initialPair', () => {
  it('starts from the centre’s own language', () => {
    expect(initialPair(languages)).toEqual({ from: 'Home', to: '' })
  })

  it('keeps a pair given by a link', () => {
    expect(initialPair(languages, { from: 'Second', to: 'Third' })).toEqual({
      from: 'Second',
      to: 'Third',
    })
  })

  it('fills the side a link left open with the centre’s language', () => {
    expect(initialPair(languages, { from: 'Second' })).toEqual({ from: 'Second', to: 'Home' })
    expect(initialPair(languages, { to: 'Third' })).toEqual({ from: 'Home', to: 'Third' })
    expect(initialPair(languages, { to: 'Home' })).toEqual({ from: '', to: 'Home' })
  })

  it('ignores languages that aren’t offered, and a pair of the same language', () => {
    expect(initialPair(languages, { from: 'Unknown' })).toEqual({ from: 'Home', to: '' })
    expect(initialPair(languages, { from: 'Second', to: 'Second' })).toEqual({
      from: 'Second',
      to: '',
    })
  })
})

describe('pickLanguage', () => {
  it('sets one side', () => {
    expect(pickLanguage({ from: 'Home', to: '' }, 'to', 'Second', 'Home')).toEqual({
      from: 'Home',
      to: 'Second',
    })
  })

  it('swaps when the other side has that language', () => {
    expect(pickLanguage({ from: 'Home', to: 'Second' }, 'from', 'Second', 'Home')).toEqual({
      from: 'Second',
      to: 'Home',
    })
  })

  it('fills an empty other side with the centre’s language', () => {
    expect(pickLanguage({ from: '', to: '' }, 'from', 'Third', 'Home')).toEqual({
      from: 'Third',
      to: 'Home',
    })
  })
})
