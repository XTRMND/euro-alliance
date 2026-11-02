import type { StickerTopic } from '@/components/visuals/Sticker'

// Option values of the Courses collection (docs/cms-schema.md § 3), shared by the collection and
// the site. Values are stored; labels on the site come from messages/*.json (courses.*), labels in
// the admin from the collection. The groups follow the Courses filters (116:1190).

export const courseAudiences = ['students', 'adults', 'companies'] as const
export type CourseAudience = (typeof courseAudiences)[number]

export const courseFormats = ['in-person', 'online'] as const
export type CourseFormat = (typeof courseFormats)[number]

export const courseCategoryValues = [
  'languages',
  'exams',
  'vocational',
  'vouchers',
  'teachers',
  'farmers',
  'computer',
] as const
export type CourseCategoryValue = (typeof courseCategoryValues)[number]

/** The stickers a course can show (Course sticker set 50:274, without the hero and contact art). */
export const courseTopics = [
  'english',
  'german',
  'french',
  'italian',
  'spanish',
  'russian',
  'bulgarian',
  'exam-prep',
  'exams',
  'student',
  'teaching',
  'professional',
  'corporate',
  'computer',
  'farming',
  'translation',
  // One per ЦПО profession and computer course (the user, 02.11.2026).
  'accounting',
  'customs',
  'banking',
  'management',
  'small-business',
  'office',
  'sales',
  'marketing',
  'business-it',
  'security',
  'hotel',
  'cooking',
  'catering',
  'tour-guide',
  'travel',
  'animation',
  'plant-protection',
  'floristry',
  'real-estate',
  'hardware-and-networks',
  'word-processing',
  'spreadsheets',
  'presentations',
  'internet-and-email',
  'databases',
  'web-and-graphic-design',
  'specialised-software',
] as const satisfies readonly StickerTopic[]
export type CourseTopic = (typeof courseTopics)[number]

/** The tabs over «Предстоящи курсове» on the homepage (48:231). */
export const upcomingFilters = ['all', 'students', 'adults', 'voucher', 'online'] as const
export type UpcomingFilter = (typeof upcomingFilters)[number]

type FilterableCourse = {
  audience?: CourseAudience | null
  format?: CourseFormat | null
  voucherEligible?: boolean | null
  groups?: { format?: CourseFormat | null }[] | null
}

export function matchesUpcomingFilter(course: FilterableCourse, filter: UpcomingFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'students':
    case 'adults':
      return course.audience === filter
    case 'voucher':
      return Boolean(course.voucherEligible)
    case 'online':
      return (
        course.format === 'online' ||
        (course.groups ?? []).some((group) => group.format === 'online')
      )
  }
}

type TaggedCourse = FilterableCourse & {
  language?: string | null
  audienceNote?: string | null
  cardTag?: string | null
}

export type CourseTagLabels = {
  audience: Record<CourseAudience, string>
  format: Record<CourseFormat, string>
  voucher: string
  /** «За чужденци»: Bulgarian for adults (the Bulgarian page's second tab). */
  foreigners?: string
}

/**
 * The tags above a course card's title («Възрастни • Онлайн»): the audience with its note, then
 * the card tag if set, else «С ваучер» for a voucher course, else the format.
 */
export function courseTags(course: TaggedCourse, labels: CourseTagLabels): string[] {
  const audienceLabel =
    course.language === 'bulgarian' && course.audience === 'adults' && labels.foreigners
      ? labels.foreigners
      : course.audience && labels.audience[course.audience]
  const audience = audienceLabel
    ? [audienceLabel, course.audienceNote].filter(Boolean).join(' ')
    : undefined
  const second =
    course.cardTag ||
    (course.voucherEligible ? labels.voucher : course.format && labels.format[course.format])
  return [audience, second].filter((tag): tag is string => Boolean(tag))
}
