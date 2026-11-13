import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { bg } from '@payloadcms/translations/languages/bg'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Certificates } from './collections/Certificates'
import { Courses } from './collections/Courses'
import { Documents } from './collections/Documents'
import { Exams } from './collections/Exams'
import { Groups } from './collections/Groups'
import { FundedProjects } from './collections/FundedProjects'
import { LegalPages } from './collections/LegalPages'
import { Redirects } from './collections/Redirects'
import { Inquiries } from './collections/Inquiries'
import { InquiryFiles } from './collections/InquiryFiles'
import { Media } from './collections/Media'
import { MediaTints } from './collections/MediaTints'
import { News } from './collections/News'
import { Offices } from './collections/Offices'
import { Prices } from './collections/Prices'
import { Professions } from './collections/Professions'
import { Programs } from './collections/Programs'
import { Team } from './collections/Team'
import { TeacherProgrammes } from './collections/TeacherProgrammes'
import { TextbookSystems } from './collections/TextbookSystems'
import { Users } from './collections/Users'
import { About } from './globals/About'
import { Contact } from './globals/Contact'
import { Home } from './globals/Home'
import { InquiryRouting } from './globals/InquiryRouting'
import { Navigation } from './globals/Navigation'
import { Site } from './globals/Site'
import { jobs } from './jobs'
import { emailAdapter } from './lib/email'
import { namedLists } from './fields/row-labels'
import { isPreviewKind, previewUrl } from './lib/preview'
import { migrations } from './migrations'
import { seed } from './seed'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    // Payload's own avatar, not Gravatar: no editor's email hash goes to a third party, and the
    // admin's Content-Security-Policy needs no outside images.
    avatar: 'default',
    importMap: { baseDir: dirname },
    // Light only (docs/admin-redesign.md, decision 2): no dark mode, and no theme choice on the
    // account page.
    theme: 'light',
    // «10 ноември 2026, 16:52», as the site writes dates (decision 12: Bulgarian date formats).
    dateFormat: 'd MMMM yyyy, HH:mm',
    // Live preview (decision 11): the page's own template beside the form, rendered from what's
    // typed (src/lib/preview.ts), at the two widths of the design.
    livePreview: {
      collections: ['courses', 'programs', 'news'],
      globals: ['home', 'about', 'contact'],
      breakpoints: [
        { name: 'mobile', label: 'Телефон · 390', width: 390, height: 844 },
        { name: 'desktop', label: 'Компютър · 1440', width: 1440, height: 900 },
      ],
      url: ({ data, collectionConfig, globalConfig, locale }) => {
        const kind = collectionConfig?.slug ?? globalConfig?.slug
        // Empty for a document that has no page to show yet (unsaved, or without its language).
        return isPreviewKind(kind) ? previewUrl(kind, data, locale?.code) : ''
      },
    },
    // The shell of Figma's «07 CMS admin» (docs/admin-redesign.md, PR 6): the sidebar mirrors
    // the site, with the top bar and the hairline sub-nav beside it; the logo mark is the icon.
    components: {
      Nav: '@/components/admin/shell/AdminNav#AdminNav',
      graphics: {
        Icon: '@/components/admin/shell/Graphics#Icon',
        Logo: '@/components/admin/shell/Graphics#Logo',
      },
      // «Admin · 01 Табло» (359:969) in place of Payload's lists of collections and globals.
      views: { dashboard: { Component: '@/components/admin/dashboard/Dashboard#Dashboard' } },
      // The text editor's few fixed English labels, in Bulgarian (decision 12).
      providers: ['@/components/admin/EditorLabels#EditorLabels'],
      beforeLogin: ['@/components/admin/shell/Login#BeforeLogin'],
      afterLogin: ['@/components/admin/shell/Login#AfterLogin'],
    },
    meta: {
      titleSuffix: ' · Евро Алианс',
      icons: [
        { rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' },
        { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
      ],
    },
  },
  // The admin is in Bulgarian whatever the browser's language (docs/admin-redesign.md); English
  // is a content language (localization, below), not an interface one.
  i18n: {
    supportedLanguages: { bg },
    fallbackLanguage: 'bg',
    // The only blocks in the forms are a programme's sections («Добави секция», Figma 373:1726).
    translations: {
      bg: {
        fields: { searchForBlock: 'Търси секция…' },
        // The admin's 404 (decision 12), in the site's own words.
        general: {
          nothingFound: 'Страницата не е намерена',
          sorryNotFound:
            'Няма такава страница в админа. Може адресът да е сгрешен или съдържанието да е изтрито.',
          backToDashboard: 'Към таблото',
          // An empty cell in a list: a dash, not «<Няма …>».
          noLabel: '—',
          // Leaving a form with changes: in the polite form, as the rest of the admin.
          leaveWithoutSaving: 'Напускане без запазване',
          changesNotSaved: 'Промените не са запазени. Ако напуснете сега, ще ги загубите.',
          stayOnThisPage: 'Останете на страницата',
          leaveAnyway: 'Напуснете без запазване',
        },
      },
    },
  },
  // Every list in the forms gets its Bulgarian words and a row label (src/fields/row-labels.ts).
  collections: [
    Users,
    Media,
    MediaTints,
    Offices,
    Courses,
    Groups,
    Prices,
    News,
    Programs,
    TextbookSystems,
    Certificates,
    Professions,
    Exams,
    TeacherProgrammes,
    FundedProjects,
    Documents,
    Team,
    LegalPages,
    Redirects,
    Inquiries,
    InquiryFiles,
  ].map(namedLists),
  globals: [Site, Navigation, Home, InquiryRouting, Contact, About].map(namedLists),
  jobs,
  localization: {
    locales: [
      { code: 'bg', label: 'Български' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'bg',
    // Must stay on: with `fallback: false` Payload also stops defaulting requests without a locale
    // to `bg`, and localized fields come back empty. The rule that English pages never silently
    // show Bulgarian in production is enforced where the site queries English content
    // (`fallbackLocale: false`), once English exists.
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // Schema changes always go through committed migrations, in every environment.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
    // The Docker image has no CLI, so production applies pending migrations on start.
    prodMigrations: migrations,
  }),
  graphQL: { disable: true },
  email: emailAdapter(),
  sharp,
  telemetry: false,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  onInit: async (payload) => {
    if (process.env.NODE_ENV === 'production') await seed(payload)
  },
})
