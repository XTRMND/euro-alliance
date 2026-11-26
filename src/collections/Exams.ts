import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'
import { resultsByValid } from '@/lib/exams'

// Qualification exams of the ЦПО, in the Data table on «Професии и специалности» (236:3890).
// The page lists them by date, from 60 days ago on, so the results stay up for a while after an
// exam; without any it shows the table's empty state.
export const Exams: CollectionConfig = {
  slug: 'exams',
  labels: { singular: 'Изпитна сесия', plural: 'Изпитни сесии' },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'kind', 'date', 'place'],
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollection] },
  defaultSort: 'date',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'kind', type: 'text', label: 'Вид изпит', required: true, localized: true },
        {
          name: 'subject',
          type: 'text',
          label: 'Професия / специалност',
          required: true,
          localized: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'part',
          type: 'select',
          label: 'Теория / практика',
          required: true,
          options: [
            { value: 'theory', label: 'Теория' },
            { value: 'practice', label: 'Практика' },
            { value: 'both', label: 'Теория и практика' },
          ],
        },
        {
          name: 'date',
          type: 'date',
          label: 'Дата и час',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
              timeFormat: 'HH:mm',
              displayFormat: 'dd.MM.yyyy, HH:mm',
            },
          },
        },
      ],
    },
    { name: 'place', type: 'text', label: 'Място', required: true, localized: true },
    {
      type: 'row',
      fields: [
        {
          name: 'resultsBy',
          type: 'date',
          label: 'Срок за резултатите',
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
            description: 'До кога ще бъдат обявени резултатите (по избор).',
          },
          validate: (
            value: Date | string | null | undefined,
            { siblingData }: { siblingData: Partial<{ date: string | null }> },
          ) =>
            !value ||
            !siblingData.date ||
            resultsByValid(value, siblingData.date) ||
            'Срокът не може да е преди датата на изпита.',
        },
        {
          name: 'resultsPlace',
          type: 'text',
          label: 'Място на обявяване на резултатите',
          localized: true,
          admin: { description: 'Например на сайта или в офиса (по избор).' },
        },
      ],
    },
    {
      name: 'results',
      type: 'text',
      label: 'Резултати (връзка)',
      admin: {
        description:
          'Адрес на документа с резултатите, когато ги има (по избор). На сайта заменя срока и мястото.',
      },
      validate: (value: string | null | undefined) =>
        !value || /^(https:\/\/|\/)/.test(value) || 'Адрес, започващ с https:// или /.',
    },
  ],
}
