import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news_locales" ADD COLUMN "short_title" varchar;
  ALTER TABLE "news_locales" ADD COLUMN "lead" varchar;
  ALTER TABLE "_news_v_locales" ADD COLUMN "version_short_title" varchar;
  ALTER TABLE "_news_v_locales" ADD COLUMN "version_lead" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news_locales" DROP COLUMN "short_title";
  ALTER TABLE "news_locales" DROP COLUMN "lead";
  ALTER TABLE "_news_v_locales" DROP COLUMN "version_short_title";
  ALTER TABLE "_news_v_locales" DROP COLUMN "version_lead";`)
}
