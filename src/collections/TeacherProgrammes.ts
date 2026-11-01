import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'

// Programmes for pedagogical specialists under Наредба 12 (docs/cms-schema.md § 3), listed by
// theme on «Педагогически специалисти» (237:3823). The order here is the page's order: drag the
// rows in the admin; a theme's card comes where its first programme is. Hours and credits per
// programme aren't on the page yet (Figma doesn't show them) and stay empty until the client
// gives them.
export const TeacherProgrammes: CollectionConfig = {
  slug: 'teacher-programmes',
  labels: { singular: 'Програма за учители', plural: 'Програми за учители' },
  orderable: true,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['number', 'title', 'theme'],
    description:
      'Програмите на страницата «Педагогически специалисти», по теми, в този ред (подреждат се с влачене).',
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollection] },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'number',
          type: 'text',
          label: 'Номер',
          required: true,
          admin: { description: 'Номерът от официалния списък, както е даден (например 01).' },
        },
        { name: 'theme', type: 'text', label: 'Тема', required: true, localized: true },
      ],
    },
    { name: 'title', type: 'text', label: 'Програма', required: true, localized: true },
    {
      type: 'row',
      fields: [
        { name: 'hours', type: 'number', label: 'Учебни часа', min: 1 },
        { name: 'credits', type: 'number', label: 'Кредити', min: 1, max: 3 },
      ],
    },
  ],
}
