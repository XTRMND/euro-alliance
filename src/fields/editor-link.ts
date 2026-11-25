import { type FeatureProviderServer, LinkFeature } from '@payloadcms/richtext-lexical'

// The text editor's link dialog opens with an empty address (the user, 25.11.2026). Payload
// writes «https://» into it, and an address from «Файлове» pasted after that became
// «https:///api/files/…», a broken link. The field now says what goes in it instead.
export const editorLink = LinkFeature({
  fields: ({ defaultFields }) =>
    defaultFields.map((field) =>
      'name' in field && field.name === 'url' && field.type === 'text'
        ? {
            ...field,
            defaultValue: '',
            admin: { ...field.admin, placeholder: 'https://… или адрес от «Файлове»' },
          }
        : field,
    ),
})

type Features = FeatureProviderServer<any, any, any>[] // eslint-disable-line @typescript-eslint/no-explicit-any

/** Payload's features with this link in place of its own. */
export function withEditorLink(defaultFeatures: Features): Features {
  return [...defaultFeatures.filter((feature) => feature.key !== 'link'), editorLink]
}
