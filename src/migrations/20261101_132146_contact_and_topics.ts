import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contact_locations_anchor" AS ENUM('plovdiv', 'sofia');
  CREATE TABLE "courses_schedules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "courses_schedules_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_courses_v_version_schedules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courses_v_version_schedules_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_locations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" "enum_contact_locations_anchor" NOT NULL,
  	"latitude" numeric NOT NULL,
  	"longitude" numeric NOT NULL,
  	"map_id" integer
  );
  
  CREATE TABLE "contact_locations_locales" (
  	"kicker" varchar,
  	"street" varchar NOT NULL,
  	"address" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_locales" (
  	"hero_title" varchar,
  	"hero_highlight" varchar,
  	"hero_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "inquiries" ALTER COLUMN "topic" SET DATA TYPE text;
  DROP TYPE "public"."enum_inquiries_topic";
  CREATE TYPE "public"."enum_inquiries_topic" AS ENUM('course', 'voucher', 'translation', 'levelTest', 'corporate', 'other');
  ALTER TABLE "inquiries" ALTER COLUMN "topic" SET DATA TYPE "public"."enum_inquiries_topic" USING "topic"::"public"."enum_inquiries_topic";
  ALTER TABLE "inquiry_routing_rules" ALTER COLUMN "topic" SET DATA TYPE text;
  DROP TYPE "public"."enum_inquiry_routing_rules_topic";
  CREATE TYPE "public"."enum_inquiry_routing_rules_topic" AS ENUM('course', 'voucher', 'translation', 'levelTest', 'corporate', 'other');
  ALTER TABLE "inquiry_routing_rules" ALTER COLUMN "topic" SET DATA TYPE "public"."enum_inquiry_routing_rules_topic" USING "topic"::"public"."enum_inquiry_routing_rules_topic";
  ALTER TABLE "courses" ADD COLUMN "entry_level" varchar;
  ALTER TABLE "_courses_v" ADD COLUMN "version_entry_level" varchar;
  ALTER TABLE "courses_schedules" ADD CONSTRAINT "courses_schedules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_schedules_locales" ADD CONSTRAINT "courses_schedules_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses_schedules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_schedules" ADD CONSTRAINT "_courses_v_version_schedules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_schedules_locales" ADD CONSTRAINT "_courses_v_version_schedules_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v_version_schedules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_locations" ADD CONSTRAINT "contact_locations_map_id_media_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_locations" ADD CONSTRAINT "contact_locations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_locations_locales" ADD CONSTRAINT "contact_locations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_locales" ADD CONSTRAINT "contact_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_schedules_order_idx" ON "courses_schedules" USING btree ("_order");
  CREATE INDEX "courses_schedules_parent_id_idx" ON "courses_schedules" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "courses_schedules_locales_locale_parent_id_unique" ON "courses_schedules_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "courses_schedules_locales_parent_id_idx" ON "courses_schedules_locales" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_version_schedules_order_idx" ON "_courses_v_version_schedules" USING btree ("_order");
  CREATE INDEX "_courses_v_version_schedules_parent_id_idx" ON "_courses_v_version_schedules" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_courses_v_version_schedules_locales_locale_parent_id_unique" ON "_courses_v_version_schedules_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_courses_v_version_schedules_locales_parent_id_idx" ON "_courses_v_version_schedules_locales" USING btree ("_parent_id");
  CREATE INDEX "contact_locations_order_idx" ON "contact_locations" USING btree ("_order");
  CREATE INDEX "contact_locations_parent_id_idx" ON "contact_locations" USING btree ("_parent_id");
  CREATE INDEX "contact_locations_map_idx" ON "contact_locations" USING btree ("map_id");
  CREATE UNIQUE INDEX "contact_locations_locales_locale_parent_id_unique" ON "contact_locations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_locations_locales_parent_id_idx" ON "contact_locations_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_locales_locale_parent_id_unique" ON "contact_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_locales_parent_id_idx" ON "contact_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "courses_schedules" CASCADE;
  DROP TABLE "courses_schedules_locales" CASCADE;
  DROP TABLE "_courses_v_version_schedules" CASCADE;
  DROP TABLE "_courses_v_version_schedules_locales" CASCADE;
  DROP TABLE "contact_locations" CASCADE;
  DROP TABLE "contact_locations_locales" CASCADE;
  DROP TABLE "contact" CASCADE;
  DROP TABLE "contact_locales" CASCADE;
  ALTER TABLE "inquiries" ALTER COLUMN "topic" SET DATA TYPE text;
  DROP TYPE "public"."enum_inquiries_topic";
  CREATE TYPE "public"."enum_inquiries_topic" AS ENUM('courses', 'vouchers', 'professions', 'teachers', 'farmers', 'computer', 'translations');
  ALTER TABLE "inquiries" ALTER COLUMN "topic" SET DATA TYPE "public"."enum_inquiries_topic" USING "topic"::"public"."enum_inquiries_topic";
  ALTER TABLE "inquiry_routing_rules" ALTER COLUMN "topic" SET DATA TYPE text;
  DROP TYPE "public"."enum_inquiry_routing_rules_topic";
  CREATE TYPE "public"."enum_inquiry_routing_rules_topic" AS ENUM('courses', 'vouchers', 'professions', 'teachers', 'farmers', 'computer', 'translations');
  ALTER TABLE "inquiry_routing_rules" ALTER COLUMN "topic" SET DATA TYPE "public"."enum_inquiry_routing_rules_topic" USING "topic"::"public"."enum_inquiry_routing_rules_topic";
  ALTER TABLE "courses" DROP COLUMN "entry_level";
  ALTER TABLE "_courses_v" DROP COLUMN "version_entry_level";
  DROP TYPE "public"."enum_contact_locations_anchor";`)
}
