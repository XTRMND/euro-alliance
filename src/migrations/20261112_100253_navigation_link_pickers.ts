import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// docs/admin-redesign.md, decision 10: navigation links are picked, not typed. «This deploy
// migrates data.»
// up: every link's typed address (href) becomes a picked link: the programme whose page it is
//     (with its section, if the address had one), a course by its slug, a fixed page of the site,
//     or, when nothing matches, the same address typed (type custom). The log lists those.
// down: every picked link becomes its address again.
// The page list and the address rules are copied here as they were on 12.11.2026, so the
// migration keeps meaning the same thing if src/lib/nav-links.ts changes later.

const tables = [
  'navigation_header_left',
  'navigation_header_left_children',
  'navigation_header_right',
  'navigation_header_right_children',
  'navigation_menu',
  'navigation_menu_children',
  'navigation_footer_links',
]

const pages: Record<string, string> = {
  home: '/',
  courses: '/kursove',
  languageCourses: '/kursove?kategoria=ezitsi',
  languagesStudents: '/kursove?kategoria=ezitsi&auditoria=uchenitsi',
  languagesAdults: '/kursove?kategoria=ezitsi&auditoria=vazrastni',
  certificates: '/kursove?kategoria=izpiti-i-sertifikati',
  professions: '/profesionalno-obuchenie/profesii',
  vouchers: '/vaucheri',
  voucherInquiry: '/kontakti?tema=vaucheri',
  teachers: '/profesionalno-obuchenie/pedagogicheski-spetsialisti',
  farmers: '/profesionalno-obuchenie/zemedeltsi',
  computerCourses: '/kompyutarni-kursove',
  translations: '/prevodi',
  sendDocument: '/kontakti?tema=prevodi',
  levelTest: '/kontakti?tema=test-za-nivo',
  otherInquiry: '/kontakti?tema=drugo',
  news: '/novini',
  about: '/za-nas',
  aboutHistory: '/za-nas#istoria',
  contact: '/kontakti',
  privacy: '/poveritelnost',
  cookies: '/biskvitki',
  vocationalCourses: '/kursove?kategoria=profesionalno-obuchenie',
  'about-team': '/za-nas#ekip',
  'about-standards': '/za-nas#standarti',
  'about-licences': '/za-nas#litsenzi',
  'about-documents': '/za-nas#dokumenti',
  'about-projects': '/za-nas#proekti',
  'about-elearning': '/za-nas#elektronno-obuchenie',
  contactPlovdiv: '/kontakti#plovdiv',
  contactSofia: '/kontakti#sofia',
  search: '/tarsene',
}

const languageSegments: Record<string, string> = {
  english: 'angliyski',
  german: 'nemski',
  french: 'frenski',
  spanish: 'ispanski',
  italian: 'italianski',
  bulgarian: 'balgarski',
  russian: 'ruski',
}
const audienceSegments: Record<string, string> = { students: 'uchenitsi', adults: 'vazrastni' }
const programPaths: Record<string, string> = {
  vocational: '/profesionalno-obuchenie/profesii',
  teachers: '/profesionalno-obuchenie/pedagogicheski-spetsialisti',
  farmers: '/profesionalno-obuchenie/zemedeltsi',
  vouchers: '/vaucheri',
  computer: '/kompyutarni-kursove',
  translations: '/prevodi',
}

type Program = { id: number; type: string; language: string | null; audience: string | null }
type Course = { id: number; slug: string | null }
type Known = { programs: Program[]; courses: Course[] }
type Link = {
  type: string
  page?: string
  program?: number
  course?: number
  anchor?: string
  url?: string
}
type Row = {
  id: string
  type: string | null
  page: string | null
  program_id: number | null
  course_id: number | null
  anchor: string | null
  url: string | null
}

const programUrl = (program: Program) =>
  program.type === 'language'
    ? program.language && program.audience
      ? `/ezitsi/${languageSegments[program.language]}/${audienceSegments[program.audience]}`
      : undefined
    : programPaths[program.type]

async function knownPages(db: MigrateUpArgs['db']): Promise<Known> {
  const programs = await db.execute(
    sql`SELECT "id", "type", "language", "audience" FROM "programs"`,
  )
  const courses = await db.execute(
    sql`SELECT c."id", l."slug" FROM "courses" c LEFT JOIN "courses_locales" l ON l."_parent_id" = c."id" AND l."_locale" = 'bg'`,
  )
  return {
    programs: programs.rows as unknown as Program[],
    courses: courses.rows as unknown as Course[],
  }
}

function linkFromHref(href: string, known: Known): Link {
  const [path, anchor] = href.split('#', 2)
  const program = known.programs.find((candidate) => programUrl(candidate) === path)
  if (program) return { type: 'program', program: program.id, anchor }
  const course = path.startsWith('/kursove/')
    ? known.courses.find((candidate) => candidate.slug === path.slice('/kursove/'.length))
    : undefined
  if (course && !anchor) return { type: 'course', course: course.id }
  const page = Object.keys(pages).find((key) => pages[key] === href)
  return page ? { type: 'page', page } : { type: 'custom', url: href }
}

function hrefOf(row: Row, known: Known): string | undefined {
  if (row.type === 'page') return row.page ? pages[row.page] : undefined
  if (row.type === 'custom') return row.url ?? undefined
  if (row.type === 'course') {
    const slug = known.courses.find((course) => course.id === row.course_id)?.slug
    return slug ? `/kursove/${slug}` : undefined
  }
  const program = known.programs.find((candidate) => candidate.id === row.program_id)
  const url = program && programUrl(program)
  return url && row.anchor ? `${url}#${row.anchor}` : url
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_navigation_header_left_children_type" AS ENUM('page', 'program', 'course', 'custom');
  CREATE TYPE "public"."enum_navigation_header_left_children_page" AS ENUM('home', 'courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'aboutHistory', 'contact', 'privacy', 'cookies', 'vocationalCourses', 'about-team', 'about-standards', 'about-licences', 'about-documents', 'about-projects', 'about-elearning', 'contactPlovdiv', 'contactSofia', 'search');
  CREATE TYPE "public"."enum_navigation_header_left_type" AS ENUM('page', 'program', 'course', 'custom');
  CREATE TYPE "public"."enum_navigation_header_left_page" AS ENUM('home', 'courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'aboutHistory', 'contact', 'privacy', 'cookies', 'vocationalCourses', 'about-team', 'about-standards', 'about-licences', 'about-documents', 'about-projects', 'about-elearning', 'contactPlovdiv', 'contactSofia', 'search');
  CREATE TYPE "public"."enum_navigation_header_right_children_type" AS ENUM('page', 'program', 'course', 'custom');
  CREATE TYPE "public"."enum_navigation_header_right_children_page" AS ENUM('home', 'courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'aboutHistory', 'contact', 'privacy', 'cookies', 'vocationalCourses', 'about-team', 'about-standards', 'about-licences', 'about-documents', 'about-projects', 'about-elearning', 'contactPlovdiv', 'contactSofia', 'search');
  CREATE TYPE "public"."enum_navigation_header_right_type" AS ENUM('page', 'program', 'course', 'custom');
  CREATE TYPE "public"."enum_navigation_header_right_page" AS ENUM('home', 'courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'aboutHistory', 'contact', 'privacy', 'cookies', 'vocationalCourses', 'about-team', 'about-standards', 'about-licences', 'about-documents', 'about-projects', 'about-elearning', 'contactPlovdiv', 'contactSofia', 'search');
  CREATE TYPE "public"."enum_navigation_menu_children_type" AS ENUM('page', 'program', 'course', 'custom');
  CREATE TYPE "public"."enum_navigation_menu_children_page" AS ENUM('home', 'courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'aboutHistory', 'contact', 'privacy', 'cookies', 'vocationalCourses', 'about-team', 'about-standards', 'about-licences', 'about-documents', 'about-projects', 'about-elearning', 'contactPlovdiv', 'contactSofia', 'search');
  CREATE TYPE "public"."enum_navigation_menu_type" AS ENUM('page', 'program', 'course', 'custom');
  CREATE TYPE "public"."enum_navigation_menu_page" AS ENUM('home', 'courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'aboutHistory', 'contact', 'privacy', 'cookies', 'vocationalCourses', 'about-team', 'about-standards', 'about-licences', 'about-documents', 'about-projects', 'about-elearning', 'contactPlovdiv', 'contactSofia', 'search');
  CREATE TYPE "public"."enum_navigation_footer_links_type" AS ENUM('page', 'program', 'course', 'custom');
  CREATE TYPE "public"."enum_navigation_footer_links_page" AS ENUM('home', 'courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'aboutHistory', 'contact', 'privacy', 'cookies', 'vocationalCourses', 'about-team', 'about-standards', 'about-licences', 'about-documents', 'about-projects', 'about-elearning', 'contactPlovdiv', 'contactSofia', 'search');
  ALTER TABLE "navigation_header_left_children" ADD COLUMN "type" "enum_navigation_header_left_children_type" DEFAULT 'page';
  ALTER TABLE "navigation_header_left_children" ADD COLUMN "page" "enum_navigation_header_left_children_page";
  ALTER TABLE "navigation_header_left_children" ADD COLUMN "program_id" integer;
  ALTER TABLE "navigation_header_left_children" ADD COLUMN "anchor" varchar;
  ALTER TABLE "navigation_header_left_children" ADD COLUMN "course_id" integer;
  ALTER TABLE "navigation_header_left_children" ADD COLUMN "url" varchar;
  ALTER TABLE "navigation_header_left" ADD COLUMN "type" "enum_navigation_header_left_type" DEFAULT 'page';
  ALTER TABLE "navigation_header_left" ADD COLUMN "page" "enum_navigation_header_left_page";
  ALTER TABLE "navigation_header_left" ADD COLUMN "program_id" integer;
  ALTER TABLE "navigation_header_left" ADD COLUMN "anchor" varchar;
  ALTER TABLE "navigation_header_left" ADD COLUMN "course_id" integer;
  ALTER TABLE "navigation_header_left" ADD COLUMN "url" varchar;
  ALTER TABLE "navigation_header_right_children" ADD COLUMN "type" "enum_navigation_header_right_children_type" DEFAULT 'page';
  ALTER TABLE "navigation_header_right_children" ADD COLUMN "page" "enum_navigation_header_right_children_page";
  ALTER TABLE "navigation_header_right_children" ADD COLUMN "program_id" integer;
  ALTER TABLE "navigation_header_right_children" ADD COLUMN "anchor" varchar;
  ALTER TABLE "navigation_header_right_children" ADD COLUMN "course_id" integer;
  ALTER TABLE "navigation_header_right_children" ADD COLUMN "url" varchar;
  ALTER TABLE "navigation_header_right" ADD COLUMN "type" "enum_navigation_header_right_type" DEFAULT 'page';
  ALTER TABLE "navigation_header_right" ADD COLUMN "page" "enum_navigation_header_right_page";
  ALTER TABLE "navigation_header_right" ADD COLUMN "program_id" integer;
  ALTER TABLE "navigation_header_right" ADD COLUMN "anchor" varchar;
  ALTER TABLE "navigation_header_right" ADD COLUMN "course_id" integer;
  ALTER TABLE "navigation_header_right" ADD COLUMN "url" varchar;
  ALTER TABLE "navigation_menu_children" ADD COLUMN "type" "enum_navigation_menu_children_type" DEFAULT 'page';
  ALTER TABLE "navigation_menu_children" ADD COLUMN "page" "enum_navigation_menu_children_page";
  ALTER TABLE "navigation_menu_children" ADD COLUMN "program_id" integer;
  ALTER TABLE "navigation_menu_children" ADD COLUMN "anchor" varchar;
  ALTER TABLE "navigation_menu_children" ADD COLUMN "course_id" integer;
  ALTER TABLE "navigation_menu_children" ADD COLUMN "url" varchar;
  ALTER TABLE "navigation_menu" ADD COLUMN "type" "enum_navigation_menu_type" DEFAULT 'page';
  ALTER TABLE "navigation_menu" ADD COLUMN "page" "enum_navigation_menu_page";
  ALTER TABLE "navigation_menu" ADD COLUMN "program_id" integer;
  ALTER TABLE "navigation_menu" ADD COLUMN "anchor" varchar;
  ALTER TABLE "navigation_menu" ADD COLUMN "course_id" integer;
  ALTER TABLE "navigation_menu" ADD COLUMN "url" varchar;
  ALTER TABLE "navigation_footer_links" ADD COLUMN "type" "enum_navigation_footer_links_type" DEFAULT 'page';
  ALTER TABLE "navigation_footer_links" ADD COLUMN "page" "enum_navigation_footer_links_page";
  ALTER TABLE "navigation_footer_links" ADD COLUMN "program_id" integer;
  ALTER TABLE "navigation_footer_links" ADD COLUMN "anchor" varchar;
  ALTER TABLE "navigation_footer_links" ADD COLUMN "course_id" integer;
  ALTER TABLE "navigation_footer_links" ADD COLUMN "url" varchar;
  ALTER TABLE "navigation_header_left_children" ADD CONSTRAINT "navigation_header_left_children_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_left_children" ADD CONSTRAINT "navigation_header_left_children_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_left" ADD CONSTRAINT "navigation_header_left_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_left" ADD CONSTRAINT "navigation_header_left_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_right_children" ADD CONSTRAINT "navigation_header_right_children_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_right_children" ADD CONSTRAINT "navigation_header_right_children_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_right" ADD CONSTRAINT "navigation_header_right_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_right" ADD CONSTRAINT "navigation_header_right_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_menu_children" ADD CONSTRAINT "navigation_menu_children_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_menu_children" ADD CONSTRAINT "navigation_menu_children_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_menu" ADD CONSTRAINT "navigation_menu_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_menu" ADD CONSTRAINT "navigation_menu_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_links" ADD CONSTRAINT "navigation_footer_links_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_links" ADD CONSTRAINT "navigation_footer_links_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "navigation_header_left_children_program_idx" ON "navigation_header_left_children" USING btree ("program_id");
  CREATE INDEX "navigation_header_left_children_course_idx" ON "navigation_header_left_children" USING btree ("course_id");
  CREATE INDEX "navigation_header_left_program_idx" ON "navigation_header_left" USING btree ("program_id");
  CREATE INDEX "navigation_header_left_course_idx" ON "navigation_header_left" USING btree ("course_id");
  CREATE INDEX "navigation_header_right_children_program_idx" ON "navigation_header_right_children" USING btree ("program_id");
  CREATE INDEX "navigation_header_right_children_course_idx" ON "navigation_header_right_children" USING btree ("course_id");
  CREATE INDEX "navigation_header_right_program_idx" ON "navigation_header_right" USING btree ("program_id");
  CREATE INDEX "navigation_header_right_course_idx" ON "navigation_header_right" USING btree ("course_id");
  CREATE INDEX "navigation_menu_children_program_idx" ON "navigation_menu_children" USING btree ("program_id");
  CREATE INDEX "navigation_menu_children_course_idx" ON "navigation_menu_children" USING btree ("course_id");
  CREATE INDEX "navigation_menu_program_idx" ON "navigation_menu" USING btree ("program_id");
  CREATE INDEX "navigation_menu_course_idx" ON "navigation_menu" USING btree ("course_id");
  CREATE INDEX "navigation_footer_links_program_idx" ON "navigation_footer_links" USING btree ("program_id");
  CREATE INDEX "navigation_footer_links_course_idx" ON "navigation_footer_links" USING btree ("course_id");`)

  // Every typed address becomes a picked link; a group (a link without an address that opens
  // sub-links) has no target.
  const known = await knownPages(db)
  const custom: string[] = []
  for (const table of tables) {
    const { rows } = await db.execute(sql`SELECT "id", "href" FROM ${sql.identifier(table)}`)
    for (const row of rows as { id: string; href: string | null }[]) {
      if (!row.href) {
        await db.execute(
          sql`UPDATE ${sql.identifier(table)} SET "type" = NULL WHERE "id" = ${row.id}`,
        )
        continue
      }
      const link = linkFromHref(row.href, known)
      if (link.type === 'custom') custom.push(row.href)
      await db.execute(sql`UPDATE ${sql.identifier(table)} SET
        "type" = ${link.type}::${sql.raw(`"enum_${table}_type"`)},
        "page" = ${link.page ?? null}::${sql.raw(`"enum_${table}_page"`)},
        "program_id" = ${link.program ?? null}, "course_id" = ${link.course ?? null},
        "anchor" = ${link.anchor ?? null}, "url" = ${link.url ?? null}
        WHERE "id" = ${row.id}`)
    }
  }
  payload.logger.info(
    custom.length
      ? `Navigation: ${custom.length} address(es) matched no page, programme or course and stay typed: ${[...new Set(custom)].join(', ')}`
      : 'Navigation: every address became a picked link.',
  )

  await db.execute(sql`
  ALTER TABLE "navigation_header_left_children" DROP COLUMN "href";
  ALTER TABLE "navigation_header_left" DROP COLUMN "href";
  ALTER TABLE "navigation_header_right_children" DROP COLUMN "href";
  ALTER TABLE "navigation_header_right" DROP COLUMN "href";
  ALTER TABLE "navigation_menu_children" DROP COLUMN "href";
  ALTER TABLE "navigation_menu" DROP COLUMN "href";
  ALTER TABLE "navigation_footer_links" DROP COLUMN "href";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "navigation_header_left_children" ADD COLUMN "href" varchar;
  ALTER TABLE "navigation_header_left" ADD COLUMN "href" varchar;
  ALTER TABLE "navigation_header_right_children" ADD COLUMN "href" varchar;
  ALTER TABLE "navigation_header_right" ADD COLUMN "href" varchar;
  ALTER TABLE "navigation_menu_children" ADD COLUMN "href" varchar;
  ALTER TABLE "navigation_menu" ADD COLUMN "href" varchar;
  ALTER TABLE "navigation_footer_links" ADD COLUMN "href" varchar;`)

  // Every picked link becomes its address again. A link to a programme or course that's gone has
  // none: it gets «/», so the column can be required again.
  const known = await knownPages(db)
  for (const table of tables) {
    const { rows } = await db.execute(
      sql`SELECT "id", "type", "page", "program_id", "course_id", "anchor", "url" FROM ${sql.identifier(table)}`,
    )
    for (const row of rows as Row[]) {
      const href = row.type ? (hrefOf(row, known) ?? '/') : null
      await db.execute(
        sql`UPDATE ${sql.identifier(table)} SET "href" = ${href} WHERE "id" = ${row.id}`,
      )
    }
  }
  // Sub-links and footer links need an address; a group itself has none.
  await db.execute(sql`
  UPDATE "navigation_header_left_children" SET "href" = '/' WHERE "href" IS NULL;
  UPDATE "navigation_header_right_children" SET "href" = '/' WHERE "href" IS NULL;
  UPDATE "navigation_menu_children" SET "href" = '/' WHERE "href" IS NULL;
  UPDATE "navigation_footer_links" SET "href" = '/' WHERE "href" IS NULL;`)

  await db.execute(sql`
  ALTER TABLE "navigation_header_left_children" ALTER COLUMN "href" SET NOT NULL;
  ALTER TABLE "navigation_header_right_children" ALTER COLUMN "href" SET NOT NULL;
  ALTER TABLE "navigation_menu_children" ALTER COLUMN "href" SET NOT NULL;
  ALTER TABLE "navigation_footer_links" ALTER COLUMN "href" SET NOT NULL;
   ALTER TABLE "navigation_header_left_children" DROP CONSTRAINT "navigation_header_left_children_program_id_programs_id_fk";
  
  ALTER TABLE "navigation_header_left_children" DROP CONSTRAINT "navigation_header_left_children_course_id_courses_id_fk";
  
  ALTER TABLE "navigation_header_left" DROP CONSTRAINT "navigation_header_left_program_id_programs_id_fk";
  
  ALTER TABLE "navigation_header_left" DROP CONSTRAINT "navigation_header_left_course_id_courses_id_fk";
  
  ALTER TABLE "navigation_header_right_children" DROP CONSTRAINT "navigation_header_right_children_program_id_programs_id_fk";
  
  ALTER TABLE "navigation_header_right_children" DROP CONSTRAINT "navigation_header_right_children_course_id_courses_id_fk";
  
  ALTER TABLE "navigation_header_right" DROP CONSTRAINT "navigation_header_right_program_id_programs_id_fk";
  
  ALTER TABLE "navigation_header_right" DROP CONSTRAINT "navigation_header_right_course_id_courses_id_fk";
  
  ALTER TABLE "navigation_menu_children" DROP CONSTRAINT "navigation_menu_children_program_id_programs_id_fk";
  
  ALTER TABLE "navigation_menu_children" DROP CONSTRAINT "navigation_menu_children_course_id_courses_id_fk";
  
  ALTER TABLE "navigation_menu" DROP CONSTRAINT "navigation_menu_program_id_programs_id_fk";
  
  ALTER TABLE "navigation_menu" DROP CONSTRAINT "navigation_menu_course_id_courses_id_fk";
  
  ALTER TABLE "navigation_footer_links" DROP CONSTRAINT "navigation_footer_links_program_id_programs_id_fk";
  
  ALTER TABLE "navigation_footer_links" DROP CONSTRAINT "navigation_footer_links_course_id_courses_id_fk";
  
  DROP INDEX "navigation_header_left_children_program_idx";
  DROP INDEX "navigation_header_left_children_course_idx";
  DROP INDEX "navigation_header_left_program_idx";
  DROP INDEX "navigation_header_left_course_idx";
  DROP INDEX "navigation_header_right_children_program_idx";
  DROP INDEX "navigation_header_right_children_course_idx";
  DROP INDEX "navigation_header_right_program_idx";
  DROP INDEX "navigation_header_right_course_idx";
  DROP INDEX "navigation_menu_children_program_idx";
  DROP INDEX "navigation_menu_children_course_idx";
  DROP INDEX "navigation_menu_program_idx";
  DROP INDEX "navigation_menu_course_idx";
  DROP INDEX "navigation_footer_links_program_idx";
  DROP INDEX "navigation_footer_links_course_idx";
  ALTER TABLE "navigation_header_left_children" DROP COLUMN "type";
  ALTER TABLE "navigation_header_left_children" DROP COLUMN "page";
  ALTER TABLE "navigation_header_left_children" DROP COLUMN "program_id";
  ALTER TABLE "navigation_header_left_children" DROP COLUMN "anchor";
  ALTER TABLE "navigation_header_left_children" DROP COLUMN "course_id";
  ALTER TABLE "navigation_header_left_children" DROP COLUMN "url";
  ALTER TABLE "navigation_header_left" DROP COLUMN "type";
  ALTER TABLE "navigation_header_left" DROP COLUMN "page";
  ALTER TABLE "navigation_header_left" DROP COLUMN "program_id";
  ALTER TABLE "navigation_header_left" DROP COLUMN "anchor";
  ALTER TABLE "navigation_header_left" DROP COLUMN "course_id";
  ALTER TABLE "navigation_header_left" DROP COLUMN "url";
  ALTER TABLE "navigation_header_right_children" DROP COLUMN "type";
  ALTER TABLE "navigation_header_right_children" DROP COLUMN "page";
  ALTER TABLE "navigation_header_right_children" DROP COLUMN "program_id";
  ALTER TABLE "navigation_header_right_children" DROP COLUMN "anchor";
  ALTER TABLE "navigation_header_right_children" DROP COLUMN "course_id";
  ALTER TABLE "navigation_header_right_children" DROP COLUMN "url";
  ALTER TABLE "navigation_header_right" DROP COLUMN "type";
  ALTER TABLE "navigation_header_right" DROP COLUMN "page";
  ALTER TABLE "navigation_header_right" DROP COLUMN "program_id";
  ALTER TABLE "navigation_header_right" DROP COLUMN "anchor";
  ALTER TABLE "navigation_header_right" DROP COLUMN "course_id";
  ALTER TABLE "navigation_header_right" DROP COLUMN "url";
  ALTER TABLE "navigation_menu_children" DROP COLUMN "type";
  ALTER TABLE "navigation_menu_children" DROP COLUMN "page";
  ALTER TABLE "navigation_menu_children" DROP COLUMN "program_id";
  ALTER TABLE "navigation_menu_children" DROP COLUMN "anchor";
  ALTER TABLE "navigation_menu_children" DROP COLUMN "course_id";
  ALTER TABLE "navigation_menu_children" DROP COLUMN "url";
  ALTER TABLE "navigation_menu" DROP COLUMN "type";
  ALTER TABLE "navigation_menu" DROP COLUMN "page";
  ALTER TABLE "navigation_menu" DROP COLUMN "program_id";
  ALTER TABLE "navigation_menu" DROP COLUMN "anchor";
  ALTER TABLE "navigation_menu" DROP COLUMN "course_id";
  ALTER TABLE "navigation_menu" DROP COLUMN "url";
  ALTER TABLE "navigation_footer_links" DROP COLUMN "type";
  ALTER TABLE "navigation_footer_links" DROP COLUMN "page";
  ALTER TABLE "navigation_footer_links" DROP COLUMN "program_id";
  ALTER TABLE "navigation_footer_links" DROP COLUMN "anchor";
  ALTER TABLE "navigation_footer_links" DROP COLUMN "course_id";
  ALTER TABLE "navigation_footer_links" DROP COLUMN "url";
  DROP TYPE "public"."enum_navigation_header_left_children_type";
  DROP TYPE "public"."enum_navigation_header_left_children_page";
  DROP TYPE "public"."enum_navigation_header_left_type";
  DROP TYPE "public"."enum_navigation_header_left_page";
  DROP TYPE "public"."enum_navigation_header_right_children_type";
  DROP TYPE "public"."enum_navigation_header_right_children_page";
  DROP TYPE "public"."enum_navigation_header_right_type";
  DROP TYPE "public"."enum_navigation_header_right_page";
  DROP TYPE "public"."enum_navigation_menu_children_type";
  DROP TYPE "public"."enum_navigation_menu_children_page";
  DROP TYPE "public"."enum_navigation_menu_type";
  DROP TYPE "public"."enum_navigation_menu_page";
  DROP TYPE "public"."enum_navigation_footer_links_type";
  DROP TYPE "public"."enum_navigation_footer_links_page";`)
}
