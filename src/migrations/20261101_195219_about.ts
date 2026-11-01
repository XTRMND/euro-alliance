import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_documents_type" AS ENUM('licence', 'certificate', 'sample');
  CREATE TYPE "public"."enum_documents_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__documents_v_version_type" AS ENUM('licence', 'certificate', 'sample');
  CREATE TYPE "public"."enum__documents_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__documents_v_published_locale" AS ENUM('bg', 'en');
  CREATE TYPE "public"."enum_team_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_v_published_locale" AS ENUM('bg', 'en');
  CREATE TYPE "public"."enum_about_licences_links_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum_about_hero_primary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum_about_hero_secondary_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"type" "enum_documents_type",
  	"scan_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_documents_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "documents_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_documents_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_type" "enum__documents_v_version_type",
  	"version_scan_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__documents_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__documents_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_documents_v_locales" (
  	"version_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_team_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "team_locales" (
  	"name" varchar,
  	"role" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_team_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_photo_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__team_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__team_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_team_v_locales" (
  	"version_name" varchar,
  	"version_role" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "about_history_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL
  );
  
  CREATE TABLE "about_history_items_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_figures_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"figure" varchar NOT NULL
  );
  
  CREATE TABLE "about_figures_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_statement_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "about_statement_audiences_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_statement_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer NOT NULL
  );
  
  CREATE TABLE "about_statement_photos_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_team_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "about_team_values_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_standards_groups_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "about_standards_groups_fields_locales" (
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_standards_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "about_standards_groups_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_licences_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"destination" "enum_about_licences_links_destination"
  );
  
  CREATE TABLE "about_licences_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_documents_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "about_documents_items_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_elearning_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "about_elearning_benefits_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_elearning_platforms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_photo_id" integer,
  	"hero_primary_destination" "enum_about_hero_primary_destination",
  	"hero_secondary_destination" "enum_about_hero_secondary_destination",
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_locales" (
  	"hero_kicker" varchar,
  	"hero_title" varchar,
  	"hero_highlight" varchar,
  	"hero_lead" varchar,
  	"hero_primary_label" varchar,
  	"hero_secondary_label" varchar,
  	"history_kicker" varchar,
  	"history_heading" varchar,
  	"history_lead" varchar,
  	"history_closing" varchar,
  	"figures_heading" varchar,
  	"statement_before" varchar,
  	"statement_highlight" varchar,
  	"statement_after" varchar,
  	"statement_note" varchar,
  	"team_kicker" varchar,
  	"team_heading" varchar,
  	"team_quote" varchar,
  	"standards_kicker" varchar,
  	"standards_heading" varchar,
  	"standards_lead" varchar,
  	"standards_stub_label" varchar,
  	"standards_stub_title" varchar,
  	"standards_stub_chip" varchar,
  	"standards_stub_button_label" varchar,
  	"standards_stub_note" varchar,
  	"licences_kicker" varchar,
  	"licences_heading" varchar,
  	"licences_lead" varchar,
  	"documents_kicker" varchar,
  	"documents_heading" varchar,
  	"documents_fees_text" varchar,
  	"documents_fees_duplicate" varchar,
  	"documents_fees_note" varchar,
  	"projects_kicker" varchar,
  	"projects_heading" varchar,
  	"elearning_kicker" varchar,
  	"elearning_heading" varchar,
  	"elearning_lead" varchar,
  	"elearning_platforms_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "about_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documents_id" integer,
  	"funded_projects_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "documents_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "team_id" integer;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_scan_id_media_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents_locales" ADD CONSTRAINT "documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_documents_v" ADD CONSTRAINT "_documents_v_parent_id_documents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_documents_v" ADD CONSTRAINT "_documents_v_version_scan_id_media_id_fk" FOREIGN KEY ("version_scan_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_documents_v_locales" ADD CONSTRAINT "_documents_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_documents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_locales" ADD CONSTRAINT "team_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_v" ADD CONSTRAINT "_team_v_parent_id_team_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_v" ADD CONSTRAINT "_team_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_v_locales" ADD CONSTRAINT "_team_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_history_items" ADD CONSTRAINT "about_history_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_history_items_locales" ADD CONSTRAINT "about_history_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_history_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_figures_items" ADD CONSTRAINT "about_figures_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_figures_items_locales" ADD CONSTRAINT "about_figures_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_figures_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_statement_audiences" ADD CONSTRAINT "about_statement_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_statement_audiences_locales" ADD CONSTRAINT "about_statement_audiences_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_statement_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_statement_photos" ADD CONSTRAINT "about_statement_photos_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_statement_photos" ADD CONSTRAINT "about_statement_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_statement_photos_locales" ADD CONSTRAINT "about_statement_photos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_statement_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_team_values" ADD CONSTRAINT "about_team_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_team_values_locales" ADD CONSTRAINT "about_team_values_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_team_values"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_standards_groups_fields" ADD CONSTRAINT "about_standards_groups_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_standards_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_standards_groups_fields_locales" ADD CONSTRAINT "about_standards_groups_fields_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_standards_groups_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_standards_groups" ADD CONSTRAINT "about_standards_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_standards_groups_locales" ADD CONSTRAINT "about_standards_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_standards_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_licences_links" ADD CONSTRAINT "about_licences_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_licences_links_locales" ADD CONSTRAINT "about_licences_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_licences_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_documents_items" ADD CONSTRAINT "about_documents_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_documents_items_locales" ADD CONSTRAINT "about_documents_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_documents_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_elearning_benefits" ADD CONSTRAINT "about_elearning_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_elearning_benefits_locales" ADD CONSTRAINT "about_elearning_benefits_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_elearning_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_elearning_platforms" ADD CONSTRAINT "about_elearning_platforms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_hero_photo_id_media_id_fk" FOREIGN KEY ("hero_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_locales" ADD CONSTRAINT "about_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_rels" ADD CONSTRAINT "about_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_rels" ADD CONSTRAINT "about_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_rels" ADD CONSTRAINT "about_rels_funded_projects_fk" FOREIGN KEY ("funded_projects_id") REFERENCES "public"."funded_projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "documents__order_idx" ON "documents" USING btree ("_order");
  CREATE INDEX "documents_scan_idx" ON "documents" USING btree ("scan_id");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE INDEX "documents__status_idx" ON "documents" USING btree ("_status");
  CREATE UNIQUE INDEX "documents_locales_locale_parent_id_unique" ON "documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "documents_locales_parent_id_idx" ON "documents_locales" USING btree ("_parent_id");
  CREATE INDEX "_documents_v_parent_idx" ON "_documents_v" USING btree ("parent_id");
  CREATE INDEX "_documents_v_version_version__order_idx" ON "_documents_v" USING btree ("version__order");
  CREATE INDEX "_documents_v_version_version_scan_idx" ON "_documents_v" USING btree ("version_scan_id");
  CREATE INDEX "_documents_v_version_version_updated_at_idx" ON "_documents_v" USING btree ("version_updated_at");
  CREATE INDEX "_documents_v_version_version_created_at_idx" ON "_documents_v" USING btree ("version_created_at");
  CREATE INDEX "_documents_v_version_version__status_idx" ON "_documents_v" USING btree ("version__status");
  CREATE INDEX "_documents_v_created_at_idx" ON "_documents_v" USING btree ("created_at");
  CREATE INDEX "_documents_v_updated_at_idx" ON "_documents_v" USING btree ("updated_at");
  CREATE INDEX "_documents_v_snapshot_idx" ON "_documents_v" USING btree ("snapshot");
  CREATE INDEX "_documents_v_published_locale_idx" ON "_documents_v" USING btree ("published_locale");
  CREATE INDEX "_documents_v_latest_idx" ON "_documents_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_documents_v_locales_locale_parent_id_unique" ON "_documents_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_documents_v_locales_parent_id_idx" ON "_documents_v_locales" USING btree ("_parent_id");
  CREATE INDEX "team__order_idx" ON "team" USING btree ("_order");
  CREATE INDEX "team_photo_idx" ON "team" USING btree ("photo_id");
  CREATE INDEX "team_updated_at_idx" ON "team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "team" USING btree ("created_at");
  CREATE INDEX "team__status_idx" ON "team" USING btree ("_status");
  CREATE UNIQUE INDEX "team_locales_locale_parent_id_unique" ON "team_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "team_locales_parent_id_idx" ON "team_locales" USING btree ("_parent_id");
  CREATE INDEX "_team_v_parent_idx" ON "_team_v" USING btree ("parent_id");
  CREATE INDEX "_team_v_version_version__order_idx" ON "_team_v" USING btree ("version__order");
  CREATE INDEX "_team_v_version_version_photo_idx" ON "_team_v" USING btree ("version_photo_id");
  CREATE INDEX "_team_v_version_version_updated_at_idx" ON "_team_v" USING btree ("version_updated_at");
  CREATE INDEX "_team_v_version_version_created_at_idx" ON "_team_v" USING btree ("version_created_at");
  CREATE INDEX "_team_v_version_version__status_idx" ON "_team_v" USING btree ("version__status");
  CREATE INDEX "_team_v_created_at_idx" ON "_team_v" USING btree ("created_at");
  CREATE INDEX "_team_v_updated_at_idx" ON "_team_v" USING btree ("updated_at");
  CREATE INDEX "_team_v_snapshot_idx" ON "_team_v" USING btree ("snapshot");
  CREATE INDEX "_team_v_published_locale_idx" ON "_team_v" USING btree ("published_locale");
  CREATE INDEX "_team_v_latest_idx" ON "_team_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_team_v_locales_locale_parent_id_unique" ON "_team_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_team_v_locales_parent_id_idx" ON "_team_v_locales" USING btree ("_parent_id");
  CREATE INDEX "about_history_items_order_idx" ON "about_history_items" USING btree ("_order");
  CREATE INDEX "about_history_items_parent_id_idx" ON "about_history_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_history_items_locales_locale_parent_id_unique" ON "about_history_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_history_items_locales_parent_id_idx" ON "about_history_items_locales" USING btree ("_parent_id");
  CREATE INDEX "about_figures_items_order_idx" ON "about_figures_items" USING btree ("_order");
  CREATE INDEX "about_figures_items_parent_id_idx" ON "about_figures_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_figures_items_locales_locale_parent_id_unique" ON "about_figures_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_figures_items_locales_parent_id_idx" ON "about_figures_items_locales" USING btree ("_parent_id");
  CREATE INDEX "about_statement_audiences_order_idx" ON "about_statement_audiences" USING btree ("_order");
  CREATE INDEX "about_statement_audiences_parent_id_idx" ON "about_statement_audiences" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_statement_audiences_locales_locale_parent_id_unique" ON "about_statement_audiences_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_statement_audiences_locales_parent_id_idx" ON "about_statement_audiences_locales" USING btree ("_parent_id");
  CREATE INDEX "about_statement_photos_order_idx" ON "about_statement_photos" USING btree ("_order");
  CREATE INDEX "about_statement_photos_parent_id_idx" ON "about_statement_photos" USING btree ("_parent_id");
  CREATE INDEX "about_statement_photos_photo_idx" ON "about_statement_photos" USING btree ("photo_id");
  CREATE UNIQUE INDEX "about_statement_photos_locales_locale_parent_id_unique" ON "about_statement_photos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_statement_photos_locales_parent_id_idx" ON "about_statement_photos_locales" USING btree ("_parent_id");
  CREATE INDEX "about_team_values_order_idx" ON "about_team_values" USING btree ("_order");
  CREATE INDEX "about_team_values_parent_id_idx" ON "about_team_values" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_team_values_locales_locale_parent_id_unique" ON "about_team_values_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_team_values_locales_parent_id_idx" ON "about_team_values_locales" USING btree ("_parent_id");
  CREATE INDEX "about_standards_groups_fields_order_idx" ON "about_standards_groups_fields" USING btree ("_order");
  CREATE INDEX "about_standards_groups_fields_parent_id_idx" ON "about_standards_groups_fields" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_standards_groups_fields_locales_locale_parent_id_uniqu" ON "about_standards_groups_fields_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_standards_groups_fields_locales_parent_id_idx" ON "about_standards_groups_fields_locales" USING btree ("_parent_id");
  CREATE INDEX "about_standards_groups_order_idx" ON "about_standards_groups" USING btree ("_order");
  CREATE INDEX "about_standards_groups_parent_id_idx" ON "about_standards_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_standards_groups_locales_locale_parent_id_unique" ON "about_standards_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_standards_groups_locales_parent_id_idx" ON "about_standards_groups_locales" USING btree ("_parent_id");
  CREATE INDEX "about_licences_links_order_idx" ON "about_licences_links" USING btree ("_order");
  CREATE INDEX "about_licences_links_parent_id_idx" ON "about_licences_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_licences_links_locales_locale_parent_id_unique" ON "about_licences_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_licences_links_locales_parent_id_idx" ON "about_licences_links_locales" USING btree ("_parent_id");
  CREATE INDEX "about_documents_items_order_idx" ON "about_documents_items" USING btree ("_order");
  CREATE INDEX "about_documents_items_parent_id_idx" ON "about_documents_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_documents_items_locales_locale_parent_id_unique" ON "about_documents_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_documents_items_locales_parent_id_idx" ON "about_documents_items_locales" USING btree ("_parent_id");
  CREATE INDEX "about_elearning_benefits_order_idx" ON "about_elearning_benefits" USING btree ("_order");
  CREATE INDEX "about_elearning_benefits_parent_id_idx" ON "about_elearning_benefits" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_elearning_benefits_locales_locale_parent_id_unique" ON "about_elearning_benefits_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_elearning_benefits_locales_parent_id_idx" ON "about_elearning_benefits_locales" USING btree ("_parent_id");
  CREATE INDEX "about_elearning_platforms_order_idx" ON "about_elearning_platforms" USING btree ("_order");
  CREATE INDEX "about_elearning_platforms_parent_id_idx" ON "about_elearning_platforms" USING btree ("_parent_id");
  CREATE INDEX "about_hero_hero_photo_idx" ON "about" USING btree ("hero_photo_id");
  CREATE UNIQUE INDEX "about_locales_locale_parent_id_unique" ON "about_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_locales_parent_id_idx" ON "about_locales" USING btree ("_parent_id");
  CREATE INDEX "about_rels_order_idx" ON "about_rels" USING btree ("order");
  CREATE INDEX "about_rels_parent_idx" ON "about_rels" USING btree ("parent_id");
  CREATE INDEX "about_rels_path_idx" ON "about_rels" USING btree ("path");
  CREATE INDEX "about_rels_documents_id_idx" ON "about_rels" USING btree ("documents_id");
  CREATE INDEX "about_rels_funded_projects_id_idx" ON "about_rels" USING btree ("funded_projects_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "payload_locked_documents_rels" USING btree ("team_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "documents_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_documents_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_documents_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_team_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_team_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_history_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_history_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_figures_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_figures_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_statement_audiences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_statement_audiences_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_statement_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_statement_photos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_team_values" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_team_values_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_standards_groups_fields" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_standards_groups_fields_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_standards_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_standards_groups_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_licences_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_licences_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_documents_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_documents_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_elearning_benefits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_elearning_benefits_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_elearning_platforms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "documents_locales" CASCADE;
  DROP TABLE "_documents_v" CASCADE;
  DROP TABLE "_documents_v_locales" CASCADE;
  DROP TABLE "team" CASCADE;
  DROP TABLE "team_locales" CASCADE;
  DROP TABLE "_team_v" CASCADE;
  DROP TABLE "_team_v_locales" CASCADE;
  DROP TABLE "about_history_items" CASCADE;
  DROP TABLE "about_history_items_locales" CASCADE;
  DROP TABLE "about_figures_items" CASCADE;
  DROP TABLE "about_figures_items_locales" CASCADE;
  DROP TABLE "about_statement_audiences" CASCADE;
  DROP TABLE "about_statement_audiences_locales" CASCADE;
  DROP TABLE "about_statement_photos" CASCADE;
  DROP TABLE "about_statement_photos_locales" CASCADE;
  DROP TABLE "about_team_values" CASCADE;
  DROP TABLE "about_team_values_locales" CASCADE;
  DROP TABLE "about_standards_groups_fields" CASCADE;
  DROP TABLE "about_standards_groups_fields_locales" CASCADE;
  DROP TABLE "about_standards_groups" CASCADE;
  DROP TABLE "about_standards_groups_locales" CASCADE;
  DROP TABLE "about_licences_links" CASCADE;
  DROP TABLE "about_licences_links_locales" CASCADE;
  DROP TABLE "about_documents_items" CASCADE;
  DROP TABLE "about_documents_items_locales" CASCADE;
  DROP TABLE "about_elearning_benefits" CASCADE;
  DROP TABLE "about_elearning_benefits_locales" CASCADE;
  DROP TABLE "about_elearning_platforms" CASCADE;
  DROP TABLE "about" CASCADE;
  DROP TABLE "about_locales" CASCADE;
  DROP TABLE "about_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_documents_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_team_fk";
  
  DROP INDEX "payload_locked_documents_rels_documents_id_idx";
  DROP INDEX "payload_locked_documents_rels_team_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "documents_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "team_id";
  DROP TYPE "public"."enum_documents_type";
  DROP TYPE "public"."enum_documents_status";
  DROP TYPE "public"."enum__documents_v_version_type";
  DROP TYPE "public"."enum__documents_v_version_status";
  DROP TYPE "public"."enum__documents_v_published_locale";
  DROP TYPE "public"."enum_team_status";
  DROP TYPE "public"."enum__team_v_version_status";
  DROP TYPE "public"."enum__team_v_published_locale";
  DROP TYPE "public"."enum_about_licences_links_destination";
  DROP TYPE "public"."enum_about_hero_primary_destination";
  DROP TYPE "public"."enum_about_hero_secondary_destination";`)
}
