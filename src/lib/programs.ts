import { type CourseFilters, emptyCourseFilters } from './course-filters'
import { hrefOf } from './destinations'
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

type ProgramType = 'language' | 'vocational' | 'vouchers' | 'teachers' | 'farmers' | 'computer'

/**
 * The courses a program page lists under «Предстоящи курсове»: a language page its language and
 * audience, the vouchers page the courses payable with a voucher, every other page its category.
 */
export function programCourseFilters(program: {
  type: ProgramType
  language?: Language | null
  audience?: Audience | null
}): CourseFilters {
  const filters = { ...emptyCourseFilters }
  switch (program.type) {
    case 'language':
      return {
        ...filters,
        language: program.language ? [program.language] : [],
        audience: program.audience ? [program.audience] : [],
      }
    case 'vouchers':
      return { ...filters, voucher: true }
    default:
      return { ...filters, category: [program.type] }
  }
}

/** The id of a program page's «Предстоящи курсове». */
export const upcomingId = 'predstoyashti-kursove'

/**
 * Where a hero button goes: a section of the page (its anchor), a fixed destination, or for
 * «Курсове: езици» the page's own upcoming courses when they show, else the filtered listing.
 */
export function programCtaHref(
  cta: { destination?: string | null; anchor?: string | null },
  upcoming: { shown: boolean; listing: string },
): string | undefined {
  if (cta.anchor) return `#${cta.anchor}`
  if (cta.destination === 'languageCourses') {
    return upcoming.shown ? `#${upcomingId}` : upcoming.listing
  }
  return hrefOf(cta.destination)
}

/**
 * The ЦПО professions grouped into their directions' cards, in the list's order: a direction
 * comes where its first profession is.
 */
export function groupByDirection<P extends { directionCode: string; directionName: string }>(
  professions: P[],
): { code: string; name: string; professions: P[] }[] {
  const directions = new Map<string, { code: string; name: string; professions: P[] }>()
  for (const profession of professions) {
    const direction = directions.get(profession.directionCode) ?? {
      code: profession.directionCode,
      name: profession.directionName,
      professions: [],
    }
    direction.professions.push(profession)
    directions.set(profession.directionCode, direction)
  }
  return [...directions.values()]
}
