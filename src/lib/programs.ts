import {
  type Audience,
  audienceSegments,
  type Language,
  languages,
  languageSegments,
} from './routes'

// The language program URLs (/ezitsi/{language}/{audience}) back to their keys. Russian is taught
// to students only, so /ezitsi/ruski/vazrastni is no page.

export function languageFromSegment(segment: string): Language | undefined {
  return languages.find((language) => languageSegments[language] === segment)
}

export function audienceFromSegment(segment: string): Audience | undefined {
  return (Object.keys(audienceSegments) as Audience[]).find(
    (audience) => audienceSegments[audience] === segment,
  )
}

export function hasLanguagePage(language: Language, audience: Audience): boolean {
  return !(language === 'russian' && audience === 'adults')
}

/** The other audience's page for the Audience tabs, if it exists. */
export function otherAudience(language: Language, audience: Audience): Audience | undefined {
  const other: Audience = audience === 'adults' ? 'students' : 'adults'
  return hasLanguagePage(language, other) ? other : undefined
}
