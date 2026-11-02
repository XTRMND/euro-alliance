import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" ADD COLUMN "free" boolean;
  ALTER TABLE "_courses_v" ADD COLUMN "version_free" boolean;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" DROP COLUMN "free";
  ALTER TABLE "_courses_v" DROP COLUMN "version_free";`)
}
