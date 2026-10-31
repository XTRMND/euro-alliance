import type { GlobalConfig } from 'payload'
import { anyone, isStaff } from '@/access'

// Company facts for the footer, legal pages and structured data (docs/cms-schema.md § 7).
export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Данни за фирмата',
  access: { read: anyone, update: isStaff },
  fields: [
    { name: 'name', type: 'text', label: 'Име', localized: true },
    { name: 'legalName', type: 'text', label: 'Юридическо име', localized: true },
    { name: 'companyId', type: 'text', label: 'ЕИК' },
    {
      type: 'row',
      fields: [
        { name: 'foundedOn', type: 'date', label: 'Основана на' },
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
        { name: 'issuedOn', type: 'date', label: 'Дата' },
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
    { name: 'footerLegal', type: 'text', label: 'Ред в долния колонтитул', localized: true },
  ],
}
