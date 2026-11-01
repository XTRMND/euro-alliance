import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" ADD COLUMN "hours" varchar;
  ALTER TABLE "courses" ADD COLUMN "regular_price" numeric;
  ALTER TABLE "courses_locales" ADD COLUMN "description" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "days" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "duration" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "venue" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "city" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "level_name" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "program" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "document" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "included" varchar;
  ALTER TABLE "_courses_v" ADD COLUMN "version_hours" varchar;
  ALTER TABLE "_courses_v" ADD COLUMN "version_regular_price" numeric;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_description" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_days" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_duration" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_venue" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_city" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_level_name" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_program" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_document" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_included" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" DROP COLUMN "hours";
  ALTER TABLE "courses" DROP COLUMN "regular_price";
  ALTER TABLE "courses_locales" DROP COLUMN "description";
  ALTER TABLE "courses_locales" DROP COLUMN "days";
  ALTER TABLE "courses_locales" DROP COLUMN "duration";
  ALTER TABLE "courses_locales" DROP COLUMN "venue";
  ALTER TABLE "courses_locales" DROP COLUMN "city";
  ALTER TABLE "courses_locales" DROP COLUMN "level_name";
  ALTER TABLE "courses_locales" DROP COLUMN "program";
  ALTER TABLE "courses_locales" DROP COLUMN "document";
  ALTER TABLE "courses_locales" DROP COLUMN "included";
  ALTER TABLE "_courses_v" DROP COLUMN "version_hours";
  ALTER TABLE "_courses_v" DROP COLUMN "version_regular_price";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_description";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_days";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_duration";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_venue";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_city";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_level_name";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_program";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_document";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_included";`)
}
