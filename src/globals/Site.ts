import type { GlobalConfig } from 'payload'
import { anyone, isStaff } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

// Company facts for the footer, legal pages and structured data (docs/cms-schema.md § 7).
// «08.02.1999», as the site writes dates.
const dayOnly = { date: { pickerAppearance: 'dayOnly' as const, displayFormat: 'dd.MM.yyyy' } }

export const Site: GlobalConfig = {
  slug: 'site',
  admin: { hideAPIURL: true },
  label: 'Данни за фирмата',
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'name', type: 'text', label: 'Име', localized: true },
    { name: 'legalName', type: 'text', label: 'Юридическо име', localized: true },
    { name: 'companyId', type: 'text', label: 'ЕИК' },
    { name: 'facebook', type: 'text', label: 'Facebook (адрес)' },
    {
      type: 'row',
      fields: [
        { name: 'foundedOn', type: 'date', label: 'Основана на', admin: dayOnly },
        { name: 'foundedIn', type: 'text', label: 'Основана в', localized: true },
      ],
    },
    {
      name: 'licence',
      type: 'group',
      label: 'Лиценз на ЦПО',
      fields: [
        { name: 'issuer', type: 'text', label: 'Издаден от', localized: true },
        { name: 'number', type: 'text', label: 'Номер' },
        { name: 'issuedOn', type: 'date', label: 'Дата', admin: dayOnly },
      ],
    },
    {
      name: 'certifications',
      type: 'array',
      label: 'Сертификати',
      fields: [{ name: 'standard', type: 'text', label: 'Стандарт', required: true }],
    },
    {
      name: 'bank',
      type: 'group',
      label: 'Банкова сметка',
      fields: [
        { name: 'name', type: 'text', label: 'Банка', localized: true },
        { name: 'iban', type: 'text', label: 'IBAN' },
        { name: 'bic', type: 'text', label: 'BIC' },
      ],
    },
    {
      name: 'seoImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Изображение за споделяне по подразбиране',
    },
    {
      name: 'funding',
      type: 'group',
      label: 'Финансиране от ЕС (долен колонтитул)',
      fields: [
        { name: 'statement', type: 'textarea', label: 'Текст', localized: true },
        {
          name: 'logos',
          type: 'upload',
          relationTo: 'media',
          label: 'Лента с логата',
          filterOptions: { kind: { equals: 'logo' } },
          admin: {
            description: 'Точно както е предоставена: без изрязване и промяна на цветовете.',
          },
        },
      ],
    },
  ],
}
