import type { Access, FieldAccess } from 'payload'

// Roles and access rules: docs/cms-schema.md § 1–2.

export const anyone: Access = () => true

export const isAdmin: Access = ({ req }) => req.user?.role === 'admin'

/** Admins and editors: everyone who can log in. */
export const isStaff = (({ req }) => Boolean(req.user)) satisfies Access

export const isAdminOrSelf: Access = ({ req }) => {
  if (req.user?.role === 'admin') return true
  return req.user ? { id: { equals: req.user.id } } : false
}

/** The public site reads published documents only; staff also see drafts. */
export const publishedOrStaff: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }

export const isAdminField: FieldAccess = ({ req }) => req.user?.role === 'admin'
