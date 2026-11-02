import { describe, expect, it } from 'vitest'
import { cleanCourseTitle, parseOldLevel, parseOldPrice } from '../../scripts/import/old-course'

describe('the old site’s prices', () => {
  it('becomes an amount, its currency and the label before it', () => {
    expect(parseOldPrice('ПРОМОЦИЯ - 495 евро')).toEqual({
      price: 495,
      currency: 'EUR',
      priceLabel: 'промоция',
    })
    expect(parseOldPrice('Базова цена 545 евро')).toEqual({
      price: 545,
      currency: 'EUR',
      priceLabel: 'базова цена',
    })
    expect(parseOldPrice('стойност на ваучер 460,16 €')).toEqual({
      price: 460.16,
      currency: 'EUR',
      priceLabel: 'стойност на ваучера',
    })
    expect(parseOldPrice('660 евро')).toEqual({ price: 660, currency: 'EUR' })
  })

  it('keeps лв. as лв., never converted', () => {
    expect(parseOldPrice('580 лв.')).toEqual({ price: 580, currency: 'BGN' })
    expect(parseOldPrice('стойност на ваучер 900 лв.')).toMatchObject({
      price: 900,
      currency: 'BGN',
    })
  })

  it('has no price for «ask» or nothing', () => {
    expect(parseOldPrice('ask')).toBeNull()
    expect(parseOldPrice('')).toBeNull()
    expect(parseOldPrice(undefined)).toBeNull()
  })
})

describe('the old site’s levels', () => {
  it('reads Cyrillic look-alikes as Latin and spans as ranges, with НИВО', () => {
    expect(parseOldLevel('B2 Upper-Intermediate')).toEqual({
      level: 'B2',
      levelUnit: 'level',
      levelName: 'B2 Upper-Intermediate',
    })
    expect(parseOldLevel('В1')).toMatchObject({ level: 'B1', levelUnit: 'level' })
    expect(parseOldLevel('А1 A2 B1')).toMatchObject({ level: 'A1–B1', levelName: 'A1 A2 B1' })
    expect(parseOldLevel('Р2, Р3, Р4, S1, S2 (от 2-ри до 7-ми клас)')).toMatchObject({
      level: 'P2–S2',
      levelUnit: 'level',
    })
    expect(parseOldLevel('Р2, Р3, Р4, S1, S2, S3, B2 и С1 (от 2-ри до 12-ти клас)')).toMatchObject({
      level: 'P2–C1',
    })
  })

  it('reads school years as КЛАС', () => {
    expect(parseOldLevel('11-12 клас')).toMatchObject({ level: '11–12', levelUnit: 'grade' })
    expect(parseOldLevel('6-ти и 7-ми клас')).toMatchObject({ level: '6–7', levelUnit: 'grade' })
  })

  it('has no level when nothing can be read', () => {
    expect(parseOldLevel('')).toBeNull()
    expect(parseOldLevel('по договаряне')).toBeNull()
  })
})

describe('the old site’s course titles', () => {
  it('drop the audience and format words the tags show, with the level as a range', () => {
    expect(cleanCourseTitle('Английски език В2 Възрастни ОНЛАЙН')).toBe('Английски език B2')
    expect(cleanCourseTitle('Английски език ниво А1 А2 В1 С ВАУЧЕРИ ОТ АЗ')).toBe(
      'Английски език A1–B1',
    )
    expect(cleanCourseTitle('СЪБОТНИ ГРУПИ УЧЕНИЦИ')).toBe('Съботни групи')
    expect(cleanCourseTitle('ПОДГОТОВКА по БЕЛ за ДЗИ')).toBe('Подготовка по БЕЛ за ДЗИ')
    expect(
      cleanCourseTitle(
        'СЕДМИЧНИ ВЕЧЕРНИ ГРУПИ УЧЕНИЦИ от нива Р2, Р3, Р4, S1, S2 (от 2-ри до 7-ми клас)',
      ),
    ).toBe('Седмични вечерни групи от нива P2–S2 (от 2-ри до 7-ми клас)')
    expect(cleanCourseTitle('Английски език Летен интензивен курс В1')).toBe(
      'Английски език Летен интензивен курс B1',
    )
    expect(
      cleanCourseTitle('СЕДМИЧНИ ДНЕВНИ ГРУПИ УЧЕНИЦИ от нива S1 и S2 (от 5-ти до 7-ми клас)'),
    ).toBe('Седмични дневни групи от нива S1–S2 (от 5-ти до 7-ми клас)')
    expect(cleanCourseTitle('Педагогически специалисти')).toBe('Педагогически специалисти')
  })
})
