import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// docs/admin-redesign.md, decision 6: prices become records of their own (the prices collection)
// instead of fields on a group. «This deploy migrates data.»
// up: every group with a price gets a price record for that group (price, currency, regular
//     price; its label and note in every locale), then the price fields leave the group. A group
//     without a price gets none (it shows «Попитайте», as before). Two unique indexes keep one
//     price per group and one base price (no group) per course.
// down: every group gets its price fields back: its own price, or else its course's base price
//     (what the site showed for it). A base price of a course without groups has nowhere to go.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_prices_currency" AS ENUM('EUR', 'BGN');
  CREATE TABLE "prices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"admin_edited_at" timestamp(3) with time zone,
  	"course_id" integer NOT NULL,
  	"group_id" integer,
  	"price" numeric NOT NULL,
  	"currency" "enum_prices_currency" DEFAULT 'EUR' NOT NULL,
  	"regular_price" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prices_locales" (
  	"label" varchar,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "prices_id" integer;
  ALTER TABLE "prices" ADD CONSTRAINT "prices_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prices" ADD CONSTRAINT "prices_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prices_locales" ADD CONSTRAINT "prices_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prices"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "prices_course_idx" ON "prices" USING btree ("course_id");
  CREATE INDEX "prices_group_idx" ON "prices" USING btree ("group_id");
  CREATE INDEX "prices_updated_at_idx" ON "prices" USING btree ("updated_at");
  CREATE INDEX "prices_created_at_idx" ON "prices" USING btree ("created_at");
  CREATE UNIQUE INDEX "prices_locales_locale_parent_id_unique" ON "prices_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "prices_locales_parent_id_idx" ON "prices_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prices_fk" FOREIGN KEY ("prices_id") REFERENCES "public"."prices"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_prices_id_idx" ON "payload_locked_documents_rels" USING btree ("prices_id");
  CREATE UNIQUE INDEX "prices_one_per_group_idx" ON "prices" ("group_id") WHERE "group_id" IS NOT NULL;
  CREATE UNIQUE INDEX "prices_one_base_per_course_idx" ON "prices" ("course_id") WHERE "group_id" IS NULL;
  INSERT INTO "prices" ("course_id", "group_id", "price", "currency", "regular_price")
  SELECT g."course_id", g."id", g."price", coalesce(g."currency", 'EUR')::text::"enum_prices_currency", g."regular_price"
  FROM "groups" g WHERE g."price" IS NOT NULL ORDER BY g."id";
  INSERT INTO "prices_locales" ("label", "note", "_locale", "_parent_id")
  SELECT l."price_label", l."price_note", l."_locale", p."id"
  FROM "groups_locales" l JOIN "prices" p ON p."group_id" = l."_parent_id"
  WHERE l."price_label" IS NOT NULL OR l."price_note" IS NOT NULL;

  ALTER TABLE "groups" DROP COLUMN "price";
  ALTER TABLE "groups" DROP COLUMN "currency";
  ALTER TABLE "groups" DROP COLUMN "regular_price";
  ALTER TABLE "groups_locales" DROP COLUMN "price_label";
  ALTER TABLE "groups_locales" DROP COLUMN "price_note";
  DROP TYPE "public"."enum_groups_currency";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_groups_currency" AS ENUM('EUR', 'BGN');
  ALTER TABLE "groups" ADD COLUMN "price" numeric;
  ALTER TABLE "groups" ADD COLUMN "currency" "enum_groups_currency" DEFAULT 'EUR';
  ALTER TABLE "groups" ADD COLUMN "regular_price" numeric;
  ALTER TABLE "groups_locales" ADD COLUMN "price_label" varchar;
  ALTER TABLE "groups_locales" ADD COLUMN "price_note" varchar;
  UPDATE "groups" g SET "price" = p."price", "currency" = p."currency"::text::"enum_groups_currency", "regular_price" = p."regular_price"
  FROM "prices" p
  WHERE p."id" = coalesce(
    (SELECT o."id" FROM "prices" o WHERE o."group_id" = g."id"),
    (SELECT b."id" FROM "prices" b WHERE b."course_id" = g."course_id" AND b."group_id" IS NULL));
  UPDATE "groups_locales" gl SET "price_label" = pl."label", "price_note" = pl."note"
  FROM "prices_locales" pl, "groups" g
  WHERE g."id" = gl."_parent_id" AND pl."_locale" = gl."_locale" AND pl."_parent_id" = coalesce(
    (SELECT o."id" FROM "prices" o WHERE o."group_id" = g."id"),
    (SELECT b."id" FROM "prices" b WHERE b."course_id" = g."course_id" AND b."group_id" IS NULL));
  INSERT INTO "groups_locales" ("price_label", "price_note", "_locale", "_parent_id")
  SELECT pl."label", pl."note", pl."_locale", g."id"
  FROM "prices_locales" pl JOIN "prices" p ON p."id" = pl."_parent_id" JOIN "groups" g ON g."id" = p."group_id"
  WHERE NOT EXISTS (SELECT 1 FROM "groups_locales" gl WHERE gl."_parent_id" = g."id" AND gl."_locale" = pl."_locale");

  ALTER TABLE "prices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prices_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "prices" CASCADE;
  DROP TABLE "prices_locales" CASCADE;
  DROP INDEX IF EXISTS "payload_locked_documents_rels_prices_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "prices_id";
  DROP TYPE "public"."enum_prices_currency";`)
}
