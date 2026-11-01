import { describe, expect, it } from 'vitest'
import {
  audienceFromSegment,
  hasLanguagePage,
  languageFromSegment,
  otherAudience,
} from '@/lib/programs'

describe('language program URLs', () => {
  it('read the language and the audience from their segments', () => {
    expect(languageFromSegment('angliyski')).toBe('english')
    expect(languageFromSegment('balgarski')).toBe('bulgarian')
    expect(languageFromSegment('nyama')).toBeUndefined()
    expect(audienceFromSegment('vazrastni')).toBe('adults')
    expect(audienceFromSegment('uchenitsi')).toBe('students')
  })

  it('have no Russian page for adults', () => {
    expect(hasLanguagePage('russian', 'adults')).toBe(false)
    expect(otherAudience('russian', 'students')).toBeUndefined()
    expect(otherAudience('english', 'adults')).toBe('students')
  })
})
