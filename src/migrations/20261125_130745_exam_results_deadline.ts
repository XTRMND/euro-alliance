import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "exams" ADD COLUMN "results_by" timestamp(3) with time zone;
  ALTER TABLE "exams_locales" ADD COLUMN "results_place" varchar;
  ALTER TABLE "_exams_v" ADD COLUMN "version_results_by" timestamp(3) with time zone;
  ALTER TABLE "_exams_v_locales" ADD COLUMN "version_results_place" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "exams" DROP COLUMN "results_by";
  ALTER TABLE "exams_locales" DROP COLUMN "results_place";
  ALTER TABLE "_exams_v" DROP COLUMN "version_results_by";
  ALTER TABLE "_exams_v_locales" DROP COLUMN "version_results_place";`)
}
