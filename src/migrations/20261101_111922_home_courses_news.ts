import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_category" AS ENUM('languages', 'exams', 'vocational', 'vouchers', 'teachers', 'farmers', 'computer');
  CREATE TYPE "public"."enum_courses_language" AS ENUM('english', 'german', 'french', 'spanish', 'italian', 'bulgarian', 'russian');
  CREATE TYPE "public"."enum_courses_topic" AS ENUM('english', 'german', 'french', 'italian', 'spanish', 'russian', 'exam-prep', 'exams', 'student', 'teaching', 'professional', 'corporate', 'computer', 'farming', 'translation');
  CREATE TYPE "public"."enum_courses_audience" AS ENUM('students', 'adults', 'companies');
  CREATE TYPE "public"."enum_courses_format" AS ENUM('in-person', 'online');
  CREATE TYPE "public"."enum_courses_currency" AS ENUM('EUR', 'BGN');
  CREATE TYPE "public"."enum_courses_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__courses_v_version_category" AS ENUM('languages', 'exams', 'vocational', 'vouchers', 'teachers', 'farmers', 'computer');
  CREATE TYPE "public"."enum__courses_v_version_language" AS ENUM('english', 'german', 'french', 'spanish', 'italian', 'bulgarian', 'russian');
  CREATE TYPE "public"."enum__courses_v_version_topic" AS ENUM('english', 'german', 'french', 'italian', 'spanish', 'russian', 'exam-prep', 'exams', 'student', 'teaching', 'professional', 'corporate', 'computer', 'farming', 'translation');
  CREATE TYPE "public"."enum__courses_v_version_audience" AS ENUM('students', 'adults', 'companies');
  CREATE TYPE "public"."enum__courses_v_version_format" AS ENUM('in-person', 'online');
  CREATE TYPE "public"."enum__courses_v_version_currency" AS ENUM('EUR', 'BGN');
  CREATE TYPE "public"."enum__courses_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__courses_v_published_locale" AS ENUM('bg', 'en');
  CREATE TYPE "public"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_published_locale" AS ENUM('bg', 'en');
  CREATE TYPE "public"."enum_home_programs_cards_sticker" AS ENUM('english', 'german', 'french', 'italian', 'spanish', 'russian', 'exam-prep', 'exams', 'student', 'teaching', 'professional', 'corporate', 'computer', 'farming', 'translation');
  CREATE TYPE "public"."enum_home_programs_cards_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum_home_hero_primary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum_home_hero_secondary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum_home_translations_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'news', 'about', 'contact');
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" "enum_courses_category",
  	"language" "enum_courses_language",
  	"topic" "enum_courses_topic",
  	"audience" "enum_courses_audience",
  	"format" "enum_courses_format",
  	"level" varchar,
  	"start_date" timestamp(3) with time zone,
  	"seats" numeric,
  	"price" numeric,
  	"currency" "enum_courses_currency" DEFAULT 'EUR',
  	"voucher_eligible" boolean,
  	"legacy_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_courses_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "courses_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"audience_note" varchar,
  	"card_tag" varchar,
  	"schedule" varchar,
  	"price_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_courses_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category" "enum__courses_v_version_category",
  	"version_language" "enum__courses_v_version_language",
  	"version_topic" "enum__courses_v_version_topic",
  	"version_audience" "enum__courses_v_version_audience",
  	"version_format" "enum__courses_v_version_format",
  	"version_level" varchar,
  	"version_start_date" timestamp(3) with time zone,
  	"version_seats" numeric,
  	"version_price" numeric,
  	"version_currency" "enum__courses_v_version_currency" DEFAULT 'EUR',
  	"version_voucher_eligible" boolean,
  	"version_legacy_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__courses_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__courses_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_courses_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_audience_note" varchar,
  	"version_card_tag" varchar,
  	"version_schedule" varchar,
  	"version_price_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"cover_id" integer,
  	"legacy_id" varchar,
  	"legacy_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "news_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "news_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"news_id" integer
  );
  
  CREATE TABLE "_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_date" timestamp(3) with time zone,
  	"version_cover_id" integer,
  	"version_legacy_id" varchar,
  	"version_legacy_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__news_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_news_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_news_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"news_id" integer
  );
  
  CREATE TABLE "home_programs_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sticker" "enum_home_programs_cards_sticker" NOT NULL,
  	"destination" "enum_home_programs_cards_destination" NOT NULL
  );
  
  CREATE TABLE "home_programs_cards_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"link_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_translations_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "home_translations_steps_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_partners_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"logo_id" integer NOT NULL
  );
  
  CREATE TABLE "home_partners_logos_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_primary_destination" "enum_home_hero_primary_destination",
  	"hero_secondary_destination" "enum_home_hero_secondary_destination",
  	"hero_photo_id" integer,
  	"hero_photo_secondary_id" integer,
  	"translations_cta_destination" "enum_home_translations_cta_destination",
  	"news_count" numeric DEFAULT 3,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_locales" (
  	"hero_heading" varchar NOT NULL,
  	"hero_highlight" varchar,
  	"hero_lead" varchar,
  	"hero_primary_label" varchar,
  	"hero_secondary_label" varchar,
  	"upcoming_title" varchar,
  	"programs_title" varchar,
  	"translations_title" varchar,
  	"translations_lead" varchar,
  	"translations_cta_label" varchar,
  	"news_title" varchar,
  	"partners_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "translation_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "translation_languages_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "translation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "courses_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "news_id" integer;
  ALTER TABLE "courses_locales" ADD CONSTRAINT "courses_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_parent_id_courses_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v_locales" ADD CONSTRAINT "_courses_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_locales" ADD CONSTRAINT "news_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v_locales" ADD CONSTRAINT "_news_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_programs_cards" ADD CONSTRAINT "home_programs_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_programs_cards_locales" ADD CONSTRAINT "home_programs_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_programs_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_translations_steps" ADD CONSTRAINT "home_translations_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_translations_steps_locales" ADD CONSTRAINT "home_translations_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_translations_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_partners_logos" ADD CONSTRAINT "home_partners_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_partners_logos" ADD CONSTRAINT "home_partners_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_partners_logos_locales" ADD CONSTRAINT "home_partners_logos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_partners_logos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_photo_id_media_id_fk" FOREIGN KEY ("hero_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_photo_secondary_id_media_id_fk" FOREIGN KEY ("hero_photo_secondary_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_locales" ADD CONSTRAINT "home_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "translation_languages" ADD CONSTRAINT "translation_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."translation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "translation_languages_locales" ADD CONSTRAINT "translation_languages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."translation_languages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE INDEX "courses__status_idx" ON "courses" USING btree ("_status");
  CREATE UNIQUE INDEX "courses_slug_idx" ON "courses_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "courses_locales_locale_parent_id_unique" ON "courses_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "courses_locales_parent_id_idx" ON "courses_locales" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_parent_idx" ON "_courses_v" USING btree ("parent_id");
  CREATE INDEX "_courses_v_version_version_updated_at_idx" ON "_courses_v" USING btree ("version_updated_at");
  CREATE INDEX "_courses_v_version_version_created_at_idx" ON "_courses_v" USING btree ("version_created_at");
  CREATE INDEX "_courses_v_version_version__status_idx" ON "_courses_v" USING btree ("version__status");
  CREATE INDEX "_courses_v_created_at_idx" ON "_courses_v" USING btree ("created_at");
  CREATE INDEX "_courses_v_updated_at_idx" ON "_courses_v" USING btree ("updated_at");
  CREATE INDEX "_courses_v_snapshot_idx" ON "_courses_v" USING btree ("snapshot");
  CREATE INDEX "_courses_v_published_locale_idx" ON "_courses_v" USING btree ("published_locale");
  CREATE INDEX "_courses_v_latest_idx" ON "_courses_v" USING btree ("latest");
  CREATE INDEX "_courses_v_version_version_slug_idx" ON "_courses_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_courses_v_locales_locale_parent_id_unique" ON "_courses_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_courses_v_locales_parent_id_idx" ON "_courses_v_locales" USING btree ("_parent_id");
  CREATE INDEX "news_cover_idx" ON "news" USING btree ("cover_id");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "news__status_idx" ON "news" USING btree ("_status");
  CREATE UNIQUE INDEX "news_slug_idx" ON "news_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "news_locales_locale_parent_id_unique" ON "news_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "news_locales_parent_id_idx" ON "news_locales" USING btree ("_parent_id");
  CREATE INDEX "news_rels_order_idx" ON "news_rels" USING btree ("order");
  CREATE INDEX "news_rels_parent_idx" ON "news_rels" USING btree ("parent_id");
  CREATE INDEX "news_rels_path_idx" ON "news_rels" USING btree ("path");
  CREATE INDEX "news_rels_media_id_idx" ON "news_rels" USING btree ("media_id");
  CREATE INDEX "news_rels_news_id_idx" ON "news_rels" USING btree ("news_id");
  CREATE INDEX "_news_v_parent_idx" ON "_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_cover_idx" ON "_news_v" USING btree ("version_cover_id");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_snapshot_idx" ON "_news_v" USING btree ("snapshot");
  CREATE INDEX "_news_v_published_locale_idx" ON "_news_v" USING btree ("published_locale");
  CREATE INDEX "_news_v_latest_idx" ON "_news_v" USING btree ("latest");
  CREATE INDEX "_news_v_version_version_slug_idx" ON "_news_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_news_v_locales_locale_parent_id_unique" ON "_news_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_news_v_locales_parent_id_idx" ON "_news_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_news_v_rels_order_idx" ON "_news_v_rels" USING btree ("order");
  CREATE INDEX "_news_v_rels_parent_idx" ON "_news_v_rels" USING btree ("parent_id");
  CREATE INDEX "_news_v_rels_path_idx" ON "_news_v_rels" USING btree ("path");
  CREATE INDEX "_news_v_rels_media_id_idx" ON "_news_v_rels" USING btree ("media_id");
  CREATE INDEX "_news_v_rels_news_id_idx" ON "_news_v_rels" USING btree ("news_id");
  CREATE INDEX "home_programs_cards_order_idx" ON "home_programs_cards" USING btree ("_order");
  CREATE INDEX "home_programs_cards_parent_id_idx" ON "home_programs_cards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_programs_cards_locales_locale_parent_id_unique" ON "home_programs_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_programs_cards_locales_parent_id_idx" ON "home_programs_cards_locales" USING btree ("_parent_id");
  CREATE INDEX "home_translations_steps_order_idx" ON "home_translations_steps" USING btree ("_order");
  CREATE INDEX "home_translations_steps_parent_id_idx" ON "home_translations_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_translations_steps_locales_locale_parent_id_unique" ON "home_translations_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_translations_steps_locales_parent_id_idx" ON "home_translations_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "home_partners_logos_order_idx" ON "home_partners_logos" USING btree ("_order");
  CREATE INDEX "home_partners_logos_parent_id_idx" ON "home_partners_logos" USING btree ("_parent_id");
  CREATE INDEX "home_partners_logos_logo_idx" ON "home_partners_logos" USING btree ("logo_id");
  CREATE UNIQUE INDEX "home_partners_logos_locales_locale_parent_id_unique" ON "home_partners_logos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_partners_logos_locales_parent_id_idx" ON "home_partners_logos_locales" USING btree ("_parent_id");
  CREATE INDEX "home_hero_hero_photo_idx" ON "home" USING btree ("hero_photo_id");
  CREATE INDEX "home_hero_hero_photo_secondary_idx" ON "home" USING btree ("hero_photo_secondary_id");
  CREATE UNIQUE INDEX "home_locales_locale_parent_id_unique" ON "home_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_locales_parent_id_idx" ON "home_locales" USING btree ("_parent_id");
  CREATE INDEX "translation_languages_order_idx" ON "translation_languages" USING btree ("_order");
  CREATE INDEX "translation_languages_parent_id_idx" ON "translation_languages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "translation_languages_locales_locale_parent_id_unique" ON "translation_languages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "translation_languages_locales_parent_id_idx" ON "translation_languages_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_news_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_news_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_news_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_programs_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_programs_cards_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_translations_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_translations_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_partners_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_partners_logos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "translation_languages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "translation_languages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "translation" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "courses_locales" CASCADE;
  DROP TABLE "_courses_v" CASCADE;
  DROP TABLE "_courses_v_locales" CASCADE;
  DROP TABLE "news" CASCADE;
  DROP TABLE "news_locales" CASCADE;
  DROP TABLE "news_rels" CASCADE;
  DROP TABLE "_news_v" CASCADE;
  DROP TABLE "_news_v_locales" CASCADE;
  DROP TABLE "_news_v_rels" CASCADE;
  DROP TABLE "home_programs_cards" CASCADE;
  DROP TABLE "home_programs_cards_locales" CASCADE;
  DROP TABLE "home_translations_steps" CASCADE;
  DROP TABLE "home_translations_steps_locales" CASCADE;
  DROP TABLE "home_partners_logos" CASCADE;
  DROP TABLE "home_partners_logos_locales" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_locales" CASCADE;
  DROP TABLE "translation_languages" CASCADE;
  DROP TABLE "translation_languages_locales" CASCADE;
  DROP TABLE "translation" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_courses_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_news_fk";
  
  DROP INDEX "payload_locked_documents_rels_courses_id_idx";
  DROP INDEX "payload_locked_documents_rels_news_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "courses_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "news_id";
  DROP TYPE "public"."enum_courses_category";
  DROP TYPE "public"."enum_courses_language";
  DROP TYPE "public"."enum_courses_topic";
  DROP TYPE "public"."enum_courses_audience";
  DROP TYPE "public"."enum_courses_format";
  DROP TYPE "public"."enum_courses_currency";
  DROP TYPE "public"."enum_courses_status";
  DROP TYPE "public"."enum__courses_v_version_category";
  DROP TYPE "public"."enum__courses_v_version_language";
  DROP TYPE "public"."enum__courses_v_version_topic";
  DROP TYPE "public"."enum__courses_v_version_audience";
  DROP TYPE "public"."enum__courses_v_version_format";
  DROP TYPE "public"."enum__courses_v_version_currency";
  DROP TYPE "public"."enum__courses_v_version_status";
  DROP TYPE "public"."enum__courses_v_published_locale";
  DROP TYPE "public"."enum_news_status";
  DROP TYPE "public"."enum__news_v_version_status";
  DROP TYPE "public"."enum__news_v_published_locale";
  DROP TYPE "public"."enum_home_programs_cards_sticker";
  DROP TYPE "public"."enum_home_programs_cards_destination";
  DROP TYPE "public"."enum_home_hero_primary_destination";
  DROP TYPE "public"."enum_home_hero_secondary_destination";
  DROP TYPE "public"."enum_home_translations_cta_destination";`)
}
