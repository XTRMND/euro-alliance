import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateCollection } from '@/hooks/revalidate'
import { indexAfterChange, indexAfterDelete } from '@/lib/search-index'
import { courseAudiences, courseCategoryValues, courseFormats, courseTopics } from '@/lib/courses'
import { languages } from '@/lib/routes'
import { metaField } from '@/fields/meta'

// docs/cms-schema.md § 3. Added with the homepage, the first page that lists courses. The
// relation to Programs arrives with the Programs collection (PR 12). Never invent a course:
// an empty optional field hides its element on the card and the page.

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

export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: { singular: 'Курс', plural: 'Курсове' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'audience', 'startDate', '_status'],
  },
  defaultSort: 'startDate',
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: {
    afterChange: [revalidateCollection, indexAfterChange],
    afterDelete: [revalidateCollection, indexAfterDelete],
  },
  fields: [
    metaField(),
    { name: 'title', type: 'text', label: 'Заглавие', required: true, localized: true },
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
          options: courseFormats.map((value) => ({ value, label: formatLabels[value] })),
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
      name: 'level',
      type: 'text',
      label: 'Ниво',
      admin: { description: 'Например B2 или A1–B1. Празно: без балонче за ниво.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          label: 'Начало',
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' } },
        },
        { name: 'seats', type: 'number', label: 'Свободни места', min: 0 },
      ],
    },
    {
      type: 'collapsible',
      label: 'Кога',
      fields: [
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
        { name: 'duration', type: 'textarea', label: 'Хорариум', localized: true },
        { name: 'schedule', type: 'textarea', label: 'График (бележка)', localized: true },
        {
          name: 'schedules',
          type: 'array',
          label: 'Графици за записване',
          labels: { singular: 'График', plural: 'Графици' },
          admin: {
            description:
              'Например «пн и ср, 18:00–20:50». При записване посетителят избира един; с един или без графици въпросът не се задава.',
          },
          fields: [
            { name: 'label', type: 'text', label: 'График', required: true, localized: true },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Къде',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'venue', type: 'text', label: 'Учебна база', localized: true },
            { name: 'city', type: 'text', label: 'Град', localized: true },
          ],
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
          admin: { description: 'При промоция: по-високата редовна цена, показва се зачертана.' },
        },
        {
          name: 'priceNote',
          type: 'text',
          label: 'Бележка към цената',
          localized: true,
          admin: { description: 'Например «за целия курс» или «промоция».' },
        },
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
