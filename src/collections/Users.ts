import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField, isAdminOrSelf, isStaff } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Потребител', plural: 'Потребители' },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'name', 'role'] },
  auth: {
    // The auth cookie lives as long as the token: 8 hours, well under the 12-month cookie cap.
    tokenExpiration: 60 * 60 * 8,
  },
  access: {
    admin: isStaff,
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      // The first account, made at /admin/create-first-user, is the admin.
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Име' },
    {
      // Hidden at /admin/create-first-user, where nobody is logged in: the hook above makes that
      // account the admin whatever the field says. The condition sits on a row, not on the field,
      // so the column stays NOT NULL (Payload makes a conditional field nullable).
      type: 'row',
      admin: { condition: (_data, _siblingData, { user }) => Boolean(user) },
      fields: [
        {
          name: 'role',
          type: 'select',
          label: 'Роля',
          required: true,
          defaultValue: 'editor',
          saveToJWT: true,
          options: [
            { label: 'Администратор', value: 'admin' },
            { label: 'Редактор', value: 'editor' },
          ],
          access: { create: isAdminField, update: isAdminField },
        },
      ],
    },
  ],
}
