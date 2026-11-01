import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { withHighlight } from '@/components/patterns/Highlight'

const html = (node: ReturnType<typeof withHighlight>) =>
  renderToStaticMarkup(<>{node}</>).replace(/ class="[^"]*"/g, '')

describe('withHighlight', () => {
  it('wraps the phrase and keeps the rest of the title', () => {
    expect(html(withHighlight('Езиково и професионално от 1999 г.', 'от 1999 г.'))).toBe(
      'Езиково и професионално <span>от 1999 г.</span>',
    )
  })

  it('highlights only the first occurrence: one phrase per headline', () => {
    expect(html(withHighlight('курс и курс', 'курс'))).toBe('<span>курс</span> и курс')
  })

  it('leaves the title alone without a phrase, or when the phrase is not in it', () => {
    expect(html(withHighlight('Заглавие', null))).toBe('Заглавие')
    expect(html(withHighlight('Заглавие', 'липсва'))).toBe('Заглавие')
  })
})
