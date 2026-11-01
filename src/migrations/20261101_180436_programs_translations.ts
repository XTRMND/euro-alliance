import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_programs_blocks_send_document_dropzone_art" AS ENUM('always', 'mobile');
  CREATE TYPE "public"."enum__programs_v_blocks_send_document_dropzone_art" AS ENUM('always', 'mobile');
  ALTER TYPE "public"."enum_programs_type" ADD VALUE 'translations';
  ALTER TYPE "public"."enum__programs_v_version_type" ADD VALUE 'translations';
  CREATE TABLE "programs_blocks_send_document_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programs_blocks_send_document_steps_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_send_document" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"dropzone_art" "enum_programs_blocks_send_document_dropzone_art" DEFAULT 'always',
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_send_document_locales" (
  	"heading" varchar,
  	"lead" varchar,
  	"button_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_price_factors_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programs_blocks_price_factors_items_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_price_factors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"counter" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_price_factors_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_faq_columns_columns_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programs_blocks_faq_columns_columns_items_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_faq_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar
  );
  
  CREATE TABLE "programs_blocks_faq_columns_columns_locales" (
  	"heading" varchar,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programs_blocks_faq_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_locations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_locations_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_send_document_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_send_document_steps_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_send_document" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"dropzone_art" "enum__programs_v_blocks_send_document_dropzone_art" DEFAULT 'always',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_send_document_locales" (
  	"heading" varchar,
  	"lead" varchar,
  	"button_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_price_factors_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_price_factors_items_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_price_factors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"counter" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_price_factors_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_faq_columns_columns_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_faq_columns_columns_items_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_faq_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_faq_columns_columns_locales" (
  	"heading" varchar,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_faq_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_locations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_locations_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "programs" ADD COLUMN "hero_highlight_break" boolean DEFAULT true;
  ALTER TABLE "_programs_v" ADD COLUMN "version_hero_highlight_break" boolean DEFAULT true;
  ALTER TABLE "programs_blocks_send_document_steps" ADD CONSTRAINT "programs_blocks_send_document_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_send_document"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_send_document_steps_locales" ADD CONSTRAINT "programs_blocks_send_document_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_send_document_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_send_document" ADD CONSTRAINT "programs_blocks_send_document_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_send_document_locales" ADD CONSTRAINT "programs_blocks_send_document_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_send_document"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_price_factors_items" ADD CONSTRAINT "programs_blocks_price_factors_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_price_factors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_price_factors_items_locales" ADD CONSTRAINT "programs_blocks_price_factors_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_price_factors_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_price_factors" ADD CONSTRAINT "programs_blocks_price_factors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_price_factors_locales" ADD CONSTRAINT "programs_blocks_price_factors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_price_factors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_faq_columns_columns_items" ADD CONSTRAINT "programs_blocks_faq_columns_columns_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_faq_columns_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_faq_columns_columns_items_locales" ADD CONSTRAINT "programs_blocks_faq_columns_columns_items_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_faq_columns_columns_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_faq_columns_columns" ADD CONSTRAINT "programs_blocks_faq_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_faq_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_faq_columns_columns_locales" ADD CONSTRAINT "programs_blocks_faq_columns_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_faq_columns_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_faq_columns" ADD CONSTRAINT "programs_blocks_faq_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_locations" ADD CONSTRAINT "programs_blocks_locations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_locations_locales" ADD CONSTRAINT "programs_blocks_locations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_send_document_steps" ADD CONSTRAINT "_programs_v_blocks_send_document_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_send_document"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_send_document_steps_locales" ADD CONSTRAINT "_programs_v_blocks_send_document_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_send_document_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_send_document" ADD CONSTRAINT "_programs_v_blocks_send_document_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_send_document_locales" ADD CONSTRAINT "_programs_v_blocks_send_document_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_send_document"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_price_factors_items" ADD CONSTRAINT "_programs_v_blocks_price_factors_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_price_factors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_price_factors_items_locales" ADD CONSTRAINT "_programs_v_blocks_price_factors_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_price_factors_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_price_factors" ADD CONSTRAINT "_programs_v_blocks_price_factors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_price_factors_locales" ADD CONSTRAINT "_programs_v_blocks_price_factors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_price_factors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_faq_columns_columns_items" ADD CONSTRAINT "_programs_v_blocks_faq_columns_columns_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_faq_columns_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_faq_columns_columns_items_locales" ADD CONSTRAINT "_programs_v_blocks_faq_columns_columns_items_locales_pare_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_faq_columns_columns_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_faq_columns_columns" ADD CONSTRAINT "_programs_v_blocks_faq_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_faq_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_faq_columns_columns_locales" ADD CONSTRAINT "_programs_v_blocks_faq_columns_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_faq_columns_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_faq_columns" ADD CONSTRAINT "_programs_v_blocks_faq_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_locations" ADD CONSTRAINT "_programs_v_blocks_locations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_locations_locales" ADD CONSTRAINT "_programs_v_blocks_locations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_locations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "programs_blocks_send_document_steps_order_idx" ON "programs_blocks_send_document_steps" USING btree ("_order");
  CREATE INDEX "programs_blocks_send_document_steps_parent_id_idx" ON "programs_blocks_send_document_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_send_document_steps_locales_locale_parent_id" ON "programs_blocks_send_document_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_send_document_steps_locales_parent_id_idx" ON "programs_blocks_send_document_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_send_document_order_idx" ON "programs_blocks_send_document" USING btree ("_order");
  CREATE INDEX "programs_blocks_send_document_parent_id_idx" ON "programs_blocks_send_document" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_send_document_path_idx" ON "programs_blocks_send_document" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_send_document_locales_locale_parent_id_uniqu" ON "programs_blocks_send_document_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_send_document_locales_parent_id_idx" ON "programs_blocks_send_document_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_price_factors_items_order_idx" ON "programs_blocks_price_factors_items" USING btree ("_order");
  CREATE INDEX "programs_blocks_price_factors_items_parent_id_idx" ON "programs_blocks_price_factors_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_price_factors_items_locales_locale_parent_id" ON "programs_blocks_price_factors_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_price_factors_items_locales_parent_id_idx" ON "programs_blocks_price_factors_items_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_price_factors_order_idx" ON "programs_blocks_price_factors" USING btree ("_order");
  CREATE INDEX "programs_blocks_price_factors_parent_id_idx" ON "programs_blocks_price_factors" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_price_factors_path_idx" ON "programs_blocks_price_factors" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_price_factors_locales_locale_parent_id_uniqu" ON "programs_blocks_price_factors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_price_factors_locales_parent_id_idx" ON "programs_blocks_price_factors_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_faq_columns_columns_items_order_idx" ON "programs_blocks_faq_columns_columns_items" USING btree ("_order");
  CREATE INDEX "programs_blocks_faq_columns_columns_items_parent_id_idx" ON "programs_blocks_faq_columns_columns_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_faq_columns_columns_items_locales_locale_par" ON "programs_blocks_faq_columns_columns_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_faq_columns_columns_items_locales_parent_idx" ON "programs_blocks_faq_columns_columns_items_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_faq_columns_columns_order_idx" ON "programs_blocks_faq_columns_columns" USING btree ("_order");
  CREATE INDEX "programs_blocks_faq_columns_columns_parent_id_idx" ON "programs_blocks_faq_columns_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_blocks_faq_columns_columns_locales_locale_parent_id" ON "programs_blocks_faq_columns_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_faq_columns_columns_locales_parent_id_idx" ON "programs_blocks_faq_columns_columns_locales" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_faq_columns_order_idx" ON "programs_blocks_faq_columns" USING btree ("_order");
  CREATE INDEX "programs_blocks_faq_columns_parent_id_idx" ON "programs_blocks_faq_columns" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_faq_columns_path_idx" ON "programs_blocks_faq_columns" USING btree ("_path");
  CREATE INDEX "programs_blocks_locations_order_idx" ON "programs_blocks_locations" USING btree ("_order");
  CREATE INDEX "programs_blocks_locations_parent_id_idx" ON "programs_blocks_locations" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_locations_path_idx" ON "programs_blocks_locations" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_locations_locales_locale_parent_id_unique" ON "programs_blocks_locations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_locations_locales_parent_id_idx" ON "programs_blocks_locations_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_send_document_steps_order_idx" ON "_programs_v_blocks_send_document_steps" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_send_document_steps_parent_id_idx" ON "_programs_v_blocks_send_document_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_send_document_steps_locales_locale_parent" ON "_programs_v_blocks_send_document_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_send_document_steps_locales_parent_id_idx" ON "_programs_v_blocks_send_document_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_send_document_order_idx" ON "_programs_v_blocks_send_document" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_send_document_parent_id_idx" ON "_programs_v_blocks_send_document" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_send_document_path_idx" ON "_programs_v_blocks_send_document" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_send_document_locales_locale_parent_id_un" ON "_programs_v_blocks_send_document_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_send_document_locales_parent_id_idx" ON "_programs_v_blocks_send_document_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_price_factors_items_order_idx" ON "_programs_v_blocks_price_factors_items" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_price_factors_items_parent_id_idx" ON "_programs_v_blocks_price_factors_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_price_factors_items_locales_locale_parent" ON "_programs_v_blocks_price_factors_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_price_factors_items_locales_parent_id_idx" ON "_programs_v_blocks_price_factors_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_price_factors_order_idx" ON "_programs_v_blocks_price_factors" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_price_factors_parent_id_idx" ON "_programs_v_blocks_price_factors" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_price_factors_path_idx" ON "_programs_v_blocks_price_factors" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_price_factors_locales_locale_parent_id_un" ON "_programs_v_blocks_price_factors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_price_factors_locales_parent_id_idx" ON "_programs_v_blocks_price_factors_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_faq_columns_columns_items_order_idx" ON "_programs_v_blocks_faq_columns_columns_items" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_faq_columns_columns_items_parent_id_idx" ON "_programs_v_blocks_faq_columns_columns_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_faq_columns_columns_items_locales_locale_" ON "_programs_v_blocks_faq_columns_columns_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_faq_columns_columns_items_locales_par_idx" ON "_programs_v_blocks_faq_columns_columns_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_faq_columns_columns_order_idx" ON "_programs_v_blocks_faq_columns_columns" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_faq_columns_columns_parent_id_idx" ON "_programs_v_blocks_faq_columns_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_blocks_faq_columns_columns_locales_locale_parent" ON "_programs_v_blocks_faq_columns_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_faq_columns_columns_locales_parent_id_idx" ON "_programs_v_blocks_faq_columns_columns_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_faq_columns_order_idx" ON "_programs_v_blocks_faq_columns" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_faq_columns_parent_id_idx" ON "_programs_v_blocks_faq_columns" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_faq_columns_path_idx" ON "_programs_v_blocks_faq_columns" USING btree ("_path");
  CREATE INDEX "_programs_v_blocks_locations_order_idx" ON "_programs_v_blocks_locations" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_locations_parent_id_idx" ON "_programs_v_blocks_locations" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_locations_path_idx" ON "_programs_v_blocks_locations" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_locations_locales_locale_parent_id_unique" ON "_programs_v_blocks_locations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_locations_locales_parent_id_idx" ON "_programs_v_blocks_locations_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "programs_blocks_send_document_steps" CASCADE;
  DROP TABLE "programs_blocks_send_document_steps_locales" CASCADE;
  DROP TABLE "programs_blocks_send_document" CASCADE;
  DROP TABLE "programs_blocks_send_document_locales" CASCADE;
  DROP TABLE "programs_blocks_price_factors_items" CASCADE;
  DROP TABLE "programs_blocks_price_factors_items_locales" CASCADE;
  DROP TABLE "programs_blocks_price_factors" CASCADE;
  DROP TABLE "programs_blocks_price_factors_locales" CASCADE;
  DROP TABLE "programs_blocks_faq_columns_columns_items" CASCADE;
  DROP TABLE "programs_blocks_faq_columns_columns_items_locales" CASCADE;
  DROP TABLE "programs_blocks_faq_columns_columns" CASCADE;
  DROP TABLE "programs_blocks_faq_columns_columns_locales" CASCADE;
  DROP TABLE "programs_blocks_faq_columns" CASCADE;
  DROP TABLE "programs_blocks_locations" CASCADE;
  DROP TABLE "programs_blocks_locations_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_send_document_steps" CASCADE;
  DROP TABLE "_programs_v_blocks_send_document_steps_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_send_document" CASCADE;
  DROP TABLE "_programs_v_blocks_send_document_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_price_factors_items" CASCADE;
  DROP TABLE "_programs_v_blocks_price_factors_items_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_price_factors" CASCADE;
  DROP TABLE "_programs_v_blocks_price_factors_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_faq_columns_columns_items" CASCADE;
  DROP TABLE "_programs_v_blocks_faq_columns_columns_items_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_faq_columns_columns" CASCADE;
  DROP TABLE "_programs_v_blocks_faq_columns_columns_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_faq_columns" CASCADE;
  DROP TABLE "_programs_v_blocks_locations" CASCADE;
  DROP TABLE "_programs_v_blocks_locations_locales" CASCADE;
  ALTER TABLE "programs" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_type";
  CREATE TYPE "public"."enum_programs_type" AS ENUM('language', 'vocational', 'vouchers', 'teachers', 'farmers', 'computer');
  ALTER TABLE "programs" ALTER COLUMN "type" SET DATA TYPE "public"."enum_programs_type" USING "type"::"public"."enum_programs_type";
  ALTER TABLE "_programs_v" ALTER COLUMN "version_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_version_type";
  CREATE TYPE "public"."enum__programs_v_version_type" AS ENUM('language', 'vocational', 'vouchers', 'teachers', 'farmers', 'computer');
  ALTER TABLE "_programs_v" ALTER COLUMN "version_type" SET DATA TYPE "public"."enum__programs_v_version_type" USING "version_type"::"public"."enum__programs_v_version_type";
  ALTER TABLE "programs" DROP COLUMN "hero_highlight_break";
  ALTER TABLE "_programs_v" DROP COLUMN "version_hero_highlight_break";
  DROP TYPE "public"."enum_programs_blocks_send_document_dropzone_art";
  DROP TYPE "public"."enum__programs_v_blocks_send_document_dropzone_art";`)
}
