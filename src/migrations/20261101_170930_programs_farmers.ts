import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_programs_blocks_index_cards_cards_marker" AS ENUM('number', 'check');
  CREATE TYPE "public"."enum_programs_blocks_index_cards_cards_count" AS ENUM('chip', 'bubble', 'none');
  CREATE TYPE "public"."enum__programs_v_blocks_index_cards_cards_marker" AS ENUM('number', 'check');
  CREATE TYPE "public"."enum__programs_v_blocks_index_cards_cards_count" AS ENUM('chip', 'bubble', 'none');
  CREATE TYPE "public"."enum_funded_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__funded_projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__funded_projects_v_published_locale" AS ENUM('bg', 'en');
  CREATE TABLE "programs_blocks_index_cards_cards_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programs_blocks_index_cards_cards_rows_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_index_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"marker" "enum_programs_blocks_index_cards_cards_marker" DEFAULT 'number',
  	"count" "enum_programs_blocks_index_cards_cards_count" DEFAULT 'chip'
  );
  
  CREATE TABLE "programs_blocks_index_cards_cards_locales" (
  	"title" varchar,
  	"count_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_index_cards_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programs_blocks_index_cards_checklist_items_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_index_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_index_cards_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"checklist_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_projects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_projects_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_index_cards_cards_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_index_cards_cards_rows_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_index_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"marker" "enum__programs_v_blocks_index_cards_cards_marker" DEFAULT 'number',
  	"count" "enum__programs_v_blocks_index_cards_cards_count" DEFAULT 'chip',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_index_cards_cards_locales" (
  	"title" varchar,
  	"count_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_index_cards_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_index_cards_checklist_items_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_index_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_index_cards_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"checklist_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_projects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_projects_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "funded_projects_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "funded_projects_facts_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "funded_projects_goals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "funded_projects_goals_locales" (
  	"goal" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "funded_projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"logo_strip_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_funded_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "funded_projects_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_funded_projects_v_version_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_funded_projects_v_version_facts_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_funded_projects_v_version_goals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_funded_projects_v_version_goals_locales" (
  	"goal" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_funded_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_code" varchar,
  	"version_logo_strip_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__funded_projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__funded_projects_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_funded_projects_v_locales" (
  	"version_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "programs_rels" ADD COLUMN "funded_projects_id" integer;
  ALTER TABLE "_programs_v_rels" ADD COLUMN "funded_projects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "funded_projects_id" integer;
  ALTER TABLE "programs_blocks_index_cards_cards_rows" ADD CONSTRAINT "programs_blocks_index_cards_cards_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_index_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_index_cards_cards_rows_locales" ADD CONSTRAINT "programs_blocks_index_cards_cards_rows_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_index_cards_cards_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_index_cards_cards" ADD CONSTRAINT "programs_blocks_index_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_index_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_index_cards_cards_locales" ADD CONSTRAINT "programs_blocks_index_cards_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_index_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_index_cards_checklist_items" ADD CONSTRAINT "programs_blocks_index_cards_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_index_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_index_cards_checklist_items_locales" ADD CONSTRAINT "programs_blocks_index_cards_checklist_items_locales_paren_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_index_cards_checklist_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_index_cards" ADD CONSTRAINT "programs_blocks_index_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_index_cards_locales" ADD CONSTRAINT "programs_blocks_index_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_index_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_projects" ADD CONSTRAINT "programs_blocks_projects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_projects_locales" ADD CONSTRAINT "programs_blocks_projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_index_cards_cards_rows" ADD CONSTRAINT "_programs_v_blocks_index_cards_cards_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_index_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_index_cards_cards_rows_locales" ADD CONSTRAINT "_programs_v_blocks_index_cards_cards_rows_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_index_cards_cards_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_index_cards_cards" ADD CONSTRAINT "_programs_v_blocks_index_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_index_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_index_cards_cards_locales" ADD CONSTRAINT "_programs_v_blocks_index_cards_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_index_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_index_cards_checklist_items" ADD CONSTRAINT "_programs_v_blocks_index_cards_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_index_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_index_cards_checklist_items_locales" ADD CONSTRAINT "_programs_v_blocks_index_cards_checklist_items_locales_pa_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_index_cards_checklist_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_index_cards" ADD CONSTRAINT "_programs_v_blocks_index_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_index_cards_locales" ADD CONSTRAINT "_programs_v_blocks_index_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_index_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_projects" ADD CONSTRAINT "_programs_v_blocks_projects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_projects_locales" ADD CONSTRAINT "_programs_v_blocks_projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "funded_projects_facts" ADD CONSTRAINT "funded_projects_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."funded_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "funded_projects_facts_locales" ADD CONSTRAINT "funded_projects_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."funded_projects_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "funded_projects_goals" ADD CONSTRAINT "funded_projects_goals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."funded_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "funded_projects_goals_locales" ADD CONSTRAINT "funded_projects_goals_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."funded_projects_goals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "funded_projects" ADD CONSTRAINT "funded_projects_logo_strip_id_media_id_fk" FOREIGN KEY ("logo_strip_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "funded_projects_locales" ADD CONSTRAINT "funded_projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."funded_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_funded_projects_v_version_facts" ADD CONSTRAINT "_funded_projects_v_version_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_funded_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_funded_projects_v_version_facts_locales" ADD CONSTRAINT "_funded_projects_v_version_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_funded_projects_v_version_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_funded_projects_v_version_goals" ADD CONSTRAINT "_funded_projects_v_version_goals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_funded_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_funded_projects_v_version_goals_locales" ADD CONSTRAINT "_funded_projects_v_version_goals_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_funded_projects_v_version_goals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_funded_projects_v" ADD CONSTRAINT "_funded_projects_v_parent_id_funded_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."funded_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_funded_projects_v" ADD CONSTRAINT "_funded_projects_v_version_logo_strip_id_media_id_fk" FOREIGN KEY ("version_logo_strip_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_funded_projects_v_locales" ADD CONSTRAINT "_funded_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_funded_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "programs_blocks_index_cards_cards_rows_order_idx" ON "programs_blocks_index_cards_cards_rows" USING btree ("_order");
  CREATE INDEX "programs_blocks_index_cards_cards_rows_parent_id_idx" ON "programs_blocks_index_cards_cards_rows" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_index_cards_cards_rows_locales_locale_parent" ON "programs_blocks_index_cards_cards_rows_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_index_cards_cards_rows_locales_parent_id_idx" ON "programs_blocks_index_cards_cards_rows_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_index_cards_cards_order_idx" ON "programs_blocks_index_cards_cards" USING btree ("_order");
  CREATE INDEX "programs_blocks_index_cards_cards_parent_id_idx" ON "programs_blocks_index_cards_cards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_index_cards_cards_locales_locale_parent_id_u" ON "programs_blocks_index_cards_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_index_cards_cards_locales_parent_id_idx" ON "programs_blocks_index_cards_cards_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_index_cards_checklist_items_order_idx" ON "programs_blocks_index_cards_checklist_items" USING btree ("_order");
  CREATE INDEX "programs_blocks_index_cards_checklist_items_parent_id_idx" ON "programs_blocks_index_cards_checklist_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_index_cards_checklist_items_locales_locale_p" ON "programs_blocks_index_cards_checklist_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_index_cards_checklist_items_locales_pare_idx" ON "programs_blocks_index_cards_checklist_items_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_index_cards_order_idx" ON "programs_blocks_index_cards" USING btree ("_order");
  CREATE INDEX "programs_blocks_index_cards_parent_id_idx" ON "programs_blocks_index_cards" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_index_cards_path_idx" ON "programs_blocks_index_cards" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_index_cards_locales_locale_parent_id_unique" ON "programs_blocks_index_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_index_cards_locales_parent_id_idx" ON "programs_blocks_index_cards_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_projects_order_idx" ON "programs_blocks_projects" USING btree ("_order");
  CREATE INDEX "programs_blocks_projects_parent_id_idx" ON "programs_blocks_projects" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_projects_path_idx" ON "programs_blocks_projects" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_projects_locales_locale_parent_id_unique" ON "programs_blocks_projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_projects_locales_parent_id_idx" ON "programs_blocks_projects_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_index_cards_cards_rows_order_idx" ON "_programs_v_blocks_index_cards_cards_rows" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_index_cards_cards_rows_parent_id_idx" ON "_programs_v_blocks_index_cards_cards_rows" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_index_cards_cards_rows_locales_locale_par" ON "_programs_v_blocks_index_cards_cards_rows_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_index_cards_cards_rows_locales_parent_idx" ON "_programs_v_blocks_index_cards_cards_rows_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_index_cards_cards_order_idx" ON "_programs_v_blocks_index_cards_cards" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_index_cards_cards_parent_id_idx" ON "_programs_v_blocks_index_cards_cards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_index_cards_cards_locales_locale_parent_i" ON "_programs_v_blocks_index_cards_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_index_cards_cards_locales_parent_id_idx" ON "_programs_v_blocks_index_cards_cards_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_index_cards_checklist_items_order_idx" ON "_programs_v_blocks_index_cards_checklist_items" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_index_cards_checklist_items_parent_id_idx" ON "_programs_v_blocks_index_cards_checklist_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_index_cards_checklist_items_locales_local" ON "_programs_v_blocks_index_cards_checklist_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_index_cards_checklist_items_locales_p_idx" ON "_programs_v_blocks_index_cards_checklist_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_index_cards_order_idx" ON "_programs_v_blocks_index_cards" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_index_cards_parent_id_idx" ON "_programs_v_blocks_index_cards" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_index_cards_path_idx" ON "_programs_v_blocks_index_cards" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_index_cards_locales_locale_parent_id_uniq" ON "_programs_v_blocks_index_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_index_cards_locales_parent_id_idx" ON "_programs_v_blocks_index_cards_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_projects_order_idx" ON "_programs_v_blocks_projects" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_projects_parent_id_idx" ON "_programs_v_blocks_projects" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_projects_path_idx" ON "_programs_v_blocks_projects" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_projects_locales_locale_parent_id_unique" ON "_programs_v_blocks_projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_projects_locales_parent_id_idx" ON "_programs_v_blocks_projects_locales" USING btree ("_parent_id");
  CREATE INDEX "funded_projects_facts_order_idx" ON "funded_projects_facts" USING btree ("_order");
  CREATE INDEX "funded_projects_facts_parent_id_idx" ON "funded_projects_facts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "funded_projects_facts_locales_locale_parent_id_unique" ON "funded_projects_facts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "funded_projects_facts_locales_parent_id_idx" ON "funded_projects_facts_locales" USING btree ("_parent_id");
  CREATE INDEX "funded_projects_goals_order_idx" ON "funded_projects_goals" USING btree ("_order");
  CREATE INDEX "funded_projects_goals_parent_id_idx" ON "funded_projects_goals" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "funded_projects_goals_locales_locale_parent_id_unique" ON "funded_projects_goals_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "funded_projects_goals_locales_parent_id_idx" ON "funded_projects_goals_locales" USING btree ("_parent_id");
  CREATE INDEX "funded_projects_logo_strip_idx" ON "funded_projects" USING btree ("logo_strip_id");
  CREATE INDEX "funded_projects_updated_at_idx" ON "funded_projects" USING btree ("updated_at");
  CREATE INDEX "funded_projects_created_at_idx" ON "funded_projects" USING btree ("created_at");
  CREATE INDEX "funded_projects__status_idx" ON "funded_projects" USING btree ("_status");
  CREATE UNIQUE INDEX "funded_projects_locales_locale_parent_id_unique" ON "funded_projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "funded_projects_locales_parent_id_idx" ON "funded_projects_locales" USING btree ("_parent_id");
  CREATE INDEX "_funded_projects_v_version_facts_order_idx" ON "_funded_projects_v_version_facts" USING btree ("_order");
  CREATE INDEX "_funded_projects_v_version_facts_parent_id_idx" ON "_funded_projects_v_version_facts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_funded_projects_v_version_facts_locales_locale_parent_id_un" ON "_funded_projects_v_version_facts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_funded_projects_v_version_facts_locales_parent_id_idx" ON "_funded_projects_v_version_facts_locales" USING btree ("_parent_id");
  CREATE INDEX "_funded_projects_v_version_goals_order_idx" ON "_funded_projects_v_version_goals" USING btree ("_order");
  CREATE INDEX "_funded_projects_v_version_goals_parent_id_idx" ON "_funded_projects_v_version_goals" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_funded_projects_v_version_goals_locales_locale_parent_id_un" ON "_funded_projects_v_version_goals_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_funded_projects_v_version_goals_locales_parent_id_idx" ON "_funded_projects_v_version_goals_locales" USING btree ("_parent_id");
  CREATE INDEX "_funded_projects_v_parent_idx" ON "_funded_projects_v" USING btree ("parent_id");
  CREATE INDEX "_funded_projects_v_version_version_logo_strip_idx" ON "_funded_projects_v" USING btree ("version_logo_strip_id");
  CREATE INDEX "_funded_projects_v_version_version_updated_at_idx" ON "_funded_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_funded_projects_v_version_version_created_at_idx" ON "_funded_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_funded_projects_v_version_version__status_idx" ON "_funded_projects_v" USING btree ("version__status");
  CREATE INDEX "_funded_projects_v_created_at_idx" ON "_funded_projects_v" USING btree ("created_at");
  CREATE INDEX "_funded_projects_v_updated_at_idx" ON "_funded_projects_v" USING btree ("updated_at");
  CREATE INDEX "_funded_projects_v_snapshot_idx" ON "_funded_projects_v" USING btree ("snapshot");
  CREATE INDEX "_funded_projects_v_published_locale_idx" ON "_funded_projects_v" USING btree ("published_locale");
  CREATE INDEX "_funded_projects_v_latest_idx" ON "_funded_projects_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_funded_projects_v_locales_locale_parent_id_unique" ON "_funded_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_funded_projects_v_locales_parent_id_idx" ON "_funded_projects_v_locales" USING btree ("_parent_id");
  ALTER TABLE "programs_rels" ADD CONSTRAINT "programs_rels_funded_projects_fk" FOREIGN KEY ("funded_projects_id") REFERENCES "public"."funded_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_rels" ADD CONSTRAINT "_programs_v_rels_funded_projects_fk" FOREIGN KEY ("funded_projects_id") REFERENCES "public"."funded_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_funded_projects_fk" FOREIGN KEY ("funded_projects_id") REFERENCES "public"."funded_projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "programs_rels_funded_projects_id_idx" ON "programs_rels" USING btree ("funded_projects_id");
  CREATE INDEX "_programs_v_rels_funded_projects_id_idx" ON "_programs_v_rels" USING btree ("funded_projects_id");
  CREATE INDEX "payload_locked_documents_rels_funded_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("funded_projects_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programs_blocks_index_cards_cards_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_index_cards_cards_rows_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_index_cards_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_index_cards_cards_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_index_cards_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_index_cards_checklist_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_index_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_index_cards_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_projects_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_index_cards_cards_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_index_cards_cards_rows_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_index_cards_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_index_cards_cards_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_index_cards_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_index_cards_checklist_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_index_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_index_cards_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_projects_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "funded_projects_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "funded_projects_facts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "funded_projects_goals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "funded_projects_goals_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "funded_projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "funded_projects_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_funded_projects_v_version_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_funded_projects_v_version_facts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_funded_projects_v_version_goals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_funded_projects_v_version_goals_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_funded_projects_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_funded_projects_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "programs_blocks_index_cards_cards_rows" CASCADE;
  DROP TABLE "programs_blocks_index_cards_cards_rows_locales" CASCADE;
  DROP TABLE "programs_blocks_index_cards_cards" CASCADE;
  DROP TABLE "programs_blocks_index_cards_cards_locales" CASCADE;
  DROP TABLE "programs_blocks_index_cards_checklist_items" CASCADE;
  DROP TABLE "programs_blocks_index_cards_checklist_items_locales" CASCADE;
  DROP TABLE "programs_blocks_index_cards" CASCADE;
  DROP TABLE "programs_blocks_index_cards_locales" CASCADE;
  DROP TABLE "programs_blocks_projects" CASCADE;
  DROP TABLE "programs_blocks_projects_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_index_cards_cards_rows" CASCADE;
  DROP TABLE "_programs_v_blocks_index_cards_cards_rows_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_index_cards_cards" CASCADE;
  DROP TABLE "_programs_v_blocks_index_cards_cards_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_index_cards_checklist_items" CASCADE;
  DROP TABLE "_programs_v_blocks_index_cards_checklist_items_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_index_cards" CASCADE;
  DROP TABLE "_programs_v_blocks_index_cards_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_projects" CASCADE;
  DROP TABLE "_programs_v_blocks_projects_locales" CASCADE;
  DROP TABLE "funded_projects_facts" CASCADE;
  DROP TABLE "funded_projects_facts_locales" CASCADE;
  DROP TABLE "funded_projects_goals" CASCADE;
  DROP TABLE "funded_projects_goals_locales" CASCADE;
  DROP TABLE "funded_projects" CASCADE;
  DROP TABLE "funded_projects_locales" CASCADE;
  DROP TABLE "_funded_projects_v_version_facts" CASCADE;
  DROP TABLE "_funded_projects_v_version_facts_locales" CASCADE;
  DROP TABLE "_funded_projects_v_version_goals" CASCADE;
  DROP TABLE "_funded_projects_v_version_goals_locales" CASCADE;
  DROP TABLE "_funded_projects_v" CASCADE;
  DROP TABLE "_funded_projects_v_locales" CASCADE;
  ALTER TABLE "programs_rels" DROP CONSTRAINT "programs_rels_funded_projects_fk";
  
  ALTER TABLE "_programs_v_rels" DROP CONSTRAINT "_programs_v_rels_funded_projects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_funded_projects_fk";
  
  DROP INDEX "programs_rels_funded_projects_id_idx";
  DROP INDEX "_programs_v_rels_funded_projects_id_idx";
  DROP INDEX "payload_locked_documents_rels_funded_projects_id_idx";
  ALTER TABLE "programs_rels" DROP COLUMN "funded_projects_id";
  ALTER TABLE "_programs_v_rels" DROP COLUMN "funded_projects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "funded_projects_id";
  DROP TYPE "public"."enum_programs_blocks_index_cards_cards_marker";
  DROP TYPE "public"."enum_programs_blocks_index_cards_cards_count";
  DROP TYPE "public"."enum__programs_v_blocks_index_cards_cards_marker";
  DROP TYPE "public"."enum__programs_v_blocks_index_cards_cards_count";
  DROP TYPE "public"."enum_funded_projects_status";
  DROP TYPE "public"."enum__funded_projects_v_version_status";
  DROP TYPE "public"."enum__funded_projects_v_published_locale";`)
}
