import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_level_unit" AS ENUM('level', 'grade');
  CREATE TYPE "public"."enum__courses_v_version_level_unit" AS ENUM('level', 'grade');
  ALTER TABLE "courses" ADD COLUMN "level_unit" "enum_courses_level_unit" DEFAULT 'level';
  ALTER TABLE "_courses_v" ADD COLUMN "version_level_unit" "enum__courses_v_version_level_unit" DEFAULT 'level';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" DROP COLUMN "level_unit";
  ALTER TABLE "_courses_v" DROP COLUMN "version_level_unit";
  DROP TYPE "public"."enum_courses_level_unit";
  DROP TYPE "public"."enum__courses_v_version_level_unit";`)
}
