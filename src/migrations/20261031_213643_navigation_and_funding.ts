import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_navigation_footer_links_icon" AS ENUM('facebook');
  CREATE TABLE "navigation_header_left" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_header_left_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_header_right" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_header_right_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_menu_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL,
  	"icon" "enum_navigation_footer_links_icon"
  );
  
  CREATE TABLE "navigation_footer_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "navigation_footer_locales" (
  	"heading" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "site" ADD COLUMN "facebook" varchar;
  ALTER TABLE "site" ADD COLUMN "funding_logos_id" integer;
  ALTER TABLE "site_locales" ADD COLUMN "funding_statement" varchar;
  ALTER TABLE "navigation_header_left" ADD CONSTRAINT "navigation_header_left_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_left_locales" ADD CONSTRAINT "navigation_header_left_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_left"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_right" ADD CONSTRAINT "navigation_header_right_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_right_locales" ADD CONSTRAINT "navigation_header_right_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_right"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_menu" ADD CONSTRAINT "navigation_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_menu_locales" ADD CONSTRAINT "navigation_menu_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_links" ADD CONSTRAINT "navigation_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_links_locales" ADD CONSTRAINT "navigation_footer_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer" ADD CONSTRAINT "navigation_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_locales" ADD CONSTRAINT "navigation_footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "navigation_header_left_order_idx" ON "navigation_header_left" USING btree ("_order");
  CREATE INDEX "navigation_header_left_parent_id_idx" ON "navigation_header_left" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_header_left_locales_locale_parent_id_unique" ON "navigation_header_left_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_header_left_locales_parent_id_idx" ON "navigation_header_left_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_header_right_order_idx" ON "navigation_header_right" USING btree ("_order");
  CREATE INDEX "navigation_header_right_parent_id_idx" ON "navigation_header_right" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_header_right_locales_locale_parent_id_unique" ON "navigation_header_right_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_header_right_locales_parent_id_idx" ON "navigation_header_right_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_menu_order_idx" ON "navigation_menu" USING btree ("_order");
  CREATE INDEX "navigation_menu_parent_id_idx" ON "navigation_menu" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_menu_locales_locale_parent_id_unique" ON "navigation_menu_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_menu_locales_parent_id_idx" ON "navigation_menu_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_links_order_idx" ON "navigation_footer_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_links_parent_id_idx" ON "navigation_footer_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_links_locales_locale_parent_id_unique" ON "navigation_footer_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_footer_links_locales_parent_id_idx" ON "navigation_footer_links_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_order_idx" ON "navigation_footer" USING btree ("_order");
  CREATE INDEX "navigation_footer_parent_id_idx" ON "navigation_footer" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_locales_locale_parent_id_unique" ON "navigation_footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_footer_locales_parent_id_idx" ON "navigation_footer_locales" USING btree ("_parent_id");
  ALTER TABLE "site" ADD CONSTRAINT "site_funding_logos_id_media_id_fk" FOREIGN KEY ("funding_logos_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_funding_funding_logos_idx" ON "site" USING btree ("funding_logos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "navigation_header_left" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header_left_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header_right" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header_right_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_menu" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_menu_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "navigation_header_left" CASCADE;
  DROP TABLE "navigation_header_left_locales" CASCADE;
  DROP TABLE "navigation_header_right" CASCADE;
  DROP TABLE "navigation_header_right_locales" CASCADE;
  DROP TABLE "navigation_menu" CASCADE;
  DROP TABLE "navigation_menu_locales" CASCADE;
  DROP TABLE "navigation_footer_links" CASCADE;
  DROP TABLE "navigation_footer_links_locales" CASCADE;
  DROP TABLE "navigation_footer" CASCADE;
  DROP TABLE "navigation_footer_locales" CASCADE;
  DROP TABLE "navigation" CASCADE;
  ALTER TABLE "site" DROP CONSTRAINT "site_funding_logos_id_media_id_fk";
  
  DROP INDEX "site_funding_funding_logos_idx";
  ALTER TABLE "site" DROP COLUMN "facebook";
  ALTER TABLE "site" DROP COLUMN "funding_logos_id";
  ALTER TABLE "site_locales" DROP COLUMN "funding_statement";
  DROP TYPE "public"."enum_navigation_footer_links_icon";`)
}
