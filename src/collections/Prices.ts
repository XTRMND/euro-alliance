import type { Access, CollectionBeforeValidateHook, CollectionConfig, Where } from 'payload'
import { ValidationError } from 'payload'
import { isStaff } from '@/access'
import { adminEditedAtField, markAdminEdit } from '@/hooks/admin-edits'
import { revalidateCollection, revalidateCourses } from '@/hooks/revalidate'

// docs/admin-redesign.md, decision 6: prices are records of their own (the «Цени» screen), apart
// from the courses. A course has at most one base price (no group), and a group at most one price
// of its own (a promotion, say). The site shows the group's price, or else the course's base
// price (src/lib/price.ts). Only official prices: an empty course shows «Попитайте».

/** The site reads the prices of published courses only; staff see them all. */
const pricesOfPublishedOrStaff: Access = ({ req }) =>
  req.user ? true : ({ 'course._status': { equals: 'published' } } satisfies Where)

const id = (value: unknown): number | null =>
  typeof value === 'object' && value
    ? ((value as { id: number }).id ?? null)
    : ((value as number) ?? null)

/**
 * One base price per course and one price per group; a group's price belongs to the group's
 * course. (The database also refuses a second one: unique indexes in the migration.)
 */
const onePerCourseOrGroup: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  const course = id(data?.course ?? originalDoc?.course)
  const group = id(data && 'group' in data ? data.group : originalDoc?.group)
  if (!course) return data
  if (group) {
    const owner = await req.payload.findByID({
      collection: 'groups',
      id: group,
      depth: 0,
      req,
      disableErrors: true,
    })
    if (owner && id(owner.course) !== course)
      throw new ValidationError({
        collection: 'prices',
        errors: [{ path: 'group', message: 'Групата е на друг курс.' }],
      })
  }
  const { docs } = await req.payload.find({
    collection: 'prices',
    where: {
      and: [
        group ? { group: { equals: group } } : { course: { equals: course } },
        ...(group ? [] : [{ group: { exists: false } }]),
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
    limit: 1,
    depth: 0,
    req,
  })
  if (docs.length)
    throw new ValidationError({
      collection: 'prices',
      errors: [
        {
          path: group ? 'group' : 'course',
          message: group ? 'Тази група вече има цена.' : 'Този курс вече има основна цена.',
        },
      ],
    })
  return data
}

export const Prices: CollectionConfig = {
  slug: 'prices',
  labels: { singular: 'Цена', plural: 'Цени' },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'price',
    defaultColumns: ['course', 'group', 'price', 'regularPrice', 'label', 'note'],
    description:
      'Всеки курс има основна цена; група може да има своя (например промоция). Само официални цени.',
    components: {
      views: { list: { Component: '@/components/admin/lists/PricesList#PricesList' } },
    },
  },
  access: { read: pricesOfPublishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeValidate: [onePerCourseOrGroup],
    beforeChange: [markAdminEdit],
    afterChange: [revalidateCollection, revalidateCourses],
    afterDelete: [revalidateCollection, revalidateCourses],
  },
  fields: [
    adminEditedAtField,
    {
      type: 'row',
      fields: [
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
          label: 'Курс',
          required: true,
          index: true,
        },
        {
          name: 'group',
          type: 'relationship',
          relationTo: 'groups',
          label: 'Група',
          index: true,
          filterOptions: ({ data }) =>
            data?.course ? { course: { equals: id(data.course) } } : true,
          admin: { description: 'Празно: основната цена на курса. С група: цената на тази група.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          label: 'Цена',
          required: true,
          min: 0,
          admin: { description: 'Само официални цени.' },
        },
        {
          name: 'currency',
          type: 'select',
          label: 'Валута',
          required: true,
          defaultValue: 'EUR',
          options: [
            { value: 'EUR', label: '€' },
            { value: 'BGN', label: 'лв.' },
          ],
        },
        {
          name: 'regularPrice',
          type: 'number',
          label: 'Редовна цена',
          min: 0,
          admin: { description: 'При промоция: по-високата цена, показва се зачертана.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Етикет',
          localized: true,
          admin: { description: 'Например «Промоция», «Базова цена», «Стойност на ваучера».' },
        },
        {
          name: 'note',
          type: 'text',
          label: 'Бележка',
          localized: true,
          admin: { description: 'Например «или 495 € на ниво при самостоятелно плащане».' },
        },
      ],
    },
  ],
}
