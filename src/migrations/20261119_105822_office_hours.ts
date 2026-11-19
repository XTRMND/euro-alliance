import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_offices_hours_regular_from" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum_offices_hours_regular_to" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum_offices_hours_seasonal_rows_from" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum_offices_hours_seasonal_rows_to" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum_offices_hours_seasonal_start_month" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TYPE "public"."enum_offices_hours_seasonal_end_month" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TYPE "public"."enum__offices_v_version_hours_regular_from" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum__offices_v_version_hours_regular_to" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum__offices_v_version_hours_seasonal_rows_from" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum__offices_v_version_hours_seasonal_rows_to" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum__offices_v_version_hours_seasonal_start_month" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TYPE "public"."enum__offices_v_version_hours_seasonal_end_month" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TABLE "offices_hours_regular" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" "enum_offices_hours_regular_from",
  	"to" "enum_offices_hours_regular_to",
  	"opens" varchar,
  	"closes" varchar
  );
  
  CREATE TABLE "offices_hours_seasonal_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" "enum_offices_hours_seasonal_rows_from",
  	"to" "enum_offices_hours_seasonal_rows_to",
  	"opens" varchar,
  	"closes" varchar
  );
  
  CREATE TABLE "_offices_v_version_hours_regular" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" "enum__offices_v_version_hours_regular_from",
  	"to" "enum__offices_v_version_hours_regular_to",
  	"opens" varchar,
  	"closes" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_offices_v_version_hours_seasonal_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" "enum__offices_v_version_hours_seasonal_rows_from",
  	"to" "enum__offices_v_version_hours_seasonal_rows_to",
  	"opens" varchar,
  	"closes" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "offices" ADD COLUMN "hours_seasonal_start_day" numeric;
  ALTER TABLE "offices" ADD COLUMN "hours_seasonal_start_month" "enum_offices_hours_seasonal_start_month";
  ALTER TABLE "offices" ADD COLUMN "hours_seasonal_end_day" numeric;
  ALTER TABLE "offices" ADD COLUMN "hours_seasonal_end_month" "enum_offices_hours_seasonal_end_month";
  ALTER TABLE "_offices_v" ADD COLUMN "version_hours_seasonal_start_day" numeric;
  ALTER TABLE "_offices_v" ADD COLUMN "version_hours_seasonal_start_month" "enum__offices_v_version_hours_seasonal_start_month";
  ALTER TABLE "_offices_v" ADD COLUMN "version_hours_seasonal_end_day" numeric;
  ALTER TABLE "_offices_v" ADD COLUMN "version_hours_seasonal_end_month" "enum__offices_v_version_hours_seasonal_end_month";
  ALTER TABLE "offices_hours_regular" ADD CONSTRAINT "offices_hours_regular_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offices_hours_seasonal_rows" ADD CONSTRAINT "offices_hours_seasonal_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offices_v_version_hours_regular" ADD CONSTRAINT "_offices_v_version_hours_regular_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offices_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offices_v_version_hours_seasonal_rows" ADD CONSTRAINT "_offices_v_version_hours_seasonal_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offices_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "offices_hours_regular_order_idx" ON "offices_hours_regular" USING btree ("_order");
  CREATE INDEX "offices_hours_regular_parent_id_idx" ON "offices_hours_regular" USING btree ("_parent_id");
  CREATE INDEX "offices_hours_seasonal_rows_order_idx" ON "offices_hours_seasonal_rows" USING btree ("_order");
  CREATE INDEX "offices_hours_seasonal_rows_parent_id_idx" ON "offices_hours_seasonal_rows" USING btree ("_parent_id");
  CREATE INDEX "_offices_v_version_hours_regular_order_idx" ON "_offices_v_version_hours_regular" USING btree ("_order");
  CREATE INDEX "_offices_v_version_hours_regular_parent_id_idx" ON "_offices_v_version_hours_regular" USING btree ("_parent_id");
  CREATE INDEX "_offices_v_version_hours_seasonal_rows_order_idx" ON "_offices_v_version_hours_seasonal_rows" USING btree ("_order");
  CREATE INDEX "_offices_v_version_hours_seasonal_rows_parent_id_idx" ON "_offices_v_version_hours_seasonal_rows" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "offices_hours_regular" CASCADE;
  DROP TABLE "offices_hours_seasonal_rows" CASCADE;
  DROP TABLE "_offices_v_version_hours_regular" CASCADE;
  DROP TABLE "_offices_v_version_hours_seasonal_rows" CASCADE;
  ALTER TABLE "offices" DROP COLUMN "hours_seasonal_start_day";
  ALTER TABLE "offices" DROP COLUMN "hours_seasonal_start_month";
  ALTER TABLE "offices" DROP COLUMN "hours_seasonal_end_day";
  ALTER TABLE "offices" DROP COLUMN "hours_seasonal_end_month";
  ALTER TABLE "_offices_v" DROP COLUMN "version_hours_seasonal_start_day";
  ALTER TABLE "_offices_v" DROP COLUMN "version_hours_seasonal_start_month";
  ALTER TABLE "_offices_v" DROP COLUMN "version_hours_seasonal_end_day";
  ALTER TABLE "_offices_v" DROP COLUMN "version_hours_seasonal_end_month";
  DROP TYPE "public"."enum_offices_hours_regular_from";
  DROP TYPE "public"."enum_offices_hours_regular_to";
  DROP TYPE "public"."enum_offices_hours_seasonal_rows_from";
  DROP TYPE "public"."enum_offices_hours_seasonal_rows_to";
  DROP TYPE "public"."enum_offices_hours_seasonal_start_month";
  DROP TYPE "public"."enum_offices_hours_seasonal_end_month";
  DROP TYPE "public"."enum__offices_v_version_hours_regular_from";
  DROP TYPE "public"."enum__offices_v_version_hours_regular_to";
  DROP TYPE "public"."enum__offices_v_version_hours_seasonal_rows_from";
  DROP TYPE "public"."enum__offices_v_version_hours_seasonal_rows_to";
  DROP TYPE "public"."enum__offices_v_version_hours_seasonal_start_month";
  DROP TYPE "public"."enum__offices_v_version_hours_seasonal_end_month";`)
}
