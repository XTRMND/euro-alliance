import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// docs/admin-redesign.md, decisions 4 and 7. «This deploy migrates data.»
// up:
// - Course categories become the five programme branches. «exams» → languages with the new
//   «Подготовка за изпит» checkbox; «vouchers» → languages for a course with a language, else
//   computer («Дигитални умения»), with «С ваучер» set. In the courses and in their versions.
// - The translation global's languages move into the «Преводи и легализация» programme (type
//   translations: its current state and its latest version), and the global goes. Without that
//   programme there's nowhere to move them (the base seed creates it on first start, when the
//   global is still empty).
// down: voucher courses → «vouchers», exam preparation → «exams»; the programme's languages go
//   back into the global.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "programs_translation_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programs_translation_languages_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_programs_v_version_translation_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programs_v_version_translation_languages_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  INSERT INTO "programs_translation_languages" ("_order", "_parent_id", "id")
  SELECT tl."_order", p."id", tl."id" FROM "translation_languages" tl
  CROSS JOIN (SELECT "id" FROM "programs" WHERE "type" = 'translations' ORDER BY "id" LIMIT 1) p;
  INSERT INTO "programs_translation_languages_locales" ("name", "_locale", "_parent_id")
  SELECT l."name", l."_locale", l."_parent_id" FROM "translation_languages_locales" l
  WHERE EXISTS (SELECT 1 FROM "programs_translation_languages" t WHERE t."id" = l."_parent_id");
  INSERT INTO "_programs_v_version_translation_languages" ("_order", "_parent_id", "_uuid")
  SELECT t."_order", v."id", t."id" FROM "programs_translation_languages" t
  JOIN "_programs_v" v ON v."parent_id" = t."_parent_id" AND v."latest";
  INSERT INTO "_programs_v_version_translation_languages_locales" ("name", "_locale", "_parent_id")
  SELECT l."name", l."_locale", vt."id" FROM "programs_translation_languages_locales" l
  JOIN "_programs_v_version_translation_languages" vt ON vt."_uuid" = l."_parent_id";

  DROP TABLE "translation_languages" CASCADE;
  DROP TABLE "translation_languages_locales" CASCADE;
  DROP TABLE "translation" CASCADE;
  ALTER TABLE "courses" ADD COLUMN "exam_prep" boolean;
  ALTER TABLE "_courses_v" ADD COLUMN "version_exam_prep" boolean;
  ALTER TABLE "courses" ALTER COLUMN "category" SET DATA TYPE text;
  ALTER TABLE "_courses_v" ALTER COLUMN "version_category" SET DATA TYPE text;
  UPDATE "courses" SET "exam_prep" = true, "category" = 'languages' WHERE "category" = 'exams';
  UPDATE "courses" SET "voucher_eligible" = true,
    "category" = CASE WHEN "language" IS NOT NULL THEN 'languages' ELSE 'computer' END
  WHERE "category" = 'vouchers';
  UPDATE "_courses_v" SET "version_exam_prep" = true, "version_category" = 'languages' WHERE "version_category" = 'exams';
  UPDATE "_courses_v" SET "version_voucher_eligible" = true,
    "version_category" = CASE WHEN "version_language" IS NOT NULL THEN 'languages' ELSE 'computer' END
  WHERE "version_category" = 'vouchers';
  DROP TYPE "public"."enum_courses_category";
  CREATE TYPE "public"."enum_courses_category" AS ENUM('languages', 'vocational', 'teachers', 'farmers', 'computer');
  ALTER TABLE "courses" ALTER COLUMN "category" SET DATA TYPE "public"."enum_courses_category" USING "category"::"public"."enum_courses_category";
  DROP TYPE "public"."enum__courses_v_version_category";
  CREATE TYPE "public"."enum__courses_v_version_category" AS ENUM('languages', 'vocational', 'teachers', 'farmers', 'computer');
  ALTER TABLE "_courses_v" ALTER COLUMN "version_category" SET DATA TYPE "public"."enum__courses_v_version_category" USING "version_category"::"public"."enum__courses_v_version_category";
  ALTER TABLE "programs_translation_languages" ADD CONSTRAINT "programs_translation_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_translation_languages_locales" ADD CONSTRAINT "programs_translation_languages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_translation_languages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_version_translation_languages" ADD CONSTRAINT "_programs_v_version_translation_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_version_translation_languages_locales" ADD CONSTRAINT "_programs_v_version_translation_languages_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_version_translation_languages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "programs_translation_languages_order_idx" ON "programs_translation_languages" USING btree ("_order");
  CREATE INDEX "programs_translation_languages_parent_id_idx" ON "programs_translation_languages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_translation_languages_locales_locale_parent_id_uniq" ON "programs_translation_languages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_translation_languages_locales_parent_id_idx" ON "programs_translation_languages_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_version_translation_languages_order_idx" ON "_programs_v_version_translation_languages" USING btree ("_order");
  CREATE INDEX "_programs_v_version_translation_languages_parent_id_idx" ON "_programs_v_version_translation_languages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programs_v_version_translation_languages_locales_locale_par" ON "_programs_v_version_translation_languages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_version_translation_languages_locales_parent_idx" ON "_programs_v_version_translation_languages_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" ALTER COLUMN "category" SET DATA TYPE text;
  ALTER TABLE "_courses_v" ALTER COLUMN "version_category" SET DATA TYPE text;
  DROP TYPE "public"."enum_courses_category";
  DROP TYPE "public"."enum__courses_v_version_category";
  CREATE TYPE "public"."enum_courses_category" AS ENUM('languages', 'exams', 'vocational', 'vouchers', 'teachers', 'farmers', 'computer');
  CREATE TYPE "public"."enum__courses_v_version_category" AS ENUM('languages', 'exams', 'vocational', 'vouchers', 'teachers', 'farmers', 'computer');
  UPDATE "courses" SET "category" = 'exams' WHERE "exam_prep";
  UPDATE "courses" SET "category" = 'vouchers' WHERE "voucher_eligible";
  UPDATE "_courses_v" SET "version_category" = 'exams' WHERE "version_exam_prep";
  UPDATE "_courses_v" SET "version_category" = 'vouchers' WHERE "version_voucher_eligible";
  ALTER TABLE "courses" ALTER COLUMN "category" SET DATA TYPE "public"."enum_courses_category" USING "category"::"public"."enum_courses_category";
  ALTER TABLE "_courses_v" ALTER COLUMN "version_category" SET DATA TYPE "public"."enum__courses_v_version_category" USING "version_category"::"public"."enum__courses_v_version_category";
  CREATE TABLE "translation_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "translation_languages_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "translation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  INSERT INTO "translation" ("id", "updated_at", "created_at")
  SELECT 1, now(), now() WHERE EXISTS (SELECT 1 FROM "programs_translation_languages");
  INSERT INTO "translation_languages" ("_order", "_parent_id", "id")
  SELECT t."_order", 1, t."id" FROM "programs_translation_languages" t
  WHERE t."_parent_id" = (SELECT "id" FROM "programs" WHERE "type" = 'translations' ORDER BY "id" LIMIT 1);
  INSERT INTO "translation_languages_locales" ("name", "_locale", "_parent_id")
  SELECT l."name", l."_locale", l."_parent_id" FROM "programs_translation_languages_locales" l
  WHERE l."name" IS NOT NULL AND EXISTS (SELECT 1 FROM "translation_languages" t WHERE t."id" = l."_parent_id");

  DROP TABLE "programs_translation_languages" CASCADE;
  DROP TABLE "programs_translation_languages_locales" CASCADE;
  DROP TABLE "_programs_v_version_translation_languages" CASCADE;
  DROP TABLE "_programs_v_version_translation_languages_locales" CASCADE;
  ALTER TABLE "translation_languages" ADD CONSTRAINT "translation_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."translation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "translation_languages_locales" ADD CONSTRAINT "translation_languages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."translation_languages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "translation_languages_order_idx" ON "translation_languages" USING btree ("_order");
  CREATE INDEX "translation_languages_parent_id_idx" ON "translation_languages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "translation_languages_locales_locale_parent_id_unique" ON "translation_languages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "translation_languages_locales_parent_id_idx" ON "translation_languages_locales" USING btree ("_parent_id");
  ALTER TABLE "courses" DROP COLUMN "exam_prep";
  ALTER TABLE "_courses_v" DROP COLUMN "version_exam_prep";`)
}
