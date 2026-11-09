import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" ADD COLUMN "admin_edited_at" timestamp(3) with time zone;
  ALTER TABLE "_courses_v" ADD COLUMN "version_admin_edited_at" timestamp(3) with time zone;
  ALTER TABLE "news" ADD COLUMN "admin_edited_at" timestamp(3) with time zone;
  ALTER TABLE "_news_v" ADD COLUMN "version_admin_edited_at" timestamp(3) with time zone;
  ALTER TABLE "programs" ADD COLUMN "admin_edited_at" timestamp(3) with time zone;
  ALTER TABLE "_programs_v" ADD COLUMN "version_admin_edited_at" timestamp(3) with time zone;
  ALTER TABLE "textbook_systems" ADD COLUMN "admin_edited_at" timestamp(3) with time zone;
  ALTER TABLE "_textbook_systems_v" ADD COLUMN "version_admin_edited_at" timestamp(3) with time zone;
  ALTER TABLE "certificates" ADD COLUMN "admin_edited_at" timestamp(3) with time zone;
  ALTER TABLE "_certificates_v" ADD COLUMN "version_admin_edited_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" DROP COLUMN "admin_edited_at";
  ALTER TABLE "_courses_v" DROP COLUMN "version_admin_edited_at";
  ALTER TABLE "news" DROP COLUMN "admin_edited_at";
  ALTER TABLE "_news_v" DROP COLUMN "version_admin_edited_at";
  ALTER TABLE "programs" DROP COLUMN "admin_edited_at";
  ALTER TABLE "_programs_v" DROP COLUMN "version_admin_edited_at";
  ALTER TABLE "textbook_systems" DROP COLUMN "admin_edited_at";
  ALTER TABLE "_textbook_systems_v" DROP COLUMN "version_admin_edited_at";
  ALTER TABLE "certificates" DROP COLUMN "admin_edited_at";
  ALTER TABLE "_certificates_v" DROP COLUMN "version_admin_edited_at";`)
}
