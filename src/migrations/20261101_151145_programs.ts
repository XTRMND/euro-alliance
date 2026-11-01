import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_programs_hero_ctas_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum_programs_blocks_textbook_systems_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum_programs_blocks_textbook_systems_columns" AS ENUM('two', 'one');
  CREATE TYPE "public"."enum_programs_blocks_callout_layout" AS ENUM('row', 'stack');
  CREATE TYPE "public"."enum_programs_blocks_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum_programs_type" AS ENUM('language', 'vocational', 'vouchers', 'teachers', 'farmers', 'computer');
  CREATE TYPE "public"."enum_programs_language" AS ENUM('english', 'german', 'french', 'spanish', 'italian', 'bulgarian', 'russian');
  CREATE TYPE "public"."enum_programs_audience" AS ENUM('adults', 'students');
  CREATE TYPE "public"."enum_programs_hero_sticker" AS ENUM('english', 'german', 'french', 'italian', 'spanish', 'russian', 'exam-prep', 'exams', 'student', 'teaching', 'professional', 'corporate', 'computer', 'farming', 'translation');
  CREATE TYPE "public"."enum_programs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__programs_v_version_hero_ctas_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum__programs_v_blocks_textbook_systems_columns" AS ENUM('two', 'one');
  CREATE TYPE "public"."enum__programs_v_blocks_callout_layout" AS ENUM('row', 'stack');
  CREATE TYPE "public"."enum__programs_v_blocks_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum__programs_v_version_type" AS ENUM('language', 'vocational', 'vouchers', 'teachers', 'farmers', 'computer');
  CREATE TYPE "public"."enum__programs_v_version_language" AS ENUM('english', 'german', 'french', 'spanish', 'italian', 'bulgarian', 'russian');
  CREATE TYPE "public"."enum__programs_v_version_audience" AS ENUM('adults', 'students');
  CREATE TYPE "public"."enum__programs_v_version_hero_sticker" AS ENUM('english', 'german', 'french', 'italian', 'spanish', 'russian', 'exam-prep', 'exams', 'student', 'teaching', 'professional', 'corporate', 'computer', 'farming', 'translation');
  CREATE TYPE "public"."enum__programs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__programs_v_published_locale" AS ENUM('bg', 'en');
  CREATE TYPE "public"."enum_textbook_systems_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__textbook_systems_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__textbook_systems_v_published_locale" AS ENUM('bg', 'en');
  CREATE TYPE "public"."enum_certificates_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__certificates_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__certificates_v_published_locale" AS ENUM('bg', 'en');
  ALTER TYPE "public"."enum_home_programs_cards_destination" ADD VALUE 'levelTest' BEFORE 'news';
  ALTER TYPE "public"."enum_home_hero_primary_destination" ADD VALUE 'levelTest' BEFORE 'news';
  ALTER TYPE "public"."enum_home_hero_secondary_destination" ADD VALUE 'levelTest' BEFORE 'news';
  ALTER TYPE "public"."enum_home_translations_cta_destination" ADD VALUE 'levelTest' BEFORE 'news';
  CREATE TABLE "programs_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"destination" "enum_programs_hero_ctas_destination"
  );
  
  CREATE TABLE "programs_hero_ctas_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_notebook_phrases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"phrase" varchar
  );
  
  CREATE TABLE "programs_notebook_phrases_locales" (
  	"translation" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_notebook_note_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programs_notebook_note_steps_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programs_blocks_features_items_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_features_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_levels_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"level" varchar
  );
  
  CREATE TABLE "programs_blocks_levels_items_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_levels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_levels_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programs_blocks_steps_items_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_steps_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_textbook_systems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_destination" "enum_programs_blocks_textbook_systems_link_destination",
  	"columns" "enum_programs_blocks_textbook_systems_columns" DEFAULT 'two',
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_textbook_systems_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_certificates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_certificates_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programs_blocks_faq_items_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_faq_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_figures_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"figure" varchar
  );
  
  CREATE TABLE "programs_blocks_figures_items_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_figures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_figures_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_programs_blocks_callout_layout" DEFAULT 'row',
  	"cta_destination" "enum_programs_blocks_callout_cta_destination",
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_callout_locales" (
  	"heading" varchar,
  	"text" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_rich_text_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_programs_type",
  	"language" "enum_programs_language",
  	"audience" "enum_programs_audience",
  	"hero_sticker" "enum_programs_hero_sticker",
  	"hero_count_bubble_value" varchar,
  	"notebook_highlight" numeric,
  	"notebook_note_done" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_programs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "programs_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"hero_kicker" varchar,
  	"hero_heading" varchar,
  	"hero_highlight" varchar,
  	"hero_lead" varchar,
  	"hero_count_bubble_label" varchar,
  	"upcoming_heading" varchar,
  	"upcoming_link_label" varchar,
  	"notebook_title" varchar,
  	"notebook_note_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "programs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"textbook_systems_id" integer,
  	"certificates_id" integer
  );
  
  CREATE TABLE "_programs_v_version_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"destination" "enum__programs_v_version_hero_ctas_destination",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_version_hero_ctas_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_version_notebook_phrases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"phrase" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_version_notebook_phrases_locales" (
  	"translation" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_version_notebook_note_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_version_notebook_note_steps_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_features_items_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_features_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_levels_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"level" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_levels_items_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_levels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_levels_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_steps_items_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_steps_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_textbook_systems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_destination" "enum__programs_v_blocks_textbook_systems_link_destination",
  	"columns" "enum__programs_v_blocks_textbook_systems_columns" DEFAULT 'two',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_textbook_systems_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_certificates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_certificates_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_faq_items_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_faq_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_figures_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_figures_items_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_figures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_figures_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__programs_v_blocks_callout_layout" DEFAULT 'row',
  	"cta_destination" "enum__programs_v_blocks_callout_cta_destination",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_callout_locales" (
  	"heading" varchar,
  	"text" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_rich_text_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_type" "enum__programs_v_version_type",
  	"version_language" "enum__programs_v_version_language",
  	"version_audience" "enum__programs_v_version_audience",
  	"version_hero_sticker" "enum__programs_v_version_hero_sticker",
  	"version_hero_count_bubble_value" varchar,
  	"version_notebook_highlight" numeric,
  	"version_notebook_note_done" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__programs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__programs_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_programs_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_hero_kicker" varchar,
  	"version_hero_heading" varchar,
  	"version_hero_highlight" varchar,
  	"version_hero_lead" varchar,
  	"version_hero_count_bubble_label" varchar,
  	"version_upcoming_heading" varchar,
  	"version_upcoming_link_label" varchar,
  	"version_notebook_title" varchar,
  	"version_notebook_note_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"textbook_systems_id" integer,
  	"certificates_id" integer
  );
  
  CREATE TABLE "textbook_systems_levels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "textbook_systems_levels_locales" (
  	"level" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "textbook_systems" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"count" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_textbook_systems_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "textbook_systems_locales" (
  	"kicker" varchar,
  	"count_label" varchar,
  	"description" varchar,
  	"strip_label" varchar,
  	"strip_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_textbook_systems_v_version_levels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_textbook_systems_v_version_levels_locales" (
  	"level" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_textbook_systems_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_count" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__textbook_systems_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__textbook_systems_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_textbook_systems_v_locales" (
  	"version_kicker" varchar,
  	"version_count_label" varchar,
  	"version_description" varchar,
  	"version_strip_label" varchar,
  	"version_strip_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "certificates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"code" varchar,
  	"prep" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_certificates_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "certificates_locales" (
  	"issuer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_certificates_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_code" varchar,
  	"version_prep" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__certificates_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__certificates_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_certificates_v_locales" (
  	"version_issuer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "programs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "textbook_systems_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "certificates_id" integer;
  ALTER TABLE "programs_hero_ctas" ADD CONSTRAINT "programs_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_hero_ctas_locales" ADD CONSTRAINT "programs_hero_ctas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_hero_ctas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_notebook_phrases" ADD CONSTRAINT "programs_notebook_phrases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_notebook_phrases_locales" ADD CONSTRAINT "programs_notebook_phrases_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_notebook_phrases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_notebook_note_steps" ADD CONSTRAINT "programs_notebook_note_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_notebook_note_steps_locales" ADD CONSTRAINT "programs_notebook_note_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_notebook_note_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_features_items" ADD CONSTRAINT "programs_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_features_items_locales" ADD CONSTRAINT "programs_blocks_features_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_features_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_features" ADD CONSTRAINT "programs_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_features_locales" ADD CONSTRAINT "programs_blocks_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_levels_items" ADD CONSTRAINT "programs_blocks_levels_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_levels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_levels_items_locales" ADD CONSTRAINT "programs_blocks_levels_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_levels_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_levels" ADD CONSTRAINT "programs_blocks_levels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_levels_locales" ADD CONSTRAINT "programs_blocks_levels_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_levels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_steps_items" ADD CONSTRAINT "programs_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_steps_items_locales" ADD CONSTRAINT "programs_blocks_steps_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_steps_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_steps" ADD CONSTRAINT "programs_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_steps_locales" ADD CONSTRAINT "programs_blocks_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_textbook_systems" ADD CONSTRAINT "programs_blocks_textbook_systems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_textbook_systems_locales" ADD CONSTRAINT "programs_blocks_textbook_systems_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_textbook_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_certificates" ADD CONSTRAINT "programs_blocks_certificates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_certificates_locales" ADD CONSTRAINT "programs_blocks_certificates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_faq_items" ADD CONSTRAINT "programs_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_faq_items_locales" ADD CONSTRAINT "programs_blocks_faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_faq" ADD CONSTRAINT "programs_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_faq_locales" ADD CONSTRAINT "programs_blocks_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_figures_items" ADD CONSTRAINT "programs_blocks_figures_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_figures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_figures_items_locales" ADD CONSTRAINT "programs_blocks_figures_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_figures_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_figures" ADD CONSTRAINT "programs_blocks_figures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_figures_locales" ADD CONSTRAINT "programs_blocks_figures_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_figures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_callout" ADD CONSTRAINT "programs_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_callout_locales" ADD CONSTRAINT "programs_blocks_callout_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_callout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_rich_text" ADD CONSTRAINT "programs_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_rich_text_locales" ADD CONSTRAINT "programs_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_locales" ADD CONSTRAINT "programs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_rels" ADD CONSTRAINT "programs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_rels" ADD CONSTRAINT "programs_rels_textbook_systems_fk" FOREIGN KEY ("textbook_systems_id") REFERENCES "public"."textbook_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_rels" ADD CONSTRAINT "programs_rels_certificates_fk" FOREIGN KEY ("certificates_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_version_hero_ctas" ADD CONSTRAINT "_programs_v_version_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_version_hero_ctas_locales" ADD CONSTRAINT "_programs_v_version_hero_ctas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_version_hero_ctas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_version_notebook_phrases" ADD CONSTRAINT "_programs_v_version_notebook_phrases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_version_notebook_phrases_locales" ADD CONSTRAINT "_programs_v_version_notebook_phrases_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_version_notebook_phrases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_version_notebook_note_steps" ADD CONSTRAINT "_programs_v_version_notebook_note_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_version_notebook_note_steps_locales" ADD CONSTRAINT "_programs_v_version_notebook_note_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_version_notebook_note_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_features_items" ADD CONSTRAINT "_programs_v_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_features_items_locales" ADD CONSTRAINT "_programs_v_blocks_features_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_features_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_features" ADD CONSTRAINT "_programs_v_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_features_locales" ADD CONSTRAINT "_programs_v_blocks_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_levels_items" ADD CONSTRAINT "_programs_v_blocks_levels_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_levels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_levels_items_locales" ADD CONSTRAINT "_programs_v_blocks_levels_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_levels_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_levels" ADD CONSTRAINT "_programs_v_blocks_levels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_levels_locales" ADD CONSTRAINT "_programs_v_blocks_levels_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_levels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_steps_items" ADD CONSTRAINT "_programs_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_steps_items_locales" ADD CONSTRAINT "_programs_v_blocks_steps_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_steps_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_steps" ADD CONSTRAINT "_programs_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_steps_locales" ADD CONSTRAINT "_programs_v_blocks_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_textbook_systems" ADD CONSTRAINT "_programs_v_blocks_textbook_systems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_textbook_systems_locales" ADD CONSTRAINT "_programs_v_blocks_textbook_systems_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_textbook_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_certificates" ADD CONSTRAINT "_programs_v_blocks_certificates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_certificates_locales" ADD CONSTRAINT "_programs_v_blocks_certificates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_faq_items" ADD CONSTRAINT "_programs_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_faq_items_locales" ADD CONSTRAINT "_programs_v_blocks_faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_faq" ADD CONSTRAINT "_programs_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_faq_locales" ADD CONSTRAINT "_programs_v_blocks_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_figures_items" ADD CONSTRAINT "_programs_v_blocks_figures_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_figures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_figures_items_locales" ADD CONSTRAINT "_programs_v_blocks_figures_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_figures_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_figures" ADD CONSTRAINT "_programs_v_blocks_figures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_figures_locales" ADD CONSTRAINT "_programs_v_blocks_figures_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_figures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_callout" ADD CONSTRAINT "_programs_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_callout_locales" ADD CONSTRAINT "_programs_v_blocks_callout_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_callout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_rich_text" ADD CONSTRAINT "_programs_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_rich_text_locales" ADD CONSTRAINT "_programs_v_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v" ADD CONSTRAINT "_programs_v_parent_id_programs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programs_v_locales" ADD CONSTRAINT "_programs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_rels" ADD CONSTRAINT "_programs_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_rels" ADD CONSTRAINT "_programs_v_rels_textbook_systems_fk" FOREIGN KEY ("textbook_systems_id") REFERENCES "public"."textbook_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_rels" ADD CONSTRAINT "_programs_v_rels_certificates_fk" FOREIGN KEY ("certificates_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "textbook_systems_levels" ADD CONSTRAINT "textbook_systems_levels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."textbook_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "textbook_systems_levels_locales" ADD CONSTRAINT "textbook_systems_levels_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."textbook_systems_levels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "textbook_systems_locales" ADD CONSTRAINT "textbook_systems_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."textbook_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_textbook_systems_v_version_levels" ADD CONSTRAINT "_textbook_systems_v_version_levels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_textbook_systems_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_textbook_systems_v_version_levels_locales" ADD CONSTRAINT "_textbook_systems_v_version_levels_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_textbook_systems_v_version_levels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_textbook_systems_v" ADD CONSTRAINT "_textbook_systems_v_parent_id_textbook_systems_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."textbook_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_textbook_systems_v_locales" ADD CONSTRAINT "_textbook_systems_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_textbook_systems_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "certificates_locales" ADD CONSTRAINT "certificates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_certificates_v" ADD CONSTRAINT "_certificates_v_parent_id_certificates_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."certificates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_certificates_v_locales" ADD CONSTRAINT "_certificates_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_certificates_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "programs_hero_ctas_order_idx" ON "programs_hero_ctas" USING btree ("_order");
  CREATE INDEX "programs_hero_ctas_parent_id_idx" ON "programs_hero_ctas" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_hero_ctas_locales_locale_parent_id_unique" ON "programs_hero_ctas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_hero_ctas_locales_parent_id_idx" ON "programs_hero_ctas_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_notebook_phrases_order_idx" ON "programs_notebook_phrases" USING btree ("_order");
  CREATE INDEX "programs_notebook_phrases_parent_id_idx" ON "programs_notebook_phrases" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_notebook_phrases_locales_locale_parent_id_unique" ON "programs_notebook_phrases_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_notebook_phrases_locales_parent_id_idx" ON "programs_notebook_phrases_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_notebook_note_steps_order_idx" ON "programs_notebook_note_steps" USING btree ("_order");
  CREATE INDEX "programs_notebook_note_steps_parent_id_idx" ON "programs_notebook_note_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_notebook_note_steps_locales_locale_parent_id_unique" ON "programs_notebook_note_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_notebook_note_steps_locales_parent_id_idx" ON "programs_notebook_note_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_features_items_order_idx" ON "programs_blocks_features_items" USING btree ("_order");
  CREATE INDEX "programs_blocks_features_items_parent_id_idx" ON "programs_blocks_features_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_features_items_locales_locale_parent_id_uniq" ON "programs_blocks_features_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_features_items_locales_parent_id_idx" ON "programs_blocks_features_items_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_features_order_idx" ON "programs_blocks_features" USING btree ("_order");
  CREATE INDEX "programs_blocks_features_parent_id_idx" ON "programs_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_features_path_idx" ON "programs_blocks_features" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_features_locales_locale_parent_id_unique" ON "programs_blocks_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_features_locales_parent_id_idx" ON "programs_blocks_features_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_levels_items_order_idx" ON "programs_blocks_levels_items" USING btree ("_order");
  CREATE INDEX "programs_blocks_levels_items_parent_id_idx" ON "programs_blocks_levels_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_levels_items_locales_locale_parent_id_unique" ON "programs_blocks_levels_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_levels_items_locales_parent_id_idx" ON "programs_blocks_levels_items_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_levels_order_idx" ON "programs_blocks_levels" USING btree ("_order");
  CREATE INDEX "programs_blocks_levels_parent_id_idx" ON "programs_blocks_levels" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_levels_path_idx" ON "programs_blocks_levels" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_levels_locales_locale_parent_id_unique" ON "programs_blocks_levels_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_levels_locales_parent_id_idx" ON "programs_blocks_levels_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_steps_items_order_idx" ON "programs_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "programs_blocks_steps_items_parent_id_idx" ON "programs_blocks_steps_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_steps_items_locales_locale_parent_id_unique" ON "programs_blocks_steps_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_steps_items_locales_parent_id_idx" ON "programs_blocks_steps_items_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_steps_order_idx" ON "programs_blocks_steps" USING btree ("_order");
  CREATE INDEX "programs_blocks_steps_parent_id_idx" ON "programs_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_steps_path_idx" ON "programs_blocks_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_steps_locales_locale_parent_id_unique" ON "programs_blocks_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_steps_locales_parent_id_idx" ON "programs_blocks_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_textbook_systems_order_idx" ON "programs_blocks_textbook_systems" USING btree ("_order");
  CREATE INDEX "programs_blocks_textbook_systems_parent_id_idx" ON "programs_blocks_textbook_systems" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_textbook_systems_path_idx" ON "programs_blocks_textbook_systems" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_textbook_systems_locales_locale_parent_id_un" ON "programs_blocks_textbook_systems_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_textbook_systems_locales_parent_id_idx" ON "programs_blocks_textbook_systems_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_certificates_order_idx" ON "programs_blocks_certificates" USING btree ("_order");
  CREATE INDEX "programs_blocks_certificates_parent_id_idx" ON "programs_blocks_certificates" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_certificates_path_idx" ON "programs_blocks_certificates" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_certificates_locales_locale_parent_id_unique" ON "programs_blocks_certificates_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_certificates_locales_parent_id_idx" ON "programs_blocks_certificates_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_faq_items_order_idx" ON "programs_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "programs_blocks_faq_items_parent_id_idx" ON "programs_blocks_faq_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_faq_items_locales_locale_parent_id_unique" ON "programs_blocks_faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_faq_items_locales_parent_id_idx" ON "programs_blocks_faq_items_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_faq_order_idx" ON "programs_blocks_faq" USING btree ("_order");
  CREATE INDEX "programs_blocks_faq_parent_id_idx" ON "programs_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_faq_path_idx" ON "programs_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_faq_locales_locale_parent_id_unique" ON "programs_blocks_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_faq_locales_parent_id_idx" ON "programs_blocks_faq_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_figures_items_order_idx" ON "programs_blocks_figures_items" USING btree ("_order");
  CREATE INDEX "programs_blocks_figures_items_parent_id_idx" ON "programs_blocks_figures_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_figures_items_locales_locale_parent_id_uniqu" ON "programs_blocks_figures_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_figures_items_locales_parent_id_idx" ON "programs_blocks_figures_items_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_figures_order_idx" ON "programs_blocks_figures" USING btree ("_order");
  CREATE INDEX "programs_blocks_figures_parent_id_idx" ON "programs_blocks_figures" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_figures_path_idx" ON "programs_blocks_figures" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_figures_locales_locale_parent_id_unique" ON "programs_blocks_figures_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_figures_locales_parent_id_idx" ON "programs_blocks_figures_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_callout_order_idx" ON "programs_blocks_callout" USING btree ("_order");
  CREATE INDEX "programs_blocks_callout_parent_id_idx" ON "programs_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_callout_path_idx" ON "programs_blocks_callout" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_callout_locales_locale_parent_id_unique" ON "programs_blocks_callout_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_callout_locales_parent_id_idx" ON "programs_blocks_callout_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_rich_text_order_idx" ON "programs_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "programs_blocks_rich_text_parent_id_idx" ON "programs_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_rich_text_path_idx" ON "programs_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_rich_text_locales_locale_parent_id_unique" ON "programs_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_rich_text_locales_parent_id_idx" ON "programs_blocks_rich_text_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_updated_at_idx" ON "programs" USING btree ("updated_at");
  CREATE INDEX "programs_created_at_idx" ON "programs" USING btree ("created_at");
  CREATE INDEX "programs__status_idx" ON "programs" USING btree ("_status");
  CREATE UNIQUE INDEX "programs_slug_idx" ON "programs_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "programs_locales_locale_parent_id_unique" ON "programs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_locales_parent_id_idx" ON "programs_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_rels_order_idx" ON "programs_rels" USING btree ("order");
  CREATE INDEX "programs_rels_parent_idx" ON "programs_rels" USING btree ("parent_id");
  CREATE INDEX "programs_rels_path_idx" ON "programs_rels" USING btree ("path");
  CREATE INDEX "programs_rels_textbook_systems_id_idx" ON "programs_rels" USING btree ("textbook_systems_id");
  CREATE INDEX "programs_rels_certificates_id_idx" ON "programs_rels" USING btree ("certificates_id");
  CREATE INDEX "_programs_v_version_hero_ctas_order_idx" ON "_programs_v_version_hero_ctas" USING btree ("_order");
  CREATE INDEX "_programs_v_version_hero_ctas_parent_id_idx" ON "_programs_v_version_hero_ctas" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_version_hero_ctas_locales_locale_parent_id_uniqu" ON "_programs_v_version_hero_ctas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_version_hero_ctas_locales_parent_id_idx" ON "_programs_v_version_hero_ctas_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_version_notebook_phrases_order_idx" ON "_programs_v_version_notebook_phrases" USING btree ("_order");
  CREATE INDEX "_programs_v_version_notebook_phrases_parent_id_idx" ON "_programs_v_version_notebook_phrases" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_version_notebook_phrases_locales_locale_parent_i" ON "_programs_v_version_notebook_phrases_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_version_notebook_phrases_locales_parent_id_idx" ON "_programs_v_version_notebook_phrases_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_version_notebook_note_steps_order_idx" ON "_programs_v_version_notebook_note_steps" USING btree ("_order");
  CREATE INDEX "_programs_v_version_notebook_note_steps_parent_id_idx" ON "_programs_v_version_notebook_note_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_version_notebook_note_steps_locales_locale_paren" ON "_programs_v_version_notebook_note_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_version_notebook_note_steps_locales_parent_i_idx" ON "_programs_v_version_notebook_note_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_features_items_order_idx" ON "_programs_v_blocks_features_items" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_features_items_parent_id_idx" ON "_programs_v_blocks_features_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_features_items_locales_locale_parent_id_u" ON "_programs_v_blocks_features_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_features_items_locales_parent_id_idx" ON "_programs_v_blocks_features_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_features_order_idx" ON "_programs_v_blocks_features" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_features_parent_id_idx" ON "_programs_v_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_features_path_idx" ON "_programs_v_blocks_features" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_features_locales_locale_parent_id_unique" ON "_programs_v_blocks_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_features_locales_parent_id_idx" ON "_programs_v_blocks_features_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_levels_items_order_idx" ON "_programs_v_blocks_levels_items" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_levels_items_parent_id_idx" ON "_programs_v_blocks_levels_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_levels_items_locales_locale_parent_id_uni" ON "_programs_v_blocks_levels_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_levels_items_locales_parent_id_idx" ON "_programs_v_blocks_levels_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_levels_order_idx" ON "_programs_v_blocks_levels" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_levels_parent_id_idx" ON "_programs_v_blocks_levels" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_levels_path_idx" ON "_programs_v_blocks_levels" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_levels_locales_locale_parent_id_unique" ON "_programs_v_blocks_levels_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_levels_locales_parent_id_idx" ON "_programs_v_blocks_levels_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_steps_items_order_idx" ON "_programs_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_steps_items_parent_id_idx" ON "_programs_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_steps_items_locales_locale_parent_id_uniq" ON "_programs_v_blocks_steps_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_steps_items_locales_parent_id_idx" ON "_programs_v_blocks_steps_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_steps_order_idx" ON "_programs_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_steps_parent_id_idx" ON "_programs_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_steps_path_idx" ON "_programs_v_blocks_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_steps_locales_locale_parent_id_unique" ON "_programs_v_blocks_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_steps_locales_parent_id_idx" ON "_programs_v_blocks_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_textbook_systems_order_idx" ON "_programs_v_blocks_textbook_systems" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_textbook_systems_parent_id_idx" ON "_programs_v_blocks_textbook_systems" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_textbook_systems_path_idx" ON "_programs_v_blocks_textbook_systems" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_textbook_systems_locales_locale_parent_id" ON "_programs_v_blocks_textbook_systems_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_textbook_systems_locales_parent_id_idx" ON "_programs_v_blocks_textbook_systems_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_certificates_order_idx" ON "_programs_v_blocks_certificates" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_certificates_parent_id_idx" ON "_programs_v_blocks_certificates" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_certificates_path_idx" ON "_programs_v_blocks_certificates" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_certificates_locales_locale_parent_id_uni" ON "_programs_v_blocks_certificates_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_certificates_locales_parent_id_idx" ON "_programs_v_blocks_certificates_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_faq_items_order_idx" ON "_programs_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_faq_items_parent_id_idx" ON "_programs_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_faq_items_locales_locale_parent_id_unique" ON "_programs_v_blocks_faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_faq_items_locales_parent_id_idx" ON "_programs_v_blocks_faq_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_faq_order_idx" ON "_programs_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_faq_parent_id_idx" ON "_programs_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_faq_path_idx" ON "_programs_v_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_faq_locales_locale_parent_id_unique" ON "_programs_v_blocks_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_faq_locales_parent_id_idx" ON "_programs_v_blocks_faq_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_figures_items_order_idx" ON "_programs_v_blocks_figures_items" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_figures_items_parent_id_idx" ON "_programs_v_blocks_figures_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_figures_items_locales_locale_parent_id_un" ON "_programs_v_blocks_figures_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_figures_items_locales_parent_id_idx" ON "_programs_v_blocks_figures_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_figures_order_idx" ON "_programs_v_blocks_figures" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_figures_parent_id_idx" ON "_programs_v_blocks_figures" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_figures_path_idx" ON "_programs_v_blocks_figures" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_figures_locales_locale_parent_id_unique" ON "_programs_v_blocks_figures_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_figures_locales_parent_id_idx" ON "_programs_v_blocks_figures_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_callout_order_idx" ON "_programs_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_callout_parent_id_idx" ON "_programs_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_callout_path_idx" ON "_programs_v_blocks_callout" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_callout_locales_locale_parent_id_unique" ON "_programs_v_blocks_callout_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_callout_locales_parent_id_idx" ON "_programs_v_blocks_callout_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_rich_text_order_idx" ON "_programs_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_rich_text_parent_id_idx" ON "_programs_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_rich_text_path_idx" ON "_programs_v_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_rich_text_locales_locale_parent_id_unique" ON "_programs_v_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_rich_text_locales_parent_id_idx" ON "_programs_v_blocks_rich_text_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_parent_idx" ON "_programs_v" USING btree ("parent_id");
  CREATE INDEX "_programs_v_version_version_updated_at_idx" ON "_programs_v" USING btree ("version_updated_at");
  CREATE INDEX "_programs_v_version_version_created_at_idx" ON "_programs_v" USING btree ("version_created_at");
  CREATE INDEX "_programs_v_version_version__status_idx" ON "_programs_v" USING btree ("version__status");
  CREATE INDEX "_programs_v_created_at_idx" ON "_programs_v" USING btree ("created_at");
  CREATE INDEX "_programs_v_updated_at_idx" ON "_programs_v" USING btree ("updated_at");
  CREATE INDEX "_programs_v_snapshot_idx" ON "_programs_v" USING btree ("snapshot");
  CREATE INDEX "_programs_v_published_locale_idx" ON "_programs_v" USING btree ("published_locale");
  CREATE INDEX "_programs_v_latest_idx" ON "_programs_v" USING btree ("latest");
  CREATE INDEX "_programs_v_version_version_slug_idx" ON "_programs_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_programs_v_locales_locale_parent_id_unique" ON "_programs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_locales_parent_id_idx" ON "_programs_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_rels_order_idx" ON "_programs_v_rels" USING btree ("order");
  CREATE INDEX "_programs_v_rels_parent_idx" ON "_programs_v_rels" USING btree ("parent_id");
  CREATE INDEX "_programs_v_rels_path_idx" ON "_programs_v_rels" USING btree ("path");
  CREATE INDEX "_programs_v_rels_textbook_systems_id_idx" ON "_programs_v_rels" USING btree ("textbook_systems_id");
  CREATE INDEX "_programs_v_rels_certificates_id_idx" ON "_programs_v_rels" USING btree ("certificates_id");
  CREATE INDEX "textbook_systems_levels_order_idx" ON "textbook_systems_levels" USING btree ("_order");
  CREATE INDEX "textbook_systems_levels_parent_id_idx" ON "textbook_systems_levels" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "textbook_systems_levels_locales_locale_parent_id_unique" ON "textbook_systems_levels_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "textbook_systems_levels_locales_parent_id_idx" ON "textbook_systems_levels_locales" USING btree ("_parent_id");
  CREATE INDEX "textbook_systems_updated_at_idx" ON "textbook_systems" USING btree ("updated_at");
  CREATE INDEX "textbook_systems_created_at_idx" ON "textbook_systems" USING btree ("created_at");
  CREATE INDEX "textbook_systems__status_idx" ON "textbook_systems" USING btree ("_status");
  CREATE UNIQUE INDEX "textbook_systems_locales_locale_parent_id_unique" ON "textbook_systems_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "textbook_systems_locales_parent_id_idx" ON "textbook_systems_locales" USING btree ("_parent_id");
  CREATE INDEX "_textbook_systems_v_version_levels_order_idx" ON "_textbook_systems_v_version_levels" USING btree ("_order");
  CREATE INDEX "_textbook_systems_v_version_levels_parent_id_idx" ON "_textbook_systems_v_version_levels" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_textbook_systems_v_version_levels_locales_locale_parent_id_" ON "_textbook_systems_v_version_levels_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_textbook_systems_v_version_levels_locales_parent_id_idx" ON "_textbook_systems_v_version_levels_locales" USING btree ("_parent_id");
  CREATE INDEX "_textbook_systems_v_parent_idx" ON "_textbook_systems_v" USING btree ("parent_id");
  CREATE INDEX "_textbook_systems_v_version_version_updated_at_idx" ON "_textbook_systems_v" USING btree ("version_updated_at");
  CREATE INDEX "_textbook_systems_v_version_version_created_at_idx" ON "_textbook_systems_v" USING btree ("version_created_at");
  CREATE INDEX "_textbook_systems_v_version_version__status_idx" ON "_textbook_systems_v" USING btree ("version__status");
  CREATE INDEX "_textbook_systems_v_created_at_idx" ON "_textbook_systems_v" USING btree ("created_at");
  CREATE INDEX "_textbook_systems_v_updated_at_idx" ON "_textbook_systems_v" USING btree ("updated_at");
  CREATE INDEX "_textbook_systems_v_snapshot_idx" ON "_textbook_systems_v" USING btree ("snapshot");
  CREATE INDEX "_textbook_systems_v_published_locale_idx" ON "_textbook_systems_v" USING btree ("published_locale");
  CREATE INDEX "_textbook_systems_v_latest_idx" ON "_textbook_systems_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_textbook_systems_v_locales_locale_parent_id_unique" ON "_textbook_systems_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_textbook_systems_v_locales_parent_id_idx" ON "_textbook_systems_v_locales" USING btree ("_parent_id");
  CREATE INDEX "certificates_updated_at_idx" ON "certificates" USING btree ("updated_at");
  CREATE INDEX "certificates_created_at_idx" ON "certificates" USING btree ("created_at");
  CREATE INDEX "certificates__status_idx" ON "certificates" USING btree ("_status");
  CREATE UNIQUE INDEX "certificates_locales_locale_parent_id_unique" ON "certificates_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "certificates_locales_parent_id_idx" ON "certificates_locales" USING btree ("_parent_id");
  CREATE INDEX "_certificates_v_parent_idx" ON "_certificates_v" USING btree ("parent_id");
  CREATE INDEX "_certificates_v_version_version_updated_at_idx" ON "_certificates_v" USING btree ("version_updated_at");
  CREATE INDEX "_certificates_v_version_version_created_at_idx" ON "_certificates_v" USING btree ("version_created_at");
  CREATE INDEX "_certificates_v_version_version__status_idx" ON "_certificates_v" USING btree ("version__status");
  CREATE INDEX "_certificates_v_created_at_idx" ON "_certificates_v" USING btree ("created_at");
  CREATE INDEX "_certificates_v_updated_at_idx" ON "_certificates_v" USING btree ("updated_at");
  CREATE INDEX "_certificates_v_snapshot_idx" ON "_certificates_v" USING btree ("snapshot");
  CREATE INDEX "_certificates_v_published_locale_idx" ON "_certificates_v" USING btree ("published_locale");
  CREATE INDEX "_certificates_v_latest_idx" ON "_certificates_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_certificates_v_locales_locale_parent_id_unique" ON "_certificates_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_certificates_v_locales_parent_id_idx" ON "_certificates_v_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_textbook_systems_fk" FOREIGN KEY ("textbook_systems_id") REFERENCES "public"."textbook_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_certificates_fk" FOREIGN KEY ("certificates_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_programs_id_idx" ON "payload_locked_documents_rels" USING btree ("programs_id");
  CREATE INDEX "payload_locked_documents_rels_textbook_systems_id_idx" ON "payload_locked_documents_rels" USING btree ("textbook_systems_id");
  CREATE INDEX "payload_locked_documents_rels_certificates_id_idx" ON "payload_locked_documents_rels" USING btree ("certificates_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programs_hero_ctas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_hero_ctas_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_notebook_phrases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_notebook_phrases_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_notebook_note_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_notebook_note_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_features_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_features_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_features_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_levels_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_levels_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_levels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_levels_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_steps_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_textbook_systems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_textbook_systems_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_certificates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_certificates_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_faq_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_figures_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_figures_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_figures" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_figures_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_callout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_callout_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_rich_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_version_hero_ctas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_version_hero_ctas_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_version_notebook_phrases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_version_notebook_phrases_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_version_notebook_note_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_version_notebook_note_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_features_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_features_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_features_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_levels_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_levels_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_levels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_levels_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_steps_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_textbook_systems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_textbook_systems_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_certificates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_certificates_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_faq_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_figures_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_figures_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_figures" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_figures_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_callout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_callout_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_rich_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "textbook_systems_levels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "textbook_systems_levels_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "textbook_systems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "textbook_systems_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_textbook_systems_v_version_levels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_textbook_systems_v_version_levels_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_textbook_systems_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_textbook_systems_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "certificates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "certificates_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_certificates_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_certificates_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "programs_hero_ctas" CASCADE;
  DROP TABLE "programs_hero_ctas_locales" CASCADE;
  DROP TABLE "programs_notebook_phrases" CASCADE;
  DROP TABLE "programs_notebook_phrases_locales" CASCADE;
  DROP TABLE "programs_notebook_note_steps" CASCADE;
  DROP TABLE "programs_notebook_note_steps_locales" CASCADE;
  DROP TABLE "programs_blocks_features_items" CASCADE;
  DROP TABLE "programs_blocks_features_items_locales" CASCADE;
  DROP TABLE "programs_blocks_features" CASCADE;
  DROP TABLE "programs_blocks_features_locales" CASCADE;
  DROP TABLE "programs_blocks_levels_items" CASCADE;
  DROP TABLE "programs_blocks_levels_items_locales" CASCADE;
  DROP TABLE "programs_blocks_levels" CASCADE;
  DROP TABLE "programs_blocks_levels_locales" CASCADE;
  DROP TABLE "programs_blocks_steps_items" CASCADE;
  DROP TABLE "programs_blocks_steps_items_locales" CASCADE;
  DROP TABLE "programs_blocks_steps" CASCADE;
  DROP TABLE "programs_blocks_steps_locales" CASCADE;
  DROP TABLE "programs_blocks_textbook_systems" CASCADE;
  DROP TABLE "programs_blocks_textbook_systems_locales" CASCADE;
  DROP TABLE "programs_blocks_certificates" CASCADE;
  DROP TABLE "programs_blocks_certificates_locales" CASCADE;
  DROP TABLE "programs_blocks_faq_items" CASCADE;
  DROP TABLE "programs_blocks_faq_items_locales" CASCADE;
  DROP TABLE "programs_blocks_faq" CASCADE;
  DROP TABLE "programs_blocks_faq_locales" CASCADE;
  DROP TABLE "programs_blocks_figures_items" CASCADE;
  DROP TABLE "programs_blocks_figures_items_locales" CASCADE;
  DROP TABLE "programs_blocks_figures" CASCADE;
  DROP TABLE "programs_blocks_figures_locales" CASCADE;
  DROP TABLE "programs_blocks_callout" CASCADE;
  DROP TABLE "programs_blocks_callout_locales" CASCADE;
  DROP TABLE "programs_blocks_rich_text" CASCADE;
  DROP TABLE "programs_blocks_rich_text_locales" CASCADE;
  DROP TABLE "programs" CASCADE;
  DROP TABLE "programs_locales" CASCADE;
  DROP TABLE "programs_rels" CASCADE;
  DROP TABLE "_programs_v_version_hero_ctas" CASCADE;
  DROP TABLE "_programs_v_version_hero_ctas_locales" CASCADE;
  DROP TABLE "_programs_v_version_notebook_phrases" CASCADE;
  DROP TABLE "_programs_v_version_notebook_phrases_locales" CASCADE;
  DROP TABLE "_programs_v_version_notebook_note_steps" CASCADE;
  DROP TABLE "_programs_v_version_notebook_note_steps_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_features_items" CASCADE;
  DROP TABLE "_programs_v_blocks_features_items_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_features" CASCADE;
  DROP TABLE "_programs_v_blocks_features_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_levels_items" CASCADE;
  DROP TABLE "_programs_v_blocks_levels_items_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_levels" CASCADE;
  DROP TABLE "_programs_v_blocks_levels_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_steps_items" CASCADE;
  DROP TABLE "_programs_v_blocks_steps_items_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_steps" CASCADE;
  DROP TABLE "_programs_v_blocks_steps_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_textbook_systems" CASCADE;
  DROP TABLE "_programs_v_blocks_textbook_systems_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_certificates" CASCADE;
  DROP TABLE "_programs_v_blocks_certificates_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_faq_items" CASCADE;
  DROP TABLE "_programs_v_blocks_faq_items_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_faq" CASCADE;
  DROP TABLE "_programs_v_blocks_faq_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_figures_items" CASCADE;
  DROP TABLE "_programs_v_blocks_figures_items_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_figures" CASCADE;
  DROP TABLE "_programs_v_blocks_figures_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_callout" CASCADE;
  DROP TABLE "_programs_v_blocks_callout_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_rich_text" CASCADE;
  DROP TABLE "_programs_v_blocks_rich_text_locales" CASCADE;
  DROP TABLE "_programs_v" CASCADE;
  DROP TABLE "_programs_v_locales" CASCADE;
  DROP TABLE "_programs_v_rels" CASCADE;
  DROP TABLE "textbook_systems_levels" CASCADE;
  DROP TABLE "textbook_systems_levels_locales" CASCADE;
  DROP TABLE "textbook_systems" CASCADE;
  DROP TABLE "textbook_systems_locales" CASCADE;
  DROP TABLE "_textbook_systems_v_version_levels" CASCADE;
  DROP TABLE "_textbook_systems_v_version_levels_locales" CASCADE;
  DROP TABLE "_textbook_systems_v" CASCADE;
  DROP TABLE "_textbook_systems_v_locales" CASCADE;
  DROP TABLE "certificates" CASCADE;
  DROP TABLE "certificates_locales" CASCADE;
  DROP TABLE "_certificates_v" CASCADE;
  DROP TABLE "_certificates_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_programs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_textbook_systems_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_certificates_fk";
  
  ALTER TABLE "home_programs_cards" ALTER COLUMN "destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_programs_cards_destination";
  CREATE TYPE "public"."enum_home_programs_cards_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'news', 'about', 'contact');
  ALTER TABLE "home_programs_cards" ALTER COLUMN "destination" SET DATA TYPE "public"."enum_home_programs_cards_destination" USING "destination"::"public"."enum_home_programs_cards_destination";
  ALTER TABLE "home" ALTER COLUMN "hero_primary_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_hero_primary_destination";
  CREATE TYPE "public"."enum_home_hero_primary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'news', 'about', 'contact');
  ALTER TABLE "home" ALTER COLUMN "hero_primary_destination" SET DATA TYPE "public"."enum_home_hero_primary_destination" USING "hero_primary_destination"::"public"."enum_home_hero_primary_destination";
  ALTER TABLE "home" ALTER COLUMN "hero_secondary_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_hero_secondary_destination";
  CREATE TYPE "public"."enum_home_hero_secondary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'news', 'about', 'contact');
  ALTER TABLE "home" ALTER COLUMN "hero_secondary_destination" SET DATA TYPE "public"."enum_home_hero_secondary_destination" USING "hero_secondary_destination"::"public"."enum_home_hero_secondary_destination";
  ALTER TABLE "home" ALTER COLUMN "translations_cta_destination" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_translations_cta_destination";
  CREATE TYPE "public"."enum_home_translations_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'news', 'about', 'contact');
  ALTER TABLE "home" ALTER COLUMN "translations_cta_destination" SET DATA TYPE "public"."enum_home_translations_cta_destination" USING "translations_cta_destination"::"public"."enum_home_translations_cta_destination";
  DROP INDEX "payload_locked_documents_rels_programs_id_idx";
  DROP INDEX "payload_locked_documents_rels_textbook_systems_id_idx";
  DROP INDEX "payload_locked_documents_rels_certificates_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "programs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "textbook_systems_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "certificates_id";
  DROP TYPE "public"."enum_programs_hero_ctas_destination";
  DROP TYPE "public"."enum_programs_blocks_textbook_systems_link_destination";
  DROP TYPE "public"."enum_programs_blocks_textbook_systems_columns";
  DROP TYPE "public"."enum_programs_blocks_callout_layout";
  DROP TYPE "public"."enum_programs_blocks_callout_cta_destination";
  DROP TYPE "public"."enum_programs_type";
  DROP TYPE "public"."enum_programs_language";
  DROP TYPE "public"."enum_programs_audience";
  DROP TYPE "public"."enum_programs_hero_sticker";
  DROP TYPE "public"."enum_programs_status";
  DROP TYPE "public"."enum__programs_v_version_hero_ctas_destination";
  DROP TYPE "public"."enum__programs_v_blocks_textbook_systems_link_destination";
  DROP TYPE "public"."enum__programs_v_blocks_textbook_systems_columns";
  DROP TYPE "public"."enum__programs_v_blocks_callout_layout";
  DROP TYPE "public"."enum__programs_v_blocks_callout_cta_destination";
  DROP TYPE "public"."enum__programs_v_version_type";
  DROP TYPE "public"."enum__programs_v_version_language";
  DROP TYPE "public"."enum__programs_v_version_audience";
  DROP TYPE "public"."enum__programs_v_version_hero_sticker";
  DROP TYPE "public"."enum__programs_v_version_status";
  DROP TYPE "public"."enum__programs_v_published_locale";
  DROP TYPE "public"."enum_textbook_systems_status";
  DROP TYPE "public"."enum__textbook_systems_v_version_status";
  DROP TYPE "public"."enum__textbook_systems_v_published_locale";
  DROP TYPE "public"."enum_certificates_status";
  DROP TYPE "public"."enum__certificates_v_version_status";
  DROP TYPE "public"."enum__certificates_v_published_locale";`)
}
