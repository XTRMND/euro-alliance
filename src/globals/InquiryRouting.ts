import type { GlobalConfig } from 'payload'
import { isAdmin, isStaff } from '@/access'
import { inquiryOffices, inquiryTopics } from '@/lib/inquiries'

// Where each inquiry topic goes (docs/cms-schema.md § 5): admin-only, so routing can change
// without a deploy. Seeded with the default table in src/lib/inquiries.ts.

const topicLabels = {
  courses: 'Курсове',
  vouchers: 'Ваучери',
  professions: 'Професионално обучение',
  teachers: 'Педагогически специалисти',
  farmers: 'Земеделски производители',
  computer: 'Компютърни курсове',
  translations: 'Преводи',
}

export const InquiryRouting: GlobalConfig = {
  slug: 'inquiry-routing',
  label: 'Маршрутизиране на запитвания',
  access: { read: isStaff, update: isAdmin },
  admin: { hidden: ({ user }) => user?.role !== 'admin' },
  fields: [
    {
      name: 'rules',
      type: 'array',
      label: 'Правила',
      admin: {
        description:
          'Тема (и офис за преводите) → пощенска кутия. Без правило запитването отива на office@.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'topic',
              type: 'select',
              label: 'Тема',
              required: true,
              options: inquiryTopics.map((value) => ({ value, label: topicLabels[value] })),
            },
            {
              name: 'office',
              type: 'select',
              label: 'Офис',
              options: inquiryOffices.map((value) => ({
                value,
                label: value === 'plovdiv' ? 'Пловдив' : 'София',
              })),
            },
            { name: 'email', type: 'email', label: 'Имейл', required: true },
          ],
        },
      ],
    },
  ],
}
