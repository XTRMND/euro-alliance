import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_professions_degrees" AS ENUM('I', 'II', 'III');
  CREATE TYPE "public"."enum_professions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__professions_v_version_degrees" AS ENUM('I', 'II', 'III');
  CREATE TYPE "public"."enum__professions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__professions_v_published_locale" AS ENUM('bg', 'en');
  CREATE TYPE "public"."enum_exams_part" AS ENUM('theory', 'practice', 'both');
  CREATE TYPE "public"."enum_exams_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__exams_v_version_part" AS ENUM('theory', 'practice', 'both');
  CREATE TYPE "public"."enum__exams_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__exams_v_published_locale" AS ENUM('bg', 'en');
  ALTER TYPE "public"."enum_programs_hero_ctas_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  ALTER TYPE "public"."enum_programs_blocks_steps_callout_cta_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  ALTER TYPE "public"."enum_programs_blocks_textbook_systems_link_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  ALTER TYPE "public"."enum_programs_blocks_system_cards_link_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  ALTER TYPE "public"."enum_programs_blocks_callout_cta_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  ALTER TYPE "public"."enum__programs_v_version_hero_ctas_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  ALTER TYPE "public"."enum__programs_v_blocks_steps_callout_cta_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  ALTER TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  ALTER TYPE "public"."enum__programs_v_blocks_system_cards_link_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  ALTER TYPE "public"."enum__programs_v_blocks_callout_cta_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  ALTER TYPE "public"."enum_home_programs_cards_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  ALTER TYPE "public"."enum_home_hero_primary_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  ALTER TYPE "public"."enum_home_hero_secondary_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  ALTER TYPE "public"."enum_home_translations_cta_destination" ADD VALUE 'otherInquiry' BEFORE 'news';
  CREATE TABLE "programs_blocks_professions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_professions_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_exams" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_exams_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_professions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_professions_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_exams" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_exams_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "professions_degrees" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_professions_degrees",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "professions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"direction_code" varchar,
  	"code" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_professions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "professions_locales" (
  	"direction_name" varchar,
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_professions_v_version_degrees" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__professions_v_version_degrees",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_professions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_direction_code" varchar,
  	"version_code" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__professions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__professions_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_professions_v_locales" (
  	"version_direction_name" varchar,
  	"version_name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "exams" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"part" "enum_exams_part",
  	"date" timestamp(3) with time zone,
  	"results" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_exams_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "exams_locales" (
  	"kind" varchar,
  	"subject" varchar,
  	"place" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_exams_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_part" "enum__exams_v_version_part",
  	"version_date" timestamp(3) with time zone,
  	"version_results" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__exams_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__exams_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_exams_v_locales" (
  	"version_kind" varchar,
  	"version_subject" varchar,
  	"version_place" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "professions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "exams_id" integer;
  ALTER TABLE "programs_blocks_professions" ADD CONSTRAINT "programs_blocks_professions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_professions_locales" ADD CONSTRAINT "programs_blocks_professions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_professions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_exams" ADD CONSTRAINT "programs_blocks_exams_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_exams_locales" ADD CONSTRAINT "programs_blocks_exams_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_exams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_professions" ADD CONSTRAINT "_programs_v_blocks_professions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_professions_locales" ADD CONSTRAINT "_programs_v_blocks_professions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_professions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_exams" ADD CONSTRAINT "_programs_v_blocks_exams_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_exams_locales" ADD CONSTRAINT "_programs_v_blocks_exams_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_exams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "professions_degrees" ADD CONSTRAINT "professions_degrees_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."professions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "professions_locales" ADD CONSTRAINT "professions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."professions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_professions_v_version_degrees" ADD CONSTRAINT "_professions_v_version_degrees_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_professions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_professions_v" ADD CONSTRAINT "_professions_v_parent_id_professions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."professions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_professions_v_locales" ADD CONSTRAINT "_professions_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_professions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exams_locales" ADD CONSTRAINT "exams_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_exams_v" ADD CONSTRAINT "_exams_v_parent_id_exams_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."exams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_exams_v_locales" ADD CONSTRAINT "_exams_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_exams_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "programs_blocks_professions_order_idx" ON "programs_blocks_professions" USING btree ("_order");
  CREATE INDEX "programs_blocks_professions_parent_id_idx" ON "programs_blocks_professions" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_professions_path_idx" ON "programs_blocks_professions" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_professions_locales_locale_parent_id_unique" ON "programs_blocks_professions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_professions_locales_parent_id_idx" ON "programs_blocks_professions_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_exams_order_idx" ON "programs_blocks_exams" USING btree ("_order");
  CREATE INDEX "programs_blocks_exams_parent_id_idx" ON "programs_blocks_exams" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_exams_path_idx" ON "programs_blocks_exams" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_exams_locales_locale_parent_id_unique" ON "programs_blocks_exams_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_exams_locales_parent_id_idx" ON "programs_blocks_exams_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_professions_order_idx" ON "_programs_v_blocks_professions" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_professions_parent_id_idx" ON "_programs_v_blocks_professions" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_professions_path_idx" ON "_programs_v_blocks_professions" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_professions_locales_locale_parent_id_uniq" ON "_programs_v_blocks_professions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_professions_locales_parent_id_idx" ON "_programs_v_blocks_professions_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_exams_order_idx" ON "_programs_v_blocks_exams" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_exams_parent_id_idx" ON "_programs_v_blocks_exams" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_exams_path_idx" ON "_programs_v_blocks_exams" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_exams_locales_locale_parent_id_unique" ON "_programs_v_blocks_exams_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_exams_locales_parent_id_idx" ON "_programs_v_blocks_exams_locales" USING btree ("_parent_id");
  CREATE INDEX "professions_degrees_order_idx" ON "professions_degrees" USING btree ("order");
  CREATE INDEX "professions_degrees_parent_idx" ON "professions_degrees" USING btree ("parent_id");
  CREATE INDEX "professions__order_idx" ON "professions" USING btree ("_order");
  CREATE UNIQUE INDEX "professions_code_idx" ON "professions" USING btree ("code");
  CREATE INDEX "professions_updated_at_idx" ON "professions" USING btree ("updated_at");
  CREATE INDEX "professions_created_at_idx" ON "professions" USING btree ("created_at");
  CREATE INDEX "professions__status_idx" ON "professions" USING btree ("_status");
  CREATE UNIQUE INDEX "professions_locales_locale_parent_id_unique" ON "professions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "professions_locales_parent_id_idx" ON "professions_locales" USING btree ("_parent_id");
  CREATE INDEX "_professions_v_version_degrees_order_idx" ON "_professions_v_version_degrees" USING btree ("order");
  CREATE INDEX "_professions_v_version_degrees_parent_idx" ON "_professions_v_version_degrees" USING btree ("parent_id");
  CREATE INDEX "_professions_v_parent_idx" ON "_professions_v" USING btree ("parent_id");
  CREATE INDEX "_professions_v_version_version__order_idx" ON "_professions_v" USING btree ("version__order");
  CREATE INDEX "_professions_v_version_version_code_idx" ON "_professions_v" USING btree ("version_code");
  CREATE INDEX "_professions_v_version_version_updated_at_idx" ON "_professions_v" USING btree ("version_updated_at");
  CREATE INDEX "_professions_v_version_version_created_at_idx" ON "_professions_v" USING btree ("version_created_at");
  CREATE INDEX "_professions_v_version_version__status_idx" ON "_professions_v" USING btree ("version__status");
  CREATE INDEX "_professions_v_created_at_idx" ON "_professions_v" USING btree ("created_at");
  CREATE INDEX "_professions_v_updated_at_idx" ON "_professions_v" USING btree ("updated_at");
  CREATE INDEX "_professions_v_snapshot_idx" ON "_professions_v" USING btree ("snapshot");
  CREATE INDEX "_professions_v_published_locale_idx" ON "_professions_v" USING btree ("published_locale");
  CREATE INDEX "_professions_v_latest_idx" ON "_professions_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_professions_v_locales_locale_parent_id_unique" ON "_professions_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_professions_v_locales_parent_id_idx" ON "_professions_v_locales" USING btree ("_parent_id");
  CREATE INDEX "exams_updated_at_idx" ON "exams" USING btree ("updated_at");
  CREATE INDEX "exams_created_at_idx" ON "exams" USING btree ("created_at");
  CREATE INDEX "exams__status_idx" ON "exams" USING btree ("_status");
  CREATE UNIQUE INDEX "exams_locales_locale_parent_id_unique" ON "exams_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "exams_locales_parent_id_idx" ON "exams_locales" USING btree ("_parent_id");
  CREATE INDEX "_exams_v_parent_idx" ON "_exams_v" USING btree ("parent_id");
  CREATE INDEX "_exams_v_version_version_updated_at_idx" ON "_exams_v" USING btree ("version_updated_at");
  CREATE INDEX "_exams_v_version_version_created_at_idx" ON "_exams_v" USING btree ("version_created_at");
  CREATE INDEX "_exams_v_version_version__status_idx" ON "_exams_v" USING btree ("version__status");
  CREATE INDEX "_exams_v_created_at_idx" ON "_exams_v" USING btree ("created_at");
  CREATE INDEX "_exams_v_updated_at_idx" ON "_exams_v" USING btree ("updated_at");
  CREATE INDEX "_exams_v_snapshot_idx" ON "_exams_v" USING btree ("snapshot");
  CREATE INDEX "_exams_v_published_locale_idx" ON "_exams_v" USING btree ("published_locale");
  CREATE INDEX "_exams_v_latest_idx" ON "_exams_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_exams_v_locales_locale_parent_id_unique" ON "_exams_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_exams_v_locales_parent_id_idx" ON "_exams_v_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_professions_fk" FOREIGN KEY ("professions_id") REFERENCES "public"."professions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_exams_fk" FOREIGN KEY ("exams_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_professions_id_idx" ON "payload_locked_documents_rels" USING btree ("professions_id");
  CREATE INDEX "payload_locked_documents_rels_exams_id_idx" ON "payload_locked_documents_rels" USING btree ("exams_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programs_blocks_professions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_professions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_exams" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_exams_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_professions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_professions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_exams" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_exams_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "professions_degrees" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "professions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "professions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_professions_v_version_degrees" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_professions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_professions_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "exams" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "exams_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_exams_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_exams_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "programs_blocks_professions" CASCADE;
  DROP TABLE "programs_blocks_professions_locales" CASCADE;
  DROP TABLE "programs_blocks_exams" CASCADE;
  DROP TABLE "programs_blocks_exams_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_professions" CASCADE;
  DROP TABLE "_programs_v_blocks_professions_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_exams" CASCADE;
  DROP TABLE "_programs_v_blocks_exams_locales" CASCADE;
  DROP TABLE "professions_degrees" CASCADE;
  DROP TABLE "professions" CASCADE;
  DROP TABLE "professions_locales" CASCADE;
  DROP TABLE "_professions_v_version_degrees" CASCADE;
  DROP TABLE "_professions_v" CASCADE;
  DROP TABLE "_professions_v_locales" CASCADE;
  DROP TABLE "exams" CASCADE;
  DROP TABLE "exams_locales" CASCADE;
  DROP TABLE "_exams_v" CASCADE;
  DROP TABLE "_exams_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_professions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_exams_fk";
  
  ALTER TABLE "programs_hero_ctas" ALTER COLUMN "destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_hero_ctas_destination";
  CREATE TYPE "public"."enum_programs_hero_ctas_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "programs_hero_ctas" ALTER COLUMN "destination" SET DATA TYPE "public"."enum_programs_hero_ctas_destination" USING "destination"::"public"."enum_programs_hero_ctas_destination";
  ALTER TABLE "programs_blocks_steps" ALTER COLUMN "callout_cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_blocks_steps_callout_cta_destination";
  CREATE TYPE "public"."enum_programs_blocks_steps_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "programs_blocks_steps" ALTER COLUMN "callout_cta_destination" SET DATA TYPE "public"."enum_programs_blocks_steps_callout_cta_destination" USING "callout_cta_destination"::"public"."enum_programs_blocks_steps_callout_cta_destination";
  ALTER TABLE "programs_blocks_textbook_systems" ALTER COLUMN "link_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_blocks_textbook_systems_link_destination";
  CREATE TYPE "public"."enum_programs_blocks_textbook_systems_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "programs_blocks_textbook_systems" ALTER COLUMN "link_destination" SET DATA TYPE "public"."enum_programs_blocks_textbook_systems_link_destination" USING "link_destination"::"public"."enum_programs_blocks_textbook_systems_link_destination";
  ALTER TABLE "programs_blocks_system_cards" ALTER COLUMN "link_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_blocks_system_cards_link_destination";
  CREATE TYPE "public"."enum_programs_blocks_system_cards_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "programs_blocks_system_cards" ALTER COLUMN "link_destination" SET DATA TYPE "public"."enum_programs_blocks_system_cards_link_destination" USING "link_destination"::"public"."enum_programs_blocks_system_cards_link_destination";
  ALTER TABLE "programs_blocks_callout" ALTER COLUMN "cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_blocks_callout_cta_destination";
  CREATE TYPE "public"."enum_programs_blocks_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "programs_blocks_callout" ALTER COLUMN "cta_destination" SET DATA TYPE "public"."enum_programs_blocks_callout_cta_destination" USING "cta_destination"::"public"."enum_programs_blocks_callout_cta_destination";
  ALTER TABLE "_programs_v_version_hero_ctas" ALTER COLUMN "destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_version_hero_ctas_destination";
  CREATE TYPE "public"."enum__programs_v_version_hero_ctas_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_version_hero_ctas" ALTER COLUMN "destination" SET DATA TYPE "public"."enum__programs_v_version_hero_ctas_destination" USING "destination"::"public"."enum__programs_v_version_hero_ctas_destination";
  ALTER TABLE "_programs_v_blocks_steps" ALTER COLUMN "callout_cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_blocks_steps_callout_cta_destination";
  CREATE TYPE "public"."enum__programs_v_blocks_steps_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_blocks_steps" ALTER COLUMN "callout_cta_destination" SET DATA TYPE "public"."enum__programs_v_blocks_steps_callout_cta_destination" USING "callout_cta_destination"::"public"."enum__programs_v_blocks_steps_callout_cta_destination";
  ALTER TABLE "_programs_v_blocks_textbook_systems" ALTER COLUMN "link_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination";
  CREATE TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_blocks_textbook_systems" ALTER COLUMN "link_destination" SET DATA TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination" USING "link_destination"::"public"."enum__programs_v_blocks_textbook_systems_link_destination";
  ALTER TABLE "_programs_v_blocks_system_cards" ALTER COLUMN "link_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_blocks_system_cards_link_destination";
  CREATE TYPE "public"."enum__programs_v_blocks_system_cards_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_blocks_system_cards" ALTER COLUMN "link_destination" SET DATA TYPE "public"."enum__programs_v_blocks_system_cards_link_destination" USING "link_destination"::"public"."enum__programs_v_blocks_system_cards_link_destination";
  ALTER TABLE "_programs_v_blocks_callout" ALTER COLUMN "cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_blocks_callout_cta_destination";
  CREATE TYPE "public"."enum__programs_v_blocks_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "_programs_v_blocks_callout" ALTER COLUMN "cta_destination" SET DATA TYPE "public"."enum__programs_v_blocks_callout_cta_destination" USING "cta_destination"::"public"."enum__programs_v_blocks_callout_cta_destination";
  ALTER TABLE "home_programs_cards" ALTER COLUMN "destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_programs_cards_destination";
  CREATE TYPE "public"."enum_home_programs_cards_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "home_programs_cards" ALTER COLUMN "destination" SET DATA TYPE "public"."enum_home_programs_cards_destination" USING "destination"::"public"."enum_home_programs_cards_destination";
  ALTER TABLE "home" ALTER COLUMN "hero_primary_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_hero_primary_destination";
  CREATE TYPE "public"."enum_home_hero_primary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "home" ALTER COLUMN "hero_primary_destination" SET DATA TYPE "public"."enum_home_hero_primary_destination" USING "hero_primary_destination"::"public"."enum_home_hero_primary_destination";
  ALTER TABLE "home" ALTER COLUMN "hero_secondary_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_hero_secondary_destination";
  CREATE TYPE "public"."enum_home_hero_secondary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "home" ALTER COLUMN "hero_secondary_destination" SET DATA TYPE "public"."enum_home_hero_secondary_destination" USING "hero_secondary_destination"::"public"."enum_home_hero_secondary_destination";
  ALTER TABLE "home" ALTER COLUMN "translations_cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_translations_cta_destination";
  CREATE TYPE "public"."enum_home_translations_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  ALTER TABLE "home" ALTER COLUMN "translations_cta_destination" SET DATA TYPE "public"."enum_home_translations_cta_destination" USING "translations_cta_destination"::"public"."enum_home_translations_cta_destination";
  DROP INDEX "payload_locked_documents_rels_professions_id_idx";
  DROP INDEX "payload_locked_documents_rels_exams_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "professions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "exams_id";
  DROP TYPE "public"."enum_professions_degrees";
  DROP TYPE "public"."enum_professions_status";
  DROP TYPE "public"."enum__professions_v_version_degrees";
  DROP TYPE "public"."enum__professions_v_version_status";
  DROP TYPE "public"."enum__professions_v_published_locale";
  DROP TYPE "public"."enum_exams_part";
  DROP TYPE "public"."enum_exams_status";
  DROP TYPE "public"."enum__exams_v_version_part";
  DROP TYPE "public"."enum__exams_v_version_status";
  DROP TYPE "public"."enum__exams_v_published_locale";`)
}
