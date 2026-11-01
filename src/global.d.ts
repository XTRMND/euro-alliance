import type messages from './messages/bg.json'
import type { locales } from './i18n/request'

// Typed message keys: a key that isn't in bg.json fails the typecheck (docs/i18n.md § 1).
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof locales)[number]
    Messages: typeof messages
  }
}
