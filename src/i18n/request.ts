import { getRequestConfig } from 'next-intl/server'

// Bulgarian only for now. English arrives later under /en/ (docs/i18n.md § 1); that adds locale
// routing here.
export const locales = ['bg', 'en'] as const
export const defaultLocale = 'bg'

export default getRequestConfig(async () => ({
  locale: defaultLocale,
  messages: (await import(`../messages/${defaultLocale}.json`)).default,
  timeZone: 'Europe/Sofia',
}))
