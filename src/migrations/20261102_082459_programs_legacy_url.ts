import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programs" ADD COLUMN "legacy_url" varchar;
  ALTER TABLE "_programs_v" ADD COLUMN "version_legacy_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programs" DROP COLUMN "legacy_url";
  ALTER TABLE "_programs_v" DROP COLUMN "version_legacy_url";`)
}
