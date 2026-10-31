import { describe, expect, it } from 'vitest'
import { slugify, transliterate } from '@/lib/slug'

describe('transliterate', () => {
  it('follows the official table letter by letter', () => {
    expect(transliterate('абвгдежзийклмнопрстуфхцчшщъьюя')).toBe(
      'abvgdezhziyklmnoprstufhtschshshtayyuya',
    )
  })

  it('lowercases capitals', () => {
    expect(transliterate('ЩЪРКЕЛ')).toBe('shtarkel')
  })

  it('writes «ия» at the end of a word as «ia»', () => {
    expect(transliterate('история')).toBe('istoria')
    expect(transliterate('София и Пловдив')).toBe('sofia i plovdiv')
  })

  it('keeps «ия» inside a word as «iya»', () => {
    expect(transliterate('Илиян')).toBe('iliyan')
  })

  it('writes България as Bulgaria, but not the words built on it', () => {
    expect(transliterate('България')).toBe('bulgaria')
    expect(transliterate('български')).toBe('balgarski')
  })

  it('reads ѝ as i', () => {
    expect(transliterate('ѝ')).toBe('i')
  })
})

describe('slugify', () => {
  it('joins words with hyphens', () => {
    expect(slugify('Професионално обучение')).toBe('profesionalno-obuchenie')
  })

  it('drops punctuation and quotation marks', () => {
    expect(slugify('Курс „Английски за възрастни“ – ниво B1!')).toBe(
      'kurs-angliyski-za-vazrastni-nivo-b1',
    )
  })

  it('keeps digits and Latin letters', () => {
    expect(slugify('ISO 9001:2015')).toBe('iso-9001-2015')
  })

  it('strips accents from Latin letters', () => {
    expect(slugify('Café Déjà')).toBe('cafe-deja')
  })

  it('trims and collapses separators', () => {
    expect(slugify('  —  Новини   и  проекти  —  ')).toBe('novini-i-proekti')
  })

  it('returns an empty string when nothing is left', () => {
    expect(slugify('„“ – !')).toBe('')
  })
})
