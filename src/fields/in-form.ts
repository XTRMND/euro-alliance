import type { Field } from 'payload'

/**
 * A field made for the sidebar (the slug, the search-engine fields), put in the form instead:
 * inside a tab of an edit screen (docs/admin-redesign.md, PR 9), where «sidebar» has no meaning.
 */
export const inForm = <F extends Field>(field: F): F => ({
  ...field,
  admin: { ...field.admin, position: undefined },
})
