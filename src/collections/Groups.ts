import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
  CollectionConfig,
  Where,
} from 'payload'
import { isStaff } from '@/access'
import { adminEditedAtField, markAdminEdit } from '@/hooks/admin-edits'
import { legacyGroupRedirect } from '@/hooks/legacy-redirect'
import { revalidateCollection, revalidateCourses } from '@/hooks/revalidate'
import { courseFormats } from '@/lib/courses'
import { formatDateLong } from '@/lib/format'

// docs/admin-redesign.md, decision 5: a course's dates are its groups, each its own record (they
// were an array on the course until v0.3.0). A group has a start and an optional end, a schedule,
// a format, an office and seats (its price is a record of the prices collection); the state of a
// course comes from its groups
// (src/lib/course-state.ts). The course edit screen lists them in its «Групи» tab (a join field).

const formatLabels = { 'in-person': 'Присъствено', online: 'Онлайн' }
const dayOnly = { date: { pickerAppearance: 'dayOnly' as const, displayFormat: 'dd.MM.yyyy' } }

/** The site reads the groups of published courses only; staff see them all. */
const groupsOfPublishedOrStaff: Access = ({ req }) =>
  req.user ? true : ({ 'course._status': { equals: 'published' } } satisfies Where)

/**
 * The group's name in the admin, wherever it's listed or picked: its start date and days, then its
 * name when it has one («4 октомври 2026 · събота · Съботни групи», as in Figma 367:664: two groups of a course can share a
 * start and days). Never «Item 01».
 */
export function groupTitle(group: {
  start?: string | null
  days?: string | null
  name?: string | null
}): string {
  return [group.start ? formatDateLong(group.start) : null, group.days, group.name]
    .filter(Boolean)
    .join(' · ')
}

const setTitle: CollectionBeforeChangeHook = ({ data, originalDoc }) => ({
  ...data,
  title: groupTitle({ ...originalDoc, ...data }),
})

/** A group's own price goes with it. */
const deletePrice: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.delete({ collection: 'prices', where: { group: { equals: id } }, req })
}

export const Groups: CollectionConfig = {
  slug: 'groups',
  labels: { singular: 'Група', plural: 'Групи' },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'start', 'end', 'seats'],
    description:
      'Датите на курса. Без група курсът е «Няма насрочена дата». Започнала група без край е «В ход», докато не ѝ се зададе край.',
  },
  defaultSort: 'start',
  access: { read: groupsOfPublishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeChange: [markAdminEdit, setTitle],
    beforeDelete: [deletePrice],
    afterChange: [revalidateCollection, revalidateCourses, legacyGroupRedirect.afterChange],
    afterDelete: [revalidateCollection, revalidateCourses, legacyGroupRedirect.afterDelete],
  },
  fields: [
    adminEditedAtField,
    {
      name: 'title',
      type: 'text',
      label: 'Група',
      localized: true,
      admin: { hidden: true },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      label: 'Курс',
      required: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      label: 'Име на групата',
      localized: true,
      admin: { description: 'По желание, например «Съботни групи».' },
    },
    {
      type: 'row',
      fields: [
        { name: 'start', type: 'date', label: 'Начало', required: true, admin: dayOnly },
        { name: 'end', type: 'date', label: 'Край', admin: dayOnly },
        { name: 'seats', type: 'number', label: 'Свободни места', min: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'days',
          type: 'text',
          label: 'Учебни дни',
          localized: true,
          admin: { description: 'Например «пн и ср или вт и чт».' },
        },
        {
          name: 'hours',
          type: 'text',
          label: 'Учебни часове',
          admin: { description: 'Например 18:00–20:50.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'format',
          type: 'select',
          label: 'Формат',
          options: courseFormats.map((value) => ({ value, label: formatLabels[value] })),
        },
        { name: 'office', type: 'relationship', relationTo: 'offices', label: 'Офис' },
      ],
    },
    {
      name: 'legacyUrl',
      type: 'text',
      label: 'Стар адрес',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'От стария сайт: пренасочва към страницата на курса.',
      },
    },
  ],
}
