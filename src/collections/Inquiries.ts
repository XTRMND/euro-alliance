import type { CollectionConfig, FieldAccess } from 'payload'
import { isAdmin, isStaff } from '@/access'
import {
  inquiryOffices,
  inquiryStatuses,
  inquiryStatusLabels,
  inquiryTopicLabels,
  inquiryTopics,
} from '@/lib/inquiries'

// Inquiries from the contact wizard (docs/cms-schema.md § 3). Only the wizard's server action
// creates them; never the public REST API. Staff read them and update the status and their notes;
// what the visitor sent can't be edited. Kept a year unless they lead to a contract (§ 6).

const visitorData: FieldAccess = () => false

const readOnly = { readOnly: true }

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Запитване', plural: 'Запитвания' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['createdAt', 'topic', 'name', 'routedTo', 'status'],
    description: 'Пазят се 1 година, освен ако не са довели до договор.',
    // «Admin · 06 Запитвания» (371:1332): the list and the open inquiry in one card.
    components: {
      views: { list: { Component: '@/components/admin/lists/InquiriesList#InquiriesList' } },
    },
  },
  defaultSort: '-createdAt',
  access: { read: isStaff, create: () => false, update: isStaff, delete: isAdmin },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          label: 'Статус',
          required: true,
          defaultValue: 'new',
          options: inquiryStatuses.map((value) => ({
            value,
            label: inquiryStatusLabels[value],
          })),
        },
        {
          name: 'topic',
          type: 'select',
          label: 'Тема',
          options: inquiryTopics.map((value) => ({ value, label: inquiryTopicLabels[value] })),
          access: { update: visitorData },
          admin: readOnly,
        },
        {
          name: 'office',
          type: 'select',
          label: 'Офис',
          options: inquiryOffices.map((value) => ({
            value,
            label: value === 'plovdiv' ? 'Пловдив' : 'София',
          })),
          access: { update: visitorData },
          admin: readOnly,
        },
      ],
    },
    {
      name: 'contract',
      type: 'checkbox',
      label: 'Довело до договор',
      admin: { description: 'Такова запитване не се изтрива след 1 година.' },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Бележки (вътрешни)',
      admin: { description: 'Видими само за екипа в админа.' },
    },
    {
      type: 'collapsible',
      label: 'Изпратено от посетителя',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Име',
              access: { update: visitorData },
              admin: readOnly,
            },
            {
              name: 'email',
              type: 'email',
              label: 'Имейл',
              access: { update: visitorData },
              admin: readOnly,
            },
            {
              name: 'phone',
              type: 'text',
              label: 'Телефон',
              access: { update: visitorData },
              admin: readOnly,
            },
          ],
        },
        {
          name: 'message',
          type: 'textarea',
          label: 'Съобщение',
          access: { update: visitorData },
          admin: readOnly,
        },
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
          label: 'Курс',
          access: { update: visitorData },
          admin: readOnly,
        },
        {
          name: 'answers',
          type: 'array',
          label: 'Отговори',
          access: { update: visitorData },
          admin: {
            ...readOnly,
            description: 'Въпросите на съветника и отговорите, както са видени.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'question', type: 'text', label: 'Въпрос' },
                { name: 'answer', type: 'text', label: 'Отговор' },
              ],
            },
          ],
        },
        {
          name: 'files',
          type: 'relationship',
          relationTo: 'inquiry-files',
          hasMany: true,
          label: 'Файлове',
          access: { update: visitorData },
          admin: readOnly,
        },
        {
          name: 'privacyAck',
          type: 'checkbox',
          label: 'Прие политиката за поверителност',
          required: true,
          access: { update: visitorData },
          admin: readOnly,
        },
        {
          name: 'sourcePage',
          type: 'text',
          label: 'Страница',
          access: { update: visitorData },
          admin: readOnly,
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Изпращане',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'routedTo',
          type: 'email',
          label: 'Изпратено до',
          access: { update: visitorData },
          admin: readOnly,
        },
        {
          name: 'emailStatus',
          type: 'select',
          label: 'Имейли',
          defaultValue: 'pending',
          options: [
            { value: 'pending', label: 'Чакат' },
            { value: 'sent', label: 'Изпратени' },
            { value: 'failed', label: 'Неуспешни' },
          ],
          access: { update: visitorData },
          admin: readOnly,
        },
      ],
    },
  ],
}
