import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_groups_format" AS ENUM('in-person', 'online');
  CREATE TYPE "public"."enum_courses_groups_currency" AS ENUM('EUR', 'BGN');
  CREATE TYPE "public"."enum__courses_v_version_groups_format" AS ENUM('in-person', 'online');
  CREATE TYPE "public"."enum__courses_v_version_groups_currency" AS ENUM('EUR', 'BGN');
  CREATE TABLE "courses_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"seats" numeric,
  	"hours" varchar,
  	"format" "enum_courses_groups_format",
  	"office_id" integer,
  	"price" numeric,
  	"currency" "enum_courses_groups_currency" DEFAULT 'EUR',
  	"regular_price" numeric,
  	"legacy_url" varchar
  );
  
  CREATE TABLE "courses_groups_locales" (
  	"label" varchar,
  	"days" varchar,
  	"price_label" varchar,
  	"price_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_courses_v_version_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"seats" numeric,
  	"hours" varchar,
  	"format" "enum__courses_v_version_groups_format",
  	"office_id" integer,
  	"price" numeric,
  	"currency" "enum__courses_v_version_groups_currency" DEFAULT 'EUR',
  	"regular_price" numeric,
  	"legacy_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courses_v_version_groups_locales" (
  	"label" varchar,
  	"days" varchar,
  	"price_label" varchar,
  	"price_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  -- Each course's existing date, price and schedule become its first group (published rows and
  -- the latest version, which the admin edits), before their old columns go.
  WITH g AS (
    INSERT INTO "courses_groups" ("_order", "_parent_id", "id", "start_date", "seats", "hours", "format", "price", "currency", "regular_price")
    SELECT 1, c."id", lpad(to_hex(c."id"), 24, '0'), c."start_date", c."seats", c."hours",
      c."format"::text::"enum_courses_groups_format", c."price",
      c."currency"::text::"enum_courses_groups_currency", c."regular_price"
    FROM "courses" c
    WHERE c."start_date" IS NOT NULL OR c."price" IS NOT NULL
    RETURNING "id", "_parent_id"
  )
  INSERT INTO "courses_groups_locales" ("days", "price_note", "_locale", "_parent_id")
  SELECT l."days", l."price_note", l."_locale", g."id"
  FROM g JOIN "courses_locales" l ON l."_parent_id" = g."_parent_id";

  WITH vg AS (
    INSERT INTO "_courses_v_version_groups" ("_order", "_parent_id", "start_date", "seats", "hours", "format", "price", "currency", "regular_price", "_uuid")
    SELECT 1, v."id", v."version_start_date", v."version_seats", v."version_hours",
      v."version_format"::text::"enum__courses_v_version_groups_format", v."version_price",
      v."version_currency"::text::"enum__courses_v_version_groups_currency", v."version_regular_price",
      lpad(to_hex(v."parent_id"), 24, '0')
    FROM "_courses_v" v
    WHERE v."latest" AND (v."version_start_date" IS NOT NULL OR v."version_price" IS NOT NULL)
    RETURNING "id", "_parent_id"
  )
  INSERT INTO "_courses_v_version_groups_locales" ("days", "price_note", "_locale", "_parent_id")
  SELECT l."version_days", l."version_price_note", l."_locale", vg."id"
  FROM vg JOIN "_courses_v_locales" l ON l."_parent_id" = vg."_parent_id";

  DROP TABLE "courses_schedules" CASCADE;
  DROP TABLE "courses_schedules_locales" CASCADE;
  DROP TABLE "_courses_v_version_schedules" CASCADE;
  DROP TABLE "_courses_v_version_schedules_locales" CASCADE;
  ALTER TABLE "courses_locales" ADD COLUMN "original_title" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_original_title" varchar;
  ALTER TABLE "courses_groups" ADD CONSTRAINT "courses_groups_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_groups" ADD CONSTRAINT "courses_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_groups_locales" ADD CONSTRAINT "courses_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_groups" ADD CONSTRAINT "_courses_v_version_groups_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v_version_groups" ADD CONSTRAINT "_courses_v_version_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_groups_locales" ADD CONSTRAINT "_courses_v_version_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v_version_groups"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_groups_order_idx" ON "courses_groups" USING btree ("_order");
  CREATE INDEX "courses_groups_parent_id_idx" ON "courses_groups" USING btree ("_parent_id");
  CREATE INDEX "courses_groups_office_idx" ON "courses_groups" USING btree ("office_id");
  CREATE UNIQUE INDEX "courses_groups_locales_locale_parent_id_unique" ON "courses_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "courses_groups_locales_parent_id_idx" ON "courses_groups_locales" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_version_groups_order_idx" ON "_courses_v_version_groups" USING btree ("_order");
  CREATE INDEX "_courses_v_version_groups_parent_id_idx" ON "_courses_v_version_groups" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_version_groups_office_idx" ON "_courses_v_version_groups" USING btree ("office_id");
  CREATE UNIQUE INDEX "_courses_v_version_groups_locales_locale_parent_id_unique" ON "_courses_v_version_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_courses_v_version_groups_locales_parent_id_idx" ON "_courses_v_version_groups_locales" USING btree ("_parent_id");
  ALTER TABLE "courses" DROP COLUMN "start_date";
  ALTER TABLE "courses" DROP COLUMN "seats";
  ALTER TABLE "courses" DROP COLUMN "hours";
  ALTER TABLE "courses" DROP COLUMN "price";
  ALTER TABLE "courses" DROP COLUMN "currency";
  ALTER TABLE "courses" DROP COLUMN "regular_price";
  ALTER TABLE "courses_locales" DROP COLUMN "days";
  ALTER TABLE "courses_locales" DROP COLUMN "schedule";
  ALTER TABLE "courses_locales" DROP COLUMN "venue";
  ALTER TABLE "courses_locales" DROP COLUMN "city";
  ALTER TABLE "courses_locales" DROP COLUMN "price_note";
  ALTER TABLE "_courses_v" DROP COLUMN "version_start_date";
  ALTER TABLE "_courses_v" DROP COLUMN "version_seats";
  ALTER TABLE "_courses_v" DROP COLUMN "version_hours";
  ALTER TABLE "_courses_v" DROP COLUMN "version_price";
  ALTER TABLE "_courses_v" DROP COLUMN "version_currency";
  ALTER TABLE "_courses_v" DROP COLUMN "version_regular_price";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_days";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_schedule";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_venue";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_city";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_price_note";
  DROP TYPE "public"."enum_courses_currency";
  DROP TYPE "public"."enum__courses_v_version_currency";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_currency" AS ENUM('EUR', 'BGN');
  CREATE TYPE "public"."enum__courses_v_version_currency" AS ENUM('EUR', 'BGN');
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
  
  DROP TABLE "courses_groups" CASCADE;
  DROP TABLE "courses_groups_locales" CASCADE;
  DROP TABLE "_courses_v_version_groups" CASCADE;
  DROP TABLE "_courses_v_version_groups_locales" CASCADE;
  ALTER TABLE "courses" ADD COLUMN "start_date" timestamp(3) with time zone;
  ALTER TABLE "courses" ADD COLUMN "seats" numeric;
  ALTER TABLE "courses" ADD COLUMN "hours" varchar;
  ALTER TABLE "courses" ADD COLUMN "price" numeric;
  ALTER TABLE "courses" ADD COLUMN "currency" "enum_courses_currency" DEFAULT 'EUR';
  ALTER TABLE "courses" ADD COLUMN "regular_price" numeric;
  ALTER TABLE "courses_locales" ADD COLUMN "days" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "schedule" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "venue" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "city" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "price_note" varchar;
  ALTER TABLE "_courses_v" ADD COLUMN "version_start_date" timestamp(3) with time zone;
  ALTER TABLE "_courses_v" ADD COLUMN "version_seats" numeric;
  ALTER TABLE "_courses_v" ADD COLUMN "version_hours" varchar;
  ALTER TABLE "_courses_v" ADD COLUMN "version_price" numeric;
  ALTER TABLE "_courses_v" ADD COLUMN "version_currency" "enum__courses_v_version_currency" DEFAULT 'EUR';
  ALTER TABLE "_courses_v" ADD COLUMN "version_regular_price" numeric;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_days" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_schedule" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_venue" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_city" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_price_note" varchar;
  ALTER TABLE "courses_schedules" ADD CONSTRAINT "courses_schedules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_schedules_locales" ADD CONSTRAINT "courses_schedules_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses_schedules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_schedules" ADD CONSTRAINT "_courses_v_version_schedules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_schedules_locales" ADD CONSTRAINT "_courses_v_version_schedules_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v_version_schedules"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_schedules_order_idx" ON "courses_schedules" USING btree ("_order");
  CREATE INDEX "courses_schedules_parent_id_idx" ON "courses_schedules" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "courses_schedules_locales_locale_parent_id_unique" ON "courses_schedules_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "courses_schedules_locales_parent_id_idx" ON "courses_schedules_locales" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_version_schedules_order_idx" ON "_courses_v_version_schedules" USING btree ("_order");
  CREATE INDEX "_courses_v_version_schedules_parent_id_idx" ON "_courses_v_version_schedules" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_courses_v_version_schedules_locales_locale_parent_id_unique" ON "_courses_v_version_schedules_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_courses_v_version_schedules_locales_parent_id_idx" ON "_courses_v_version_schedules_locales" USING btree ("_parent_id");
  ALTER TABLE "courses_locales" DROP COLUMN "original_title";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_original_title";
  DROP TYPE "public"."enum_courses_groups_format";
  DROP TYPE "public"."enum_courses_groups_currency";
  DROP TYPE "public"."enum__courses_v_version_groups_format";
  DROP TYPE "public"."enum__courses_v_version_groups_currency";`)
}
