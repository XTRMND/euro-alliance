import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { bg } from '@payloadcms/translations/languages/bg'
import { en } from '@payloadcms/translations/languages/en'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Certificates } from './collections/Certificates'
import { Courses } from './collections/Courses'
import { Documents } from './collections/Documents'
import { Exams } from './collections/Exams'
import { Groups } from './collections/Groups'
import { FundedProjects } from './collections/FundedProjects'
import { LegalPages } from './collections/LegalPages'
import { SearchIndex } from './collections/SearchIndex'
import { MissingAddresses } from './collections/MissingAddresses'
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
import { Translation } from './globals/Translation'
import { jobs } from './jobs'
import { emailAdapter } from './lib/email'
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
    meta: { titleSuffix: ' · Евро Алианс' },
  },
  i18n: { supportedLanguages: { bg, en }, fallbackLanguage: 'bg' },
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
    SearchIndex,
    Redirects,
    MissingAddresses,
    Inquiries,
    InquiryFiles,
  ],
  globals: [Site, Navigation, Home, Translation, InquiryRouting, Contact, About],
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
