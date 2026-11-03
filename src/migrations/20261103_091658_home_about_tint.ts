import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_media_tints_tint" ADD VALUE 'homeAbout' BEFORE 'news';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // The 38% tints have no place in the old list (their files stay until pnpm media:regen).
  await db.execute(sql`
   DELETE FROM "media_tints" WHERE "tint" = 'homeAbout';
  ALTER TABLE "media_tints" ALTER COLUMN "tint" SET DATA TYPE text;
  DROP TYPE "public"."enum_media_tints_tint";
  CREATE TYPE "public"."enum_media_tints_tint" AS ENUM('hero', 'homeNews', 'about', 'news');
  ALTER TABLE "media_tints" ALTER COLUMN "tint" SET DATA TYPE "public"."enum_media_tints_tint" USING "tint"::"public"."enum_media_tints_tint";`)
}
