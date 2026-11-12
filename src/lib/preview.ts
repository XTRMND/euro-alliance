import * as React from 'react'

// The live preview (docs/admin-redesign.md, decision 11): the admin's preview frame shows the real
// page templates, rendered from what's in the form. The preview route puts the unsaved document
// here, and the site's readers (src/lib/cms.ts) hand it to the page instead of the published one.
// The scope is one render of the preview route (React's `cache`): no other request sees it.

export const previewKinds = ['courses', 'programs', 'news', 'home', 'about', 'contact'] as const
export type PreviewKind = (typeof previewKinds)[number]

export const isPreviewKind = (value: unknown): value is PreviewKind =>
  previewKinds.includes(value as PreviewKind)

/** The address of a document's preview: `/preview/courses/12`, `/preview/home`. */
export const previewPath = (kind: PreviewKind, id?: number | string, locale?: string) =>
  `/preview/${kind}${id ? `/${id}` : ''}${locale ? `?locale=${locale}` : ''}`

const newScope = () => ({ docs: new Map<PreviewKind, unknown>() })
// Outside a server render (scripts, tests) there's nothing to scope to, and nothing is previewed.
const scope = typeof React.cache === 'function' ? React.cache(newScope) : newScope

export function setPreview(kind: PreviewKind, doc: unknown) {
  scope().docs.set(kind, doc)
}

/** The document being previewed in this render, if it's of this kind. */
export function previewOf<T>(kind: PreviewKind): T | undefined {
  return scope().docs.get(kind) as T | undefined
}
