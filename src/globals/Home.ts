import type { Field, GlobalConfig } from 'payload'
import { anyone, isStaff } from '@/access'
import { topicOptions } from '@/collections/Courses'
import { revalidateGlobal } from '@/hooks/revalidate'
import { destinationOptions } from '@/lib/destinations'
import { metaField } from '@/fields/meta'

// The homepage (48:184 / 115:233; docs/cms-schema.md § 7). Courses and news come from their
// collections; this global holds the hero, the section titles, the program cards and the partner
// logos. Links pick a destination from a fixed list (src/lib/destinations.ts), so none can break.

const destination = (required = true): Field => ({
  name: 'destination',
  type: 'select',
  label: 'Води към',
  required,
  options: destinationOptions,
})

const action = (name: string, label: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', label: 'Текст', localized: true },
        destination(false),
      ],
    },
  ],
})

const photo = (name: string, label: string, description: string): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  label,
  filterOptions: { kind: { equals: 'photo' } },
  admin: {
    description,
  },
})

export const Home: GlobalConfig = {
  slug: 'home',
  admin: { hideAPIURL: true },
  label: 'Начална страница',
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    metaField(),
    {
      name: 'hero',
      type: 'group',
      label: 'Начало на страницата',
      fields: [
        { name: 'heading', type: 'text', label: 'Заглавие', required: true, localized: true },
        {
          name: 'highlight',
          type: 'text',
          label: 'Подчертана фраза',
          localized: true,
          admin: { description: 'Част от заглавието, на нов ред с пясъчен маркер.' },
          validate: (value: unknown, { siblingData }: { siblingData: { heading?: string } }) =>
            !value || (typeof value === 'string' && siblingData.heading?.includes(value))
              ? true
              : 'Фразата трябва да е част от заглавието.',
        },
        { name: 'lead', type: 'textarea', label: 'Текст', localized: true },
        action('primary', 'Основен бутон'),
        action('secondary', 'Втори бутон (връзка)'),
        photo(
          'photo',
          'Снимка',
          'Истинска снимка, в синия тон (88%). Без снимка колажът остава с глобуса.',
        ),
        photo(
          'photoSecondary',
          'Втора снимка',
          'По желание, в цвят, под първата: снимка на школата или подбрана от Unsplash (авторът в «Автор» на файла).',
        ),
      ],
    },
    {
      name: 'upcoming',
      type: 'group',
      label: 'Предстоящи курсове',
      admin: {
        description: 'Курсовете идват от «Курсове»: публикувани, с начало от днес нататък.',
      },
      fields: [{ name: 'title', type: 'text', label: 'Заглавие', localized: true }],
    },
    {
      name: 'programs',
      type: 'group',
      label: 'Какво предлагаме',
      fields: [
        { name: 'title', type: 'text', label: 'Заглавие', localized: true },
        {
          name: 'cards',
          type: 'array',
          label: 'Карти',
          labels: { singular: 'Карта', plural: 'Карти' },
          admin: { description: 'Номерата (01, 02 …) следват реда на картите.' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'title', type: 'text', label: 'Заглавие', required: true, localized: true },
                {
                  name: 'sticker',
                  type: 'select',
                  label: 'Стикер',
                  required: true,
                  options: topicOptions,
                },
              ],
            },
            { name: 'text', type: 'textarea', label: 'Текст', localized: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'linkLabel',
                  type: 'text',
                  label: 'Текст на връзката',
                  required: true,
                  localized: true,
                },
                destination(),
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'about',
      type: 'group',
      label: 'За ЕВРО-АЛИАНС',
      admin: {
        description:
          'Секцията след «Какво предлагаме»: снимка в полароид, стикер и текст. Без заглавие не се показва.',
      },
      fields: [
        { name: 'kicker', type: 'text', label: 'Надзаглавие', localized: true },
        {
          type: 'row',
          fields: [
            { name: 'heading', type: 'text', label: 'Заглавие', localized: true },
            {
              name: 'highlight',
              type: 'text',
              label: 'Подчертана фраза',
              localized: true,
              admin: { description: 'Част от заглавието; стои на свой ред.' },
            },
          ],
        },
        { name: 'lead', type: 'textarea', label: 'Текст', localized: true },
        {
          name: 'quote',
          type: 'textarea',
          label: 'Акцент',
          localized: true,
          admin: { description: 'С пясъчната черта отляво.' },
        },
        {
          type: 'row',
          fields: [
            photo('photo', 'Снимка', 'Показва се в полароид, с лек тон в цветовете на сайта.'),
            { name: 'caption', type: 'text', label: 'Надпис под снимката', localized: true },
          ],
        },
        { name: 'sticker', type: 'select', label: 'Стикер', options: topicOptions },
        action('cta', 'Бутон'),
      ],
    },
    {
      name: 'translations',
      type: 'group',
      label: 'Преводи',
      fields: [
        { name: 'title', type: 'text', label: 'Заглавие', localized: true },
        { name: 'lead', type: 'textarea', label: 'Текст', localized: true },
        {
          name: 'steps',
          type: 'array',
          label: 'Стъпки',
          maxRows: 3,
          fields: [{ name: 'text', type: 'text', label: 'Текст', required: true, localized: true }],
        },
        action('cta', 'Бутон'),
      ],
    },
    {
      name: 'news',
      type: 'group',
      label: 'Новини',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', type: 'text', label: 'Заглавие', localized: true },
            {
              name: 'count',
              type: 'number',
              label: 'Брой новини',
              defaultValue: 3,
              min: 1,
              max: 6,
            },
          ],
        },
      ],
    },
    {
      name: 'partners',
      type: 'group',
      label: 'Партньори и акредитации',
      fields: [
        { name: 'title', type: 'text', label: 'Заглавие', localized: true },
        {
          name: 'logos',
          type: 'array',
          label: 'Логота',
          labels: { singular: 'Лого', plural: 'Логота' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: 'Име (алтернативен текст)',
                  required: true,
                  localized: true,
                },
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Лого',
                  required: true,
                  filterOptions: { kind: { equals: 'logo' } },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
