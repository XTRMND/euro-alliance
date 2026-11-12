import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// docs/admin-redesign.md, decision 5: a course's groups become records of their own (the groups
// collection) instead of an array on the course. «This deploy migrates data.»
// up: every array row of a course (its current state, the one the site shows) becomes a group with
//     the same dates, seats, schedule, format, office, price and old address; its label becomes
//     the group's name. The array's copies in the course's versions go with the array: a group has
//     no history of its own. The course keeps its versions otherwise.
// down: every group becomes an array row of its course again, in the current state and in the
//     course's latest version, ordered by start date.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_groups_format" AS ENUM('in-person', 'online');
  CREATE TYPE "public"."enum_groups_currency" AS ENUM('EUR', 'BGN');
  CREATE TABLE "groups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"admin_edited_at" timestamp(3) with time zone,
  	"course_id" integer NOT NULL,
  	"start" timestamp(3) with time zone NOT NULL,
  	"end" timestamp(3) with time zone,
  	"seats" numeric,
  	"hours" varchar,
  	"format" "enum_groups_format",
  	"office_id" integer,
  	"price" numeric,
  	"currency" "enum_groups_currency" DEFAULT 'EUR',
  	"regular_price" numeric,
  	"legacy_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "groups_locales" (
  	"title" varchar,
  	"name" varchar,
  	"days" varchar,
  	"price_label" varchar,
  	"price_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "groups" ADD COLUMN "_array_id" varchar;
  INSERT INTO "groups" ("_array_id", "course_id", "start", "end", "seats", "hours", "format", "office_id", "price", "currency", "regular_price", "legacy_url")
  SELECT cg."id", cg."_parent_id", cg."start_date", cg."end_date", cg."seats", cg."hours",
    cg."format"::text::"enum_groups_format", cg."office_id", cg."price",
    coalesce(cg."currency", 'EUR')::text::"enum_groups_currency", cg."regular_price", cg."legacy_url"
  FROM "courses_groups" cg
  WHERE cg."start_date" IS NOT NULL
  ORDER BY cg."_parent_id", cg."_order";
  INSERT INTO "groups_locales" ("title", "name", "days", "price_label", "price_note", "_locale", "_parent_id")
  SELECT concat_ws(' · ', (to_char(g."start" AT TIME ZONE 'Europe/Sofia', 'FMDD') || ' ' || (ARRAY['януари','февруари','март','април','май','юни','юли','август','септември','октомври','ноември','декември'])[extract(month FROM g."start" AT TIME ZONE 'Europe/Sofia')::int] || ' ' || to_char(g."start" AT TIME ZONE 'Europe/Sofia', 'YYYY')), nullif(l."days", ''), nullif(l."label", '')),
    l."label", l."days", l."price_label", l."price_note", l."_locale", g."id"
  FROM "courses_groups_locales" l JOIN "groups" g ON g."_array_id" = l."_parent_id";
  INSERT INTO "groups_locales" ("title", "_locale", "_parent_id")
  SELECT (to_char(g."start" AT TIME ZONE 'Europe/Sofia', 'FMDD') || ' ' || (ARRAY['януари','февруари','март','април','май','юни','юли','август','септември','октомври','ноември','декември'])[extract(month FROM g."start" AT TIME ZONE 'Europe/Sofia')::int] || ' ' || to_char(g."start" AT TIME ZONE 'Europe/Sofia', 'YYYY')), 'bg', g."id"
  FROM "groups" g
  WHERE NOT EXISTS (SELECT 1 FROM "groups_locales" l WHERE l."_parent_id" = g."id" AND l."_locale" = 'bg');
  ALTER TABLE "groups" DROP COLUMN "_array_id";

  ALTER TABLE "courses_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_groups_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_version_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_version_groups_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "courses_groups" CASCADE;
  DROP TABLE "courses_groups_locales" CASCADE;
  DROP TABLE "_courses_v_version_groups" CASCADE;
  DROP TABLE "_courses_v_version_groups_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "groups_id" integer;
  ALTER TABLE "groups" ADD CONSTRAINT "groups_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "groups" ADD CONSTRAINT "groups_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "groups_locales" ADD CONSTRAINT "groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "groups_course_idx" ON "groups" USING btree ("course_id");
  CREATE INDEX "groups_office_idx" ON "groups" USING btree ("office_id");
  CREATE INDEX "groups_updated_at_idx" ON "groups" USING btree ("updated_at");
  CREATE INDEX "groups_created_at_idx" ON "groups" USING btree ("created_at");
  CREATE UNIQUE INDEX "groups_locales_locale_parent_id_unique" ON "groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "groups_locales_parent_id_idx" ON "groups_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_groups_fk" FOREIGN KEY ("groups_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("groups_id");
  DROP TYPE "public"."enum_courses_groups_format";
  DROP TYPE "public"."enum_courses_groups_currency";
  DROP TYPE "public"."enum__courses_v_version_groups_format";
  DROP TYPE "public"."enum__courses_v_version_groups_currency";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  INSERT INTO "courses_groups" ("_order", "_parent_id", "id", "start_date", "end_date", "seats", "hours", "format", "office_id", "price", "currency", "regular_price", "legacy_url")
  SELECT row_number() OVER (PARTITION BY g."course_id" ORDER BY g."start", g."id"), g."course_id",
    lpad(to_hex(g."id"), 24, '0'), g."start", g."end", g."seats", g."hours",
    g."format"::text::"enum_courses_groups_format", g."office_id", g."price",
    g."currency"::text::"enum_courses_groups_currency", g."regular_price", g."legacy_url"
  FROM "groups" g;
  INSERT INTO "courses_groups_locales" ("label", "days", "price_label", "price_note", "_locale", "_parent_id")
  SELECT l."name", l."days", l."price_label", l."price_note", l."_locale", lpad(to_hex(l."_parent_id"), 24, '0')
  FROM "groups_locales" l
  WHERE l."name" IS NOT NULL OR l."days" IS NOT NULL OR l."price_label" IS NOT NULL OR l."price_note" IS NOT NULL;
  INSERT INTO "_courses_v_version_groups" ("_order", "_parent_id", "_uuid", "start_date", "end_date", "seats", "hours", "format", "office_id", "price", "currency", "regular_price", "legacy_url")
  SELECT cg."_order", v."id", cg."id", cg."start_date", cg."end_date", cg."seats", cg."hours",
    cg."format"::text::"enum__courses_v_version_groups_format", cg."office_id", cg."price",
    cg."currency"::text::"enum__courses_v_version_groups_currency", cg."regular_price", cg."legacy_url"
  FROM "courses_groups" cg JOIN "_courses_v" v ON v."parent_id" = cg."_parent_id" AND v."latest";
  INSERT INTO "_courses_v_version_groups_locales" ("label", "days", "price_label", "price_note", "_locale", "_parent_id")
  SELECT l."label", l."days", l."price_label", l."price_note", l."_locale", vg."id"
  FROM "courses_groups_locales" l
  JOIN "_courses_v_version_groups" vg ON vg."_uuid" = l."_parent_id";

  ALTER TABLE "groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "groups_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "groups" CASCADE;
  DROP TABLE "groups_locales" CASCADE;
  DROP INDEX IF EXISTS "payload_locked_documents_rels_groups_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "groups_id";
  DROP TYPE "public"."enum_groups_format";
  DROP TYPE "public"."enum_groups_currency";`)
}
