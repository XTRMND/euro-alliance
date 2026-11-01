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
  'exam-prep',
  'exams',
  'student',
  'teaching',
  'professional',
  'corporate',
  'computer',
  'farming',
  'translation',
] as const satisfies readonly StickerTopic[]
export type CourseTopic = (typeof courseTopics)[number]

/** The tabs over «Предстоящи курсове» on the homepage (48:231). */
export const upcomingFilters = ['all', 'students', 'adults', 'voucher', 'online'] as const
export type UpcomingFilter = (typeof upcomingFilters)[number]

type FilterableCourse = {
  audience?: CourseAudience | null
  format?: CourseFormat | null
  voucherEligible?: boolean | null
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
      return course.format === 'online'
  }
}
