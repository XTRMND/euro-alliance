import type { CollectionConfig, Field } from 'payload'
import { isAdminField, isStaff, publishedOrStaff } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'
import { timePattern, weekdays } from '@/lib/office-hours'

// docs/cms-schema.md § 3. The map and location fields arrive with the Location card (PR 11).

const dayNames = {
  mon: 'понеделник',
  tue: 'вторник',
  wed: 'сряда',
  thu: 'четвъртък',
  fri: 'петък',
  sat: 'събота',
  sun: 'неделя',
}
const dayOptions = weekdays.map((value) => ({ value, label: dayNames[value] }))
const monthOptions = [
  'януари',
  'февруари',
  'март',
  'април',
  'май',
  'юни',
  'юли',
  'август',
  'септември',
  'октомври',
  'ноември',
  'декември',
].map((label, index) => ({ value: String(index + 1), label }))

const time = (value: unknown) =>
  typeof value === 'string' && timePattern.test(value) ? true : 'Час като 8:30 или 17:00.'

/** A week of working hours: a row per run of days with the same hours; other days are days off. */
const hoursRows = (name: string, label: string): Field => ({
  name,
  type: 'array',
  label,
  labels: { singular: 'Ред', plural: 'Редове' },
  admin: {
    description:
      'По един ред за дни с еднакво работно време, напр. понеделник – четвъртък, 8:30 – 18:00. Дните без ред са почивни.',
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'from', type: 'select', label: 'От ден', required: true, options: dayOptions },
        {
          name: 'to',
          type: 'select',
          label: 'До ден',
          options: dayOptions,
          admin: { description: 'Празно за един ден.' },
        },
        { name: 'opens', type: 'text', label: 'Отваря', required: true, validate: time },
        { name: 'closes', type: 'text', label: 'Затваря', required: true, validate: time },
      ],
    },
  ],
})
export const Offices: CollectionConfig = {
  slug: 'offices',
  labels: { singular: 'Офис', plural: 'Офиси' },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'name',
    defaultColumns: ['name', 'department', 'role'],
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollection] },
  fields: [
    { name: 'name', type: 'text', label: 'Име', required: true, localized: true },
    { name: 'department', type: 'text', label: 'Направление', localized: true },
    {
      name: 'role',
      type: 'select',
      label: 'Роля при запитвания',
      required: true,
      unique: true,
      options: [
        { label: 'Курсове', value: 'courses' },
        { label: 'Преводи, Пловдив', value: 'translations-plovdiv' },
        { label: 'Преводи, София', value: 'translations-sofia' },
      ],
      access: { update: isAdminField },
      admin: {
        description: 'Определя накъде отиват запитванията. Променя се само от администратор.',
      },
    },
    { name: 'address', type: 'textarea', label: 'Адрес', required: true, localized: true },
    {
      name: 'phones',
      type: 'array',
      label: 'Телефони',
      fields: [{ name: 'number', type: 'text', label: 'Номер', required: true }],
    },
    {
      name: 'emails',
      type: 'array',
      label: 'Имейли',
      fields: [{ name: 'email', type: 'email', label: 'Имейл', required: true }],
    },
    { name: 'routes', type: 'richText', label: 'Как да стигнете', localized: true },
    {
      name: 'hours',
      type: 'group',
      label: 'Работно време',
      admin: {
        description:
          'Показва се навсякъде, където е офисът. Дните и месеците се изписват на езика на страницата.',
      },
      fields: [
        hoursRows('regular', 'Работно време'),
        {
          name: 'seasonal',
          type: 'group',
          label: 'Сезонно работно време (по избор)',
          admin: {
            description:
              'Напр. лятно работно време от 15 юни до 1 септември. Важи всяка година между двете дати и се включва само.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'startDay', type: 'number', label: 'От ден', min: 1, max: 31 },
                { name: 'startMonth', type: 'select', label: 'От месец', options: monthOptions },
                { name: 'endDay', type: 'number', label: 'До ден', min: 1, max: 31 },
                { name: 'endMonth', type: 'select', label: 'До месец', options: monthOptions },
              ],
            },
            hoursRows('rows', 'Работно време през сезона'),
          ],
        },
      ],
    },
  ],
}
