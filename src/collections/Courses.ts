import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateCollection } from '@/hooks/revalidate'
import { indexAfterChange, indexAfterDelete } from '@/lib/search-index'
import { courseAudiences, courseCategoryValues, courseFormats, courseTopics } from '@/lib/courses'
import { languages, routes } from '@/lib/routes'
import { metaField } from '@/fields/meta'
import { legacyRedirectHooks } from '@/hooks/legacy-redirect'

// docs/cms-schema.md § 3. A course is what the centre teaches; its dates belong to its groups
// (the user's model of 02.11.2026): zero or more, each with a start and an optional end, schedule,
// format, office, price and seats. The state of a course comes from its groups
// (src/lib/course-state.ts). Never invent a course: an empty optional field hides its element.

const audienceLabels = { students: 'Ученици', adults: 'Възрастни', companies: 'Фирми' }
const formatLabels = { 'in-person': 'Присъствено', online: 'Онлайн' }
const categoryLabels = {
  languages: 'Езици',
  exams: 'Изпити и сертификати',
  vocational: 'Професионално обучение',
  vouchers: 'Обучение с ваучери',
  teachers: 'Педагогически специалисти',
  farmers: 'Обучение за земеделци',
  computer: 'Компютърни курсове',
}
const languageLabels = {
  english: 'Английски',
  german: 'Немски',
  french: 'Френски',
  spanish: 'Испански',
  italian: 'Италиански',
  bulgarian: 'Български',
  russian: 'Руски',
}
const topicLabels = {
  english: 'Английски (Биг Бен)',
  german: 'Немски (Бранденбургска врата)',
  french: 'Френски (Айфелова кула)',
  italian: 'Италиански',
  spanish: 'Испански',
  russian: 'Руски',
  bulgarian: 'Български за чужденци (Александър Невски)',
  'exam-prep': 'Подготовка за изпит (книги)',
  exams: 'Изпити (молив)',
  student: 'Ученици',
  teaching: 'Преподаване (глобус)',
  professional: 'Професионално обучение',
  corporate: 'Фирмено обучение (куфар)',
  computer: 'Компютри',
  farming: 'Земеделие',
  translation: 'Преводи (печат)',
}

/** The sticker choice, also offered on the homepage program cards. */
export const topicOptions = courseTopics.map((value) => ({ value, label: topicLabels[value] }))

// The old site's addresses (the course's and its groups') redirect here while it's published.
const legacyRedirect = legacyRedirectHooks<{
  id: number
  slug?: string | null
  _status?: string | null
  legacyUrl?: string | null
  groups?: { legacyUrl?: string | null }[] | null
}>(
  'courses',
  (doc) => (doc.slug ? routes.course(doc.slug) : null),
  (doc) => (doc.groups ?? []).map((group) => group.legacyUrl),
)

const formatOptions = courseFormats.map((value) => ({ value, label: formatLabels[value] }))
const dayOnly = { date: { pickerAppearance: 'dayOnly' as const, displayFormat: 'dd.MM.yyyy' } }

export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: { singular: 'Курс', plural: 'Курсове' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'audience', '_status'],
  },
  defaultSort: 'title',
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: {
    afterChange: [revalidateCollection, indexAfterChange, legacyRedirect.afterChange],
    afterDelete: [revalidateCollection, indexAfterDelete, legacyRedirect.afterDelete],
  },
  fields: [
    metaField(),
    { name: 'title', type: 'text', label: 'Заглавие', required: true, localized: true },
    {
      name: 'originalTitle',
      type: 'text',
      label: 'Заглавие на стария сайт',
      localized: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Както е било на стария сайт, преди аудиторията и формата да минат в етикетите.',
      },
    },
    slugField(),
    {
      name: 'description',
      type: 'textarea',
      label: 'Кратко описание',
      localized: true,
      admin: { description: 'Под заглавието на страницата на курса.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'select',
          label: 'Категория',
          required: true,
          options: courseCategoryValues.map((value) => ({ value, label: categoryLabels[value] })),
        },
        {
          name: 'language',
          type: 'select',
          label: 'Език',
          options: languages.map((value) => ({ value, label: languageLabels[value] })),
        },
      ],
    },
    {
      name: 'topic',
      type: 'select',
      label: 'Стикер',
      required: true,
      options: topicOptions,
      admin: {
        description: 'Един стикер, едно значение: не ползвайте един стикер за различни неща.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'audience',
          type: 'select',
          label: 'Аудитория',
          options: courseAudiences.map((value) => ({ value, label: audienceLabels[value] })),
        },
        {
          name: 'audienceNote',
          type: 'text',
          label: 'Уточнение към аудиторията',
          localized: true,
          admin: { description: 'Например «12 клас». Показва се след аудиторията.' },
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
          options: formatOptions,
          admin: { description: 'Обичайният формат; всяка група може да има свой.' },
        },
        {
          name: 'cardTag',
          type: 'text',
          label: 'Втори етикет на картата',
          localized: true,
          admin: {
            description:
              'Например «Вечерна група». Ако е празно: «С ваучер» за курс с ваучер, иначе формата.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'level',
          type: 'text',
          label: 'Ниво',
          admin: { description: 'Например B2, A1–B1 или 11–12. Празно: без балонче за ниво.' },
        },
        {
          name: 'levelUnit',
          type: 'select',
          label: 'Под числото в балончето',
          defaultValue: 'level',
          options: [
            { value: 'level', label: 'Ниво' },
            { value: 'grade', label: 'Клас' },
          ],
          admin: { description: 'Клас за подготовка за изпит по класове, например 11–12 за ДЗИ.' },
        },
      ],
    },
    { name: 'duration', type: 'textarea', label: 'Хорариум', localized: true },
    {
      name: 'groups',
      type: 'array',
      label: 'Групи',
      labels: { singular: 'Група', plural: 'Групи' },
      admin: {
        initCollapsed: true,
        description:
          'Датите са на групите. Без група курсът е «Няма насрочена дата». Започнала група без край е «В ход», докато не ѝ се зададе край.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Име на групата',
          localized: true,
          admin: { description: 'По желание, например «Съботни групи».' },
        },
        {
          type: 'row',
          fields: [
            { name: 'startDate', type: 'date', label: 'Начало', required: true, admin: dayOnly },
            { name: 'endDate', type: 'date', label: 'Край', admin: dayOnly },
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
            { name: 'format', type: 'select', label: 'Формат', options: formatOptions },
            { name: 'office', type: 'relationship', relationTo: 'offices', label: 'Офис' },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'price',
              type: 'number',
              label: 'Цена',
              min: 0,
              admin: { description: 'Празно: цената не се показва. Само официални цени.' },
            },
            {
              name: 'currency',
              type: 'select',
              label: 'Валута',
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
              name: 'priceLabel',
              type: 'text',
              label: 'Етикет на цената',
              localized: true,
              admin: { description: 'Например «Промоция», «Базова цена», «Стойност на ваучера».' },
            },
            {
              name: 'priceNote',
              type: 'text',
              label: 'Бележка към цената',
              localized: true,
              admin: { description: 'Например «или 495 € на ниво при самостоятелно плащане».' },
            },
          ],
        },
        {
          name: 'legacyUrl',
          type: 'text',
          label: 'Стар адрес',
          admin: { readOnly: true, description: 'От стария сайт, за пренасочването.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Какво получавате',
      fields: [
        {
          name: 'entryLevel',
          type: 'text',
          label: 'Входно ниво',
          admin: {
            description:
              'Нивото, нужно за курса, например B1: при записване «Да, B1 или по-високо». Празно: «Да».',
          },
        },
        {
          name: 'levelName',
          type: 'text',
          label: 'Ниво (пълно име)',
          localized: true,
          admin: { description: 'Например «B2 Upper-Intermediate». Празно: показва се нивото.' },
        },
        {
          type: 'row',
          fields: [
            { name: 'program', type: 'text', label: 'Програма', localized: true },
            { name: 'document', type: 'text', label: 'Документ', localized: true },
          ],
        },
        { name: 'included', type: 'text', label: 'Включено', localized: true },
      ],
    },
    {
      name: 'voucherEligible',
      type: 'checkbox',
      label: 'С ваучер от Агенцията по заетостта',
    },
    {
      name: 'legacyUrl',
      type: 'text',
      label: 'Стар адрес',
      admin: { position: 'sidebar', description: 'От стария сайт, за пренасочването.' },
    },
  ],
}
