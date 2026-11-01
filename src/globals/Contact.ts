import type { GlobalConfig } from 'payload'
import { anyone, isStaff } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'
import { contactLocations } from '@/lib/routes'
import { metaField } from '@/fields/meta'

// The contact page (119:1795 / 121:1145): its hero and the «Как да ни намерите» location cards
// (125:302). The office cards come from Offices. Map images are duotone OpenStreetMap snapshots;
// the coordinates open the live map and the directions.

export const Contact: GlobalConfig = {
  slug: 'contact',
  label: 'Контакти',
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    metaField(),
    {
      name: 'hero',
      type: 'group',
      label: 'Начало на страницата',
      fields: [
        { name: 'title', type: 'text', label: 'Заглавие', localized: true },
        {
          name: 'highlight',
          type: 'text',
          label: 'Подчертана фраза',
          localized: true,
          admin: { description: 'Част от заглавието.' },
        },
        { name: 'lead', type: 'textarea', label: 'Текст', localized: true },
      ],
    },
    {
      name: 'locations',
      type: 'array',
      label: 'Как да ни намерите',
      labels: { singular: 'Място', plural: 'Места' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'anchor',
              type: 'select',
              label: 'Котва',
              required: true,
              options: Object.keys(contactLocations).map((value) => ({
                value,
                label: value === 'plovdiv' ? 'Пловдив' : 'София',
              })),
              admin: { description: 'Връзките «Пловдив» и «София» в долния колонтитул водят тук.' },
            },
            { name: 'kicker', type: 'text', label: 'Надзаглавие', localized: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'street', type: 'text', label: 'Улица', required: true, localized: true },
            { name: 'address', type: 'text', label: 'Адрес', localized: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'latitude', type: 'number', label: 'Ширина', required: true },
            { name: 'longitude', type: 'number', label: 'Дължина', required: true },
          ],
        },
        {
          name: 'map',
          type: 'upload',
          relationTo: 'media',
          label: 'Карта',
          filterOptions: { kind: { equals: 'art' } },
          admin: { description: 'Снимка на картата около офиса (OpenStreetMap), 800 × 460.' },
        },
      ],
    },
  ],
}
