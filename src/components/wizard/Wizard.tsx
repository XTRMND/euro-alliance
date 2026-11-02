import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { Sticker } from '@/components/visuals/Sticker'
import { getListedCourses, getTranslationLanguages } from '@/lib/cms'
import { emptyCourseFilters } from '@/lib/course-filters'
import { currentGroups } from '@/lib/course-state'
import { courseTags } from '@/lib/courses'
import { startOfTodayInSofia } from '@/lib/format'
import type { InquiryTopic } from '@/lib/inquiries'
import { languages, routes } from '@/lib/routes'
import type { Course } from '@/payload-types'
import { ContactWizard, type WizardCourse } from './ContactWizard'

// The contact wizard with its data: the listed courses, the translation languages and the
// stickers of Step 1 (as in 100:260). Only the wizard's own strings go to the browser.

const stickerOf: Record<InquiryTopic | 'done', Parameters<typeof Sticker>[0]['topic']> = {
  course: 'student',
  voucher: 'corporate',
  translation: 'translation',
  levelTest: 'exams',
  corporate: 'professional',
  other: 'contact',
  done: 'student',
}

type WizardProps = {
  initialTopic?: InquiryTopic
  /** A course to preselect, even if it isn't listed any more (its own page). */
  initialCourse?: Course
  initialPair?: { from?: string; to?: string }
  sourcePage: string
  headingLevel?: 'h2' | 'h3'
  className?: string
}

export async function Wizard({
  initialTopic,
  initialCourse,
  initialPair,
  sourcePage,
  headingLevel,
  className,
}: WizardProps) {
  const [{ docs }, translationLanguages, messages, t] = await Promise.all([
    getListedCourses({ ...emptyCourseFilters, shown: 180 }),
    getTranslationLanguages(),
    getMessages(),
    getTranslations(),
  ])
  const listed =
    initialCourse && !docs.some((c) => c.id === initialCourse.id) ? [initialCourse, ...docs] : docs

  const lower = (text: string) => text.charAt(0).toLocaleLowerCase('bg') + text.slice(1)
  const courses: WizardCourse[] = listed.flatMap((course) =>
    course.slug
      ? [
          {
            slug: course.slug,
            label: [
              course.title,
              ...courseTags(course, {
                audience: {
                  students: t('courses.audience.students'),
                  adults: t('courses.audience.adults'),
                  companies: t('courses.audience.companies'),
                },
                format: {
                  'in-person': t('courses.format.inPerson'),
                  online: t('courses.format.online'),
                },
                voucher: t('courses.voucher'),
              }).map(lower),
            ].join(', '),
            // «Удобен график»: the course's upcoming and running groups.
            schedules: currentGroups(course, startOfTodayInSofia())
              .map(({ group }) =>
                [group.label, [group.days, group.hours].filter(Boolean).join(' ')]
                  .filter(Boolean)
                  .join(': '),
              )
              .filter(Boolean),
            entryLevel: course.entryLevel,
            askLevel: course.category === 'languages' || course.category === 'exams',
            voucher: Boolean(course.voucherEligible),
          },
        ]
      : [],
  )

  return (
    <NextIntlClientProvider
      messages={{ wizard: messages.wizard, sendDocument: messages.sendDocument }}
    >
      <ContactWizard
        initialTopic={initialTopic}
        initialCourse={initialCourse?.slug ?? undefined}
        initialPair={initialPair}
        courses={courses}
        translationLanguages={translationLanguages}
        testLanguages={languages.map((language) => t(`languages.${language}`))}
        stickers={
          Object.fromEntries(
            Object.entries(stickerOf).map(([key, topic]) => [
              key,
              <Sticker key={key} topic={topic} sizes="120px" />,
            ]),
          ) as Record<InquiryTopic | 'done', React.ReactNode>
        }
        privacyHref={routes.privacy()}
        doneHref={{ courses: routes.courses(), home: routes.home() }}
        sourcePage={sourcePage}
        headingLevel={headingLevel}
        className={className}
      />
    </NextIntlClientProvider>
  )
}
