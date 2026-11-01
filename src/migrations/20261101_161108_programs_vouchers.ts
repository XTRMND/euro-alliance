import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_programs_blocks_steps_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum_programs_blocks_system_cards_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum_programs_blocks_system_cards_columns" AS ENUM('two', 'one');
  CREATE TYPE "public"."enum__programs_v_blocks_steps_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum__programs_v_blocks_system_cards_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum__programs_v_blocks_system_cards_columns" AS ENUM('two', 'one');
  ALTER TYPE "public"."enum_programs_hero_ctas_destination" ADD VALUE 'voucherInquiry' BEFORE 'teachers';
  ALTER TYPE "public"."enum_programs_blocks_textbook_systems_link_destination" ADD VALUE 'voucherInquiry' BEFORE 'teachers';
  ALTER TYPE "public"."enum_programs_blocks_callout_cta_destination" ADD VALUE 'voucherInquiry' BEFORE 'teachers';
  ALTER TYPE "public"."enum__programs_v_version_hero_ctas_destination" ADD VALUE 'voucherInquiry' BEFORE 'teachers';
  ALTER TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination" ADD VALUE 'voucherInquiry' BEFORE 'teachers';
  ALTER TYPE "public"."enum__programs_v_blocks_callout_cta_destination" ADD VALUE 'voucherInquiry' BEFORE 'teachers';
  ALTER TYPE "public"."enum_home_programs_cards_destination" ADD VALUE 'voucherInquiry' BEFORE 'teachers';
  ALTER TYPE "public"."enum_home_hero_primary_destination" ADD VALUE 'voucherInquiry' BEFORE 'teachers';
  ALTER TYPE "public"."enum_home_hero_secondary_destination" ADD VALUE 'voucherInquiry' BEFORE 'teachers';
  ALTER TYPE "public"."enum_home_translations_cta_destination" ADD VALUE 'voucherInquiry' BEFORE 'teachers';
  CREATE TABLE "programs_blocks_system_cards_cards_levels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programs_blocks_system_cards_cards_levels_locales" (
  	"level" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_system_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"count" varchar
  );
  
  CREATE TABLE "programs_blocks_system_cards_cards_locales" (
  	"name" varchar,
  	"kicker" varchar,
  	"count_label" varchar,
  	"description" varchar,
  	"strip_label" varchar,
  	"strip_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_system_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"link_destination" "enum_programs_blocks_system_cards_link_destination",
  	"columns" "enum_programs_blocks_system_cards_columns" DEFAULT 'one',
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_system_cards_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_system_cards_cards_levels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_system_cards_cards_levels_locales" (
  	"level" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_system_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"count" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_system_cards_cards_locales" (
  	"name" varchar,
  	"kicker" varchar,
  	"count_label" varchar,
  	"description" varchar,
  	"strip_label" varchar,
  	"strip_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_system_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"link_destination" "enum__programs_v_blocks_system_cards_link_destination",
  	"columns" "enum__programs_v_blocks_system_cards_columns" DEFAULT 'one',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_system_cards_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "programs_hero_ctas" ADD COLUMN "anchor" varchar;
  ALTER TABLE "programs_blocks_features" ADD COLUMN "anchor" varchar;
  ALTER TABLE "programs_blocks_levels" ADD COLUMN "anchor" varchar;
  ALTER TABLE "programs_blocks_steps" ADD COLUMN "anchor" varchar;
  ALTER TABLE "programs_blocks_steps" ADD COLUMN "callout_cta_destination" "enum_programs_blocks_steps_callout_cta_destination";
  ALTER TABLE "programs_blocks_steps_locales" ADD COLUMN "callout_heading" varchar;
  ALTER TABLE "programs_blocks_steps_locales" ADD COLUMN "callout_text" varchar;
  ALTER TABLE "programs_blocks_steps_locales" ADD COLUMN "callout_cta_label" varchar;
  ALTER TABLE "programs_blocks_steps_locales" ADD COLUMN "note" varchar;
  ALTER TABLE "programs_blocks_textbook_systems" ADD COLUMN "anchor" varchar;
  ALTER TABLE "programs_blocks_certificates" ADD COLUMN "anchor" varchar;
  ALTER TABLE "programs_blocks_faq" ADD COLUMN "anchor" varchar;
  ALTER TABLE "programs_blocks_figures" ADD COLUMN "anchor" varchar;
  ALTER TABLE "programs_blocks_rich_text" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_programs_v_version_hero_ctas" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_programs_v_blocks_features" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_programs_v_blocks_levels" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_programs_v_blocks_steps" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_programs_v_blocks_steps" ADD COLUMN "callout_cta_destination" "enum__programs_v_blocks_steps_callout_cta_destination";
  ALTER TABLE "_programs_v_blocks_steps_locales" ADD COLUMN "callout_heading" varchar;
  ALTER TABLE "_programs_v_blocks_steps_locales" ADD COLUMN "callout_text" varchar;
  ALTER TABLE "_programs_v_blocks_steps_locales" ADD COLUMN "callout_cta_label" varchar;
  ALTER TABLE "_programs_v_blocks_steps_locales" ADD COLUMN "note" varchar;
  ALTER TABLE "_programs_v_blocks_textbook_systems" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_programs_v_blocks_certificates" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_programs_v_blocks_faq" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_programs_v_blocks_figures" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_programs_v_blocks_rich_text" ADD COLUMN "anchor" varchar;
  ALTER TABLE "programs_blocks_system_cards_cards_levels" ADD CONSTRAINT "programs_blocks_system_cards_cards_levels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_system_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_system_cards_cards_levels_locales" ADD CONSTRAINT "programs_blocks_system_cards_cards_levels_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_system_cards_cards_levels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_system_cards_cards" ADD CONSTRAINT "programs_blocks_system_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_system_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_system_cards_cards_locales" ADD CONSTRAINT "programs_blocks_system_cards_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_system_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_system_cards" ADD CONSTRAINT "programs_blocks_system_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_system_cards_locales" ADD CONSTRAINT "programs_blocks_system_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_system_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_system_cards_cards_levels" ADD CONSTRAINT "_programs_v_blocks_system_cards_cards_levels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_system_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_system_cards_cards_levels_locales" ADD CONSTRAINT "_programs_v_blocks_system_cards_cards_levels_locales_pare_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_system_cards_cards_levels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_system_cards_cards" ADD CONSTRAINT "_programs_v_blocks_system_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_system_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_system_cards_cards_locales" ADD CONSTRAINT "_programs_v_blocks_system_cards_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_system_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_system_cards" ADD CONSTRAINT "_programs_v_blocks_system_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_system_cards_locales" ADD CONSTRAINT "_programs_v_blocks_system_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_system_cards"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "programs_blocks_system_cards_cards_levels_order_idx" ON "programs_blocks_system_cards_cards_levels" USING btree ("_order");
  CREATE INDEX "programs_blocks_system_cards_cards_levels_parent_id_idx" ON "programs_blocks_system_cards_cards_levels" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_system_cards_cards_levels_locales_locale_par" ON "programs_blocks_system_cards_cards_levels_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_system_cards_cards_levels_locales_parent_idx" ON "programs_blocks_system_cards_cards_levels_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_system_cards_cards_order_idx" ON "programs_blocks_system_cards_cards" USING btree ("_order");
  CREATE INDEX "programs_blocks_system_cards_cards_parent_id_idx" ON "programs_blocks_system_cards_cards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_system_cards_cards_locales_locale_parent_id_" ON "programs_blocks_system_cards_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_system_cards_cards_locales_parent_id_idx" ON "programs_blocks_system_cards_cards_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_system_cards_order_idx" ON "programs_blocks_system_cards" USING btree ("_order");
  CREATE INDEX "programs_blocks_system_cards_parent_id_idx" ON "programs_blocks_system_cards" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_system_cards_path_idx" ON "programs_blocks_system_cards" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_system_cards_locales_locale_parent_id_unique" ON "programs_blocks_system_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_system_cards_locales_parent_id_idx" ON "programs_blocks_system_cards_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_system_cards_cards_levels_order_idx" ON "_programs_v_blocks_system_cards_cards_levels" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_system_cards_cards_levels_parent_id_idx" ON "_programs_v_blocks_system_cards_cards_levels" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_system_cards_cards_levels_locales_locale_" ON "_programs_v_blocks_system_cards_cards_levels_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_system_cards_cards_levels_locales_par_idx" ON "_programs_v_blocks_system_cards_cards_levels_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_system_cards_cards_order_idx" ON "_programs_v_blocks_system_cards_cards" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_system_cards_cards_parent_id_idx" ON "_programs_v_blocks_system_cards_cards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_system_cards_cards_locales_locale_parent_" ON "_programs_v_blocks_system_cards_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_system_cards_cards_locales_parent_id_idx" ON "_programs_v_blocks_system_cards_cards_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_system_cards_order_idx" ON "_programs_v_blocks_system_cards" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_system_cards_parent_id_idx" ON "_programs_v_blocks_system_cards" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_system_cards_path_idx" ON "_programs_v_blocks_system_cards" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_system_cards_locales_locale_parent_id_uni" ON "_programs_v_blocks_system_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_system_cards_locales_parent_id_idx" ON "_programs_v_blocks_system_cards_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "programs_blocks_system_cards_cards_levels" CASCADE;
  DROP TABLE "programs_blocks_system_cards_cards_levels_locales" CASCADE;
  DROP TABLE "programs_blocks_system_cards_cards" CASCADE;
  DROP TABLE "programs_blocks_system_cards_cards_locales" CASCADE;
  DROP TABLE "programs_blocks_system_cards" CASCADE;
  DROP TABLE "programs_blocks_system_cards_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_system_cards_cards_levels" CASCADE;
  DROP TABLE "_programs_v_blocks_system_cards_cards_levels_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_system_cards_cards" CASCADE;
  DROP TABLE "_programs_v_blocks_system_cards_cards_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_system_cards" CASCADE;
  DROP TABLE "_programs_v_blocks_system_cards_locales" CASCADE;
  ALTER TABLE "programs_hero_ctas" ALTER COLUMN "destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_hero_ctas_destination";
  CREATE TYPE "public"."enum_programs_hero_ctas_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "programs_hero_ctas" ALTER COLUMN "destination" SET DATA TYPE "public"."enum_programs_hero_ctas_destination" USING "destination"::"public"."enum_programs_hero_ctas_destination";
  ALTER TABLE "programs_blocks_textbook_systems" ALTER COLUMN "link_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_blocks_textbook_systems_link_destination";
  CREATE TYPE "public"."enum_programs_blocks_textbook_systems_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "programs_blocks_textbook_systems" ALTER COLUMN "link_destination" SET DATA TYPE "public"."enum_programs_blocks_textbook_systems_link_destination" USING "link_destination"::"public"."enum_programs_blocks_textbook_systems_link_destination";
  ALTER TABLE "programs_blocks_callout" ALTER COLUMN "cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_blocks_callout_cta_destination";
  CREATE TYPE "public"."enum_programs_blocks_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "programs_blocks_callout" ALTER COLUMN "cta_destination" SET DATA TYPE "public"."enum_programs_blocks_callout_cta_destination" USING "cta_destination"::"public"."enum_programs_blocks_callout_cta_destination";
  ALTER TABLE "_programs_v_version_hero_ctas" ALTER COLUMN "destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_version_hero_ctas_destination";
  CREATE TYPE "public"."enum__programs_v_version_hero_ctas_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_version_hero_ctas" ALTER COLUMN "destination" SET DATA TYPE "public"."enum__programs_v_version_hero_ctas_destination" USING "destination"::"public"."enum__programs_v_version_hero_ctas_destination";
  ALTER TABLE "_programs_v_blocks_textbook_systems" ALTER COLUMN "link_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination";
  CREATE TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_blocks_textbook_systems" ALTER COLUMN "link_destination" SET DATA TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination" USING "link_destination"::"public"."enum__programs_v_blocks_textbook_systems_link_destination";
  ALTER TABLE "_programs_v_blocks_callout" ALTER COLUMN "cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_blocks_callout_cta_destination";
  CREATE TYPE "public"."enum__programs_v_blocks_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_blocks_callout" ALTER COLUMN "cta_destination" SET DATA TYPE "public"."enum__programs_v_blocks_callout_cta_destination" USING "cta_destination"::"public"."enum__programs_v_blocks_callout_cta_destination";
  ALTER TABLE "home_programs_cards" ALTER COLUMN "destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_programs_cards_destination";
  CREATE TYPE "public"."enum_home_programs_cards_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "home_programs_cards" ALTER COLUMN "destination" SET DATA TYPE "public"."enum_home_programs_cards_destination" USING "destination"::"public"."enum_home_programs_cards_destination";
  ALTER TABLE "home" ALTER COLUMN "hero_primary_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_hero_primary_destination";
  CREATE TYPE "public"."enum_home_hero_primary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "home" ALTER COLUMN "hero_primary_destination" SET DATA TYPE "public"."enum_home_hero_primary_destination" USING "hero_primary_destination"::"public"."enum_home_hero_primary_destination";
  ALTER TABLE "home" ALTER COLUMN "hero_secondary_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_hero_secondary_destination";
  CREATE TYPE "public"."enum_home_hero_secondary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "home" ALTER COLUMN "hero_secondary_destination" SET DATA TYPE "public"."enum_home_hero_secondary_destination" USING "hero_secondary_destination"::"public"."enum_home_hero_secondary_destination";
  ALTER TABLE "home" ALTER COLUMN "translations_cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_translations_cta_destination";
  CREATE TYPE "public"."enum_home_translations_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "home" ALTER COLUMN "translations_cta_destination" SET DATA TYPE "public"."enum_home_translations_cta_destination" USING "translations_cta_destination"::"public"."enum_home_translations_cta_destination";
  ALTER TABLE "programs_hero_ctas" DROP COLUMN "anchor";
  ALTER TABLE "programs_blocks_features" DROP COLUMN "anchor";
  ALTER TABLE "programs_blocks_levels" DROP COLUMN "anchor";
  ALTER TABLE "programs_blocks_steps" DROP COLUMN "anchor";
  ALTER TABLE "programs_blocks_steps" DROP COLUMN "callout_cta_destination";
  ALTER TABLE "programs_blocks_steps_locales" DROP COLUMN "callout_heading";
  ALTER TABLE "programs_blocks_steps_locales" DROP COLUMN "callout_text";
  ALTER TABLE "programs_blocks_steps_locales" DROP COLUMN "callout_cta_label";
  ALTER TABLE "programs_blocks_steps_locales" DROP COLUMN "note";
  ALTER TABLE "programs_blocks_textbook_systems" DROP COLUMN "anchor";
  ALTER TABLE "programs_blocks_certificates" DROP COLUMN "anchor";
  ALTER TABLE "programs_blocks_faq" DROP COLUMN "anchor";
  ALTER TABLE "programs_blocks_figures" DROP COLUMN "anchor";
  ALTER TABLE "programs_blocks_rich_text" DROP COLUMN "anchor";
  ALTER TABLE "_programs_v_version_hero_ctas" DROP COLUMN "anchor";
  ALTER TABLE "_programs_v_blocks_features" DROP COLUMN "anchor";
  ALTER TABLE "_programs_v_blocks_levels" DROP COLUMN "anchor";
  ALTER TABLE "_programs_v_blocks_steps" DROP COLUMN "anchor";
  ALTER TABLE "_programs_v_blocks_steps" DROP COLUMN "callout_cta_destination";
  ALTER TABLE "_programs_v_blocks_steps_locales" DROP COLUMN "callout_heading";
  ALTER TABLE "_programs_v_blocks_steps_locales" DROP COLUMN "callout_text";
  ALTER TABLE "_programs_v_blocks_steps_locales" DROP COLUMN "callout_cta_label";
  ALTER TABLE "_programs_v_blocks_steps_locales" DROP COLUMN "note";
  ALTER TABLE "_programs_v_blocks_textbook_systems" DROP COLUMN "anchor";
  ALTER TABLE "_programs_v_blocks_certificates" DROP COLUMN "anchor";
  ALTER TABLE "_programs_v_blocks_faq" DROP COLUMN "anchor";
  ALTER TABLE "_programs_v_blocks_figures" DROP COLUMN "anchor";
  ALTER TABLE "_programs_v_blocks_rich_text" DROP COLUMN "anchor";
  DROP TYPE "public"."enum_programs_blocks_steps_callout_cta_destination";
  DROP TYPE "public"."enum_programs_blocks_system_cards_link_destination";
  DROP TYPE "public"."enum_programs_blocks_system_cards_columns";
  DROP TYPE "public"."enum__programs_v_blocks_steps_callout_cta_destination";
  DROP TYPE "public"."enum__programs_v_blocks_system_cards_link_destination";
  DROP TYPE "public"."enum__programs_v_blocks_system_cards_columns";`)
}
