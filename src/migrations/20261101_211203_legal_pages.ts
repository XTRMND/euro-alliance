import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_legal_pages_page" AS ENUM('privacy', 'cookies');
  CREATE TYPE "public"."enum_legal_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__legal_pages_v_version_page" AS ENUM('privacy', 'cookies');
  CREATE TYPE "public"."enum__legal_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__legal_pages_v_published_locale" AS ENUM('bg', 'en');
  ALTER TYPE "public"."enum_programs_hero_ctas_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum_programs_hero_ctas_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum_programs_blocks_features_callout_cta_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum_programs_blocks_features_callout_cta_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum_programs_blocks_steps_callout_cta_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum_programs_blocks_steps_callout_cta_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum_programs_blocks_textbook_systems_link_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum_programs_blocks_textbook_systems_link_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum_programs_blocks_system_cards_link_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum_programs_blocks_system_cards_link_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum_programs_blocks_callout_cta_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum_programs_blocks_callout_cta_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum__programs_v_version_hero_ctas_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum__programs_v_version_hero_ctas_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum__programs_v_blocks_features_callout_cta_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum__programs_v_blocks_features_callout_cta_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum__programs_v_blocks_steps_callout_cta_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum__programs_v_blocks_steps_callout_cta_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum__programs_v_blocks_system_cards_link_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum__programs_v_blocks_system_cards_link_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum__programs_v_blocks_callout_cta_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum__programs_v_blocks_callout_cta_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum_home_programs_cards_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum_home_programs_cards_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum_home_hero_primary_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum_home_hero_primary_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum_home_hero_secondary_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum_home_hero_secondary_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum_home_translations_cta_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum_home_translations_cta_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum_about_licences_links_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum_about_licences_links_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum_about_hero_primary_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum_about_hero_primary_destination" ADD VALUE 'cookies';
  ALTER TYPE "public"."enum_about_hero_secondary_destination" ADD VALUE 'privacy';
  ALTER TYPE "public"."enum_about_hero_secondary_destination" ADD VALUE 'cookies';
  CREATE TABLE "legal_pages_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "legal_pages_sections_locales" (
  	"heading" varchar,
  	"toc_label" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "legal_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"page" "enum_legal_pages_page",
  	"updated_on" timestamp(3) with time zone,
  	"pdf_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_legal_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "legal_pages_locales" (
  	"title" varchar,
  	"highlight" varchar,
  	"kicker" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_legal_pages_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_legal_pages_v_version_sections_locales" (
  	"heading" varchar,
  	"toc_label" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_legal_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_page" "enum__legal_pages_v_version_page",
  	"version_updated_on" timestamp(3) with time zone,
  	"version_pdf_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__legal_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__legal_pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_legal_pages_v_locales" (
  	"version_title" varchar,
  	"version_highlight" varchar,
  	"version_kicker" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "legal_pages_id" integer;
  ALTER TABLE "legal_pages_sections" ADD CONSTRAINT "legal_pages_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_pages_sections_locales" ADD CONSTRAINT "legal_pages_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_pages" ADD CONSTRAINT "legal_pages_pdf_id_media_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_pages_locales" ADD CONSTRAINT "legal_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_legal_pages_v_version_sections" ADD CONSTRAINT "_legal_pages_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_legal_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_legal_pages_v_version_sections_locales" ADD CONSTRAINT "_legal_pages_v_version_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_legal_pages_v_version_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_legal_pages_v" ADD CONSTRAINT "_legal_pages_v_parent_id_legal_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_legal_pages_v" ADD CONSTRAINT "_legal_pages_v_version_pdf_id_media_id_fk" FOREIGN KEY ("version_pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_legal_pages_v_locales" ADD CONSTRAINT "_legal_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_legal_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "legal_pages_sections_order_idx" ON "legal_pages_sections" USING btree ("_order");
  CREATE INDEX "legal_pages_sections_parent_id_idx" ON "legal_pages_sections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "legal_pages_sections_locales_locale_parent_id_unique" ON "legal_pages_sections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "legal_pages_sections_locales_parent_id_idx" ON "legal_pages_sections_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "legal_pages_page_idx" ON "legal_pages" USING btree ("page");
  CREATE INDEX "legal_pages_pdf_idx" ON "legal_pages" USING btree ("pdf_id");
  CREATE INDEX "legal_pages_updated_at_idx" ON "legal_pages" USING btree ("updated_at");
  CREATE INDEX "legal_pages_created_at_idx" ON "legal_pages" USING btree ("created_at");
  CREATE INDEX "legal_pages__status_idx" ON "legal_pages" USING btree ("_status");
  CREATE UNIQUE INDEX "legal_pages_locales_locale_parent_id_unique" ON "legal_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "legal_pages_locales_parent_id_idx" ON "legal_pages_locales" USING btree ("_parent_id");
  CREATE INDEX "_legal_pages_v_version_sections_order_idx" ON "_legal_pages_v_version_sections" USING btree ("_order");
  CREATE INDEX "_legal_pages_v_version_sections_parent_id_idx" ON "_legal_pages_v_version_sections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_legal_pages_v_version_sections_locales_locale_parent_id_uni" ON "_legal_pages_v_version_sections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_legal_pages_v_version_sections_locales_parent_id_idx" ON "_legal_pages_v_version_sections_locales" USING btree ("_parent_id");
  CREATE INDEX "_legal_pages_v_parent_idx" ON "_legal_pages_v" USING btree ("parent_id");
  CREATE INDEX "_legal_pages_v_version_version_page_idx" ON "_legal_pages_v" USING btree ("version_page");
  CREATE INDEX "_legal_pages_v_version_version_pdf_idx" ON "_legal_pages_v" USING btree ("version_pdf_id");
  CREATE INDEX "_legal_pages_v_version_version_updated_at_idx" ON "_legal_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_legal_pages_v_version_version_created_at_idx" ON "_legal_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_legal_pages_v_version_version__status_idx" ON "_legal_pages_v" USING btree ("version__status");
  CREATE INDEX "_legal_pages_v_created_at_idx" ON "_legal_pages_v" USING btree ("created_at");
  CREATE INDEX "_legal_pages_v_updated_at_idx" ON "_legal_pages_v" USING btree ("updated_at");
  CREATE INDEX "_legal_pages_v_snapshot_idx" ON "_legal_pages_v" USING btree ("snapshot");
  CREATE INDEX "_legal_pages_v_published_locale_idx" ON "_legal_pages_v" USING btree ("published_locale");
  CREATE INDEX "_legal_pages_v_latest_idx" ON "_legal_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_legal_pages_v_locales_locale_parent_id_unique" ON "_legal_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_legal_pages_v_locales_parent_id_idx" ON "_legal_pages_v_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legal_pages_fk" FOREIGN KEY ("legal_pages_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_legal_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("legal_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "legal_pages_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "legal_pages_sections_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "legal_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "legal_pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_legal_pages_v_version_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_legal_pages_v_version_sections_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_legal_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_legal_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "legal_pages_sections" CASCADE;
  DROP TABLE "legal_pages_sections_locales" CASCADE;
  DROP TABLE "legal_pages" CASCADE;
  DROP TABLE "legal_pages_locales" CASCADE;
  DROP TABLE "_legal_pages_v_version_sections" CASCADE;
  DROP TABLE "_legal_pages_v_version_sections_locales" CASCADE;
  DROP TABLE "_legal_pages_v" CASCADE;
  DROP TABLE "_legal_pages_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_legal_pages_fk";
  
  ALTER TABLE "programs_hero_ctas" ALTER COLUMN "destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_hero_ctas_destination";
  CREATE TYPE "public"."enum_programs_hero_ctas_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "programs_hero_ctas" ALTER COLUMN "destination" SET DATA TYPE "public"."enum_programs_hero_ctas_destination" USING "destination"::"public"."enum_programs_hero_ctas_destination";
  ALTER TABLE "programs_blocks_features" ALTER COLUMN "callout_cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_blocks_features_callout_cta_destination";
  CREATE TYPE "public"."enum_programs_blocks_features_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "programs_blocks_features" ALTER COLUMN "callout_cta_destination" SET DATA TYPE "public"."enum_programs_blocks_features_callout_cta_destination" USING "callout_cta_destination"::"public"."enum_programs_blocks_features_callout_cta_destination";
  ALTER TABLE "programs_blocks_steps" ALTER COLUMN "callout_cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_blocks_steps_callout_cta_destination";
  CREATE TYPE "public"."enum_programs_blocks_steps_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "programs_blocks_steps" ALTER COLUMN "callout_cta_destination" SET DATA TYPE "public"."enum_programs_blocks_steps_callout_cta_destination" USING "callout_cta_destination"::"public"."enum_programs_blocks_steps_callout_cta_destination";
  ALTER TABLE "programs_blocks_textbook_systems" ALTER COLUMN "link_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_blocks_textbook_systems_link_destination";
  CREATE TYPE "public"."enum_programs_blocks_textbook_systems_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "programs_blocks_textbook_systems" ALTER COLUMN "link_destination" SET DATA TYPE "public"."enum_programs_blocks_textbook_systems_link_destination" USING "link_destination"::"public"."enum_programs_blocks_textbook_systems_link_destination";
  ALTER TABLE "programs_blocks_system_cards" ALTER COLUMN "link_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_blocks_system_cards_link_destination";
  CREATE TYPE "public"."enum_programs_blocks_system_cards_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "programs_blocks_system_cards" ALTER COLUMN "link_destination" SET DATA TYPE "public"."enum_programs_blocks_system_cards_link_destination" USING "link_destination"::"public"."enum_programs_blocks_system_cards_link_destination";
  ALTER TABLE "programs_blocks_callout" ALTER COLUMN "cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_blocks_callout_cta_destination";
  CREATE TYPE "public"."enum_programs_blocks_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "programs_blocks_callout" ALTER COLUMN "cta_destination" SET DATA TYPE "public"."enum_programs_blocks_callout_cta_destination" USING "cta_destination"::"public"."enum_programs_blocks_callout_cta_destination";
  ALTER TABLE "_programs_v_version_hero_ctas" ALTER COLUMN "destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_version_hero_ctas_destination";
  CREATE TYPE "public"."enum__programs_v_version_hero_ctas_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_version_hero_ctas" ALTER COLUMN "destination" SET DATA TYPE "public"."enum__programs_v_version_hero_ctas_destination" USING "destination"::"public"."enum__programs_v_version_hero_ctas_destination";
  ALTER TABLE "_programs_v_blocks_features" ALTER COLUMN "callout_cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_blocks_features_callout_cta_destination";
  CREATE TYPE "public"."enum__programs_v_blocks_features_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_blocks_features" ALTER COLUMN "callout_cta_destination" SET DATA TYPE "public"."enum__programs_v_blocks_features_callout_cta_destination" USING "callout_cta_destination"::"public"."enum__programs_v_blocks_features_callout_cta_destination";
  ALTER TABLE "_programs_v_blocks_steps" ALTER COLUMN "callout_cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_blocks_steps_callout_cta_destination";
  CREATE TYPE "public"."enum__programs_v_blocks_steps_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_blocks_steps" ALTER COLUMN "callout_cta_destination" SET DATA TYPE "public"."enum__programs_v_blocks_steps_callout_cta_destination" USING "callout_cta_destination"::"public"."enum__programs_v_blocks_steps_callout_cta_destination";
  ALTER TABLE "_programs_v_blocks_textbook_systems" ALTER COLUMN "link_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination";
  CREATE TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_blocks_textbook_systems" ALTER COLUMN "link_destination" SET DATA TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination" USING "link_destination"::"public"."enum__programs_v_blocks_textbook_systems_link_destination";
  ALTER TABLE "_programs_v_blocks_system_cards" ALTER COLUMN "link_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_blocks_system_cards_link_destination";
  CREATE TYPE "public"."enum__programs_v_blocks_system_cards_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_blocks_system_cards" ALTER COLUMN "link_destination" SET DATA TYPE "public"."enum__programs_v_blocks_system_cards_link_destination" USING "link_destination"::"public"."enum__programs_v_blocks_system_cards_link_destination";
  ALTER TABLE "_programs_v_blocks_callout" ALTER COLUMN "cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_blocks_callout_cta_destination";
  CREATE TYPE "public"."enum__programs_v_blocks_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_blocks_callout" ALTER COLUMN "cta_destination" SET DATA TYPE "public"."enum__programs_v_blocks_callout_cta_destination" USING "cta_destination"::"public"."enum__programs_v_blocks_callout_cta_destination";
  ALTER TABLE "home_programs_cards" ALTER COLUMN "destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_programs_cards_destination";
  CREATE TYPE "public"."enum_home_programs_cards_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "home_programs_cards" ALTER COLUMN "destination" SET DATA TYPE "public"."enum_home_programs_cards_destination" USING "destination"::"public"."enum_home_programs_cards_destination";
  ALTER TABLE "home" ALTER COLUMN "hero_primary_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_hero_primary_destination";
  CREATE TYPE "public"."enum_home_hero_primary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "home" ALTER COLUMN "hero_primary_destination" SET DATA TYPE "public"."enum_home_hero_primary_destination" USING "hero_primary_destination"::"public"."enum_home_hero_primary_destination";
  ALTER TABLE "home" ALTER COLUMN "hero_secondary_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_hero_secondary_destination";
  CREATE TYPE "public"."enum_home_hero_secondary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "home" ALTER COLUMN "hero_secondary_destination" SET DATA TYPE "public"."enum_home_hero_secondary_destination" USING "hero_secondary_destination"::"public"."enum_home_hero_secondary_destination";
  ALTER TABLE "home" ALTER COLUMN "translations_cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_translations_cta_destination";
  CREATE TYPE "public"."enum_home_translations_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "home" ALTER COLUMN "translations_cta_destination" SET DATA TYPE "public"."enum_home_translations_cta_destination" USING "translations_cta_destination"::"public"."enum_home_translations_cta_destination";
  ALTER TABLE "about_licences_links" ALTER COLUMN "destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_about_licences_links_destination";
  CREATE TYPE "public"."enum_about_licences_links_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "about_licences_links" ALTER COLUMN "destination" SET DATA TYPE "public"."enum_about_licences_links_destination" USING "destination"::"public"."enum_about_licences_links_destination";
  ALTER TABLE "about" ALTER COLUMN "hero_primary_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_about_hero_primary_destination";
  CREATE TYPE "public"."enum_about_hero_primary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "about" ALTER COLUMN "hero_primary_destination" SET DATA TYPE "public"."enum_about_hero_primary_destination" USING "hero_primary_destination"::"public"."enum_about_hero_primary_destination";
  ALTER TABLE "about" ALTER COLUMN "hero_secondary_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_about_hero_secondary_destination";
  CREATE TYPE "public"."enum_about_hero_secondary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "about" ALTER COLUMN "hero_secondary_destination" SET DATA TYPE "public"."enum_about_hero_secondary_destination" USING "hero_secondary_destination"::"public"."enum_about_hero_secondary_destination";
  DROP INDEX "payload_locked_documents_rels_legal_pages_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "legal_pages_id";
  DROP TYPE "public"."enum_legal_pages_page";
  DROP TYPE "public"."enum_legal_pages_status";
  DROP TYPE "public"."enum__legal_pages_v_version_page";
  DROP TYPE "public"."enum__legal_pages_v_version_status";
  DROP TYPE "public"."enum__legal_pages_v_published_locale";`)
}
