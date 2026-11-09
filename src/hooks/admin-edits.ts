import type { CollectionBeforeChangeHook, Field } from 'payload'

// When a person last changed a record in the admin (a request with a signed-in user). The staging
// seed (scripts/seed/staging.ts) never overwrites a record with this date: it reports it instead,
// so the client's edits on staging survive a re-run. The seed writes through the Local API
// without a user, so its own writes leave the date alone.

export const adminEditedAtField: Field = {
  name: 'adminEditedAt',
  type: 'date',
  label: 'Редактирано в админа',
  admin: { hidden: true },
}

export const markAdminEdit: CollectionBeforeChangeHook = ({ data, req }) => {
  if (req.user) return { ...data, adminEditedAt: new Date().toISOString() }
  return data
}
