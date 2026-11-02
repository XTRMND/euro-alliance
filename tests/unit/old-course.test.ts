import { describe, expect, it } from 'vitest'
import { parseOldPrice } from '../../scripts/import/old-course'

describe('the old site’s prices', () => {
  it('becomes an amount, its currency and the label before it', () => {
    expect(parseOldPrice('ПРОМОЦИЯ - 495 евро')).toEqual({
      price: 495,
      currency: 'EUR',
      priceLabel: 'Промоция',
    })
    expect(parseOldPrice('Базова цена 545 евро')).toEqual({
      price: 545,
      currency: 'EUR',
      priceLabel: 'Базова цена',
    })
    expect(parseOldPrice('стойност на ваучер 460,16 €')).toEqual({
      price: 460.16,
      currency: 'EUR',
      priceLabel: 'Стойност на ваучера',
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
