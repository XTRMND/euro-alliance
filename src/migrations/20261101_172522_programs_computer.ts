import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_programs_blocks_features_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  CREATE TYPE "public"."enum__programs_v_blocks_features_callout_cta_destination" AS ENUM('courses', 'languageCourses', 'languagesStudents', 'languagesAdults', 'certificates', 'professions', 'vouchers', 'voucherInquiry', 'teachers', 'farmers', 'computerCourses', 'translations', 'sendDocument', 'levelTest', 'otherInquiry', 'news', 'about', 'contact');
  ALTER TABLE "programs_blocks_features" ADD COLUMN "callout_cta_destination" "enum_programs_blocks_features_callout_cta_destination";
  ALTER TABLE "programs_blocks_features_locales" ADD COLUMN "callout_heading" varchar;
  ALTER TABLE "programs_blocks_features_locales" ADD COLUMN "callout_text" varchar;
  ALTER TABLE "programs_blocks_features_locales" ADD COLUMN "callout_cta_label" varchar;
  ALTER TABLE "_programs_v_blocks_features" ADD COLUMN "callout_cta_destination" "enum__programs_v_blocks_features_callout_cta_destination";
  ALTER TABLE "_programs_v_blocks_features_locales" ADD COLUMN "callout_heading" varchar;
  ALTER TABLE "_programs_v_blocks_features_locales" ADD COLUMN "callout_text" varchar;
  ALTER TABLE "_programs_v_blocks_features_locales" ADD COLUMN "callout_cta_label" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programs_blocks_features" DROP COLUMN "callout_cta_destination";
  ALTER TABLE "programs_blocks_features_locales" DROP COLUMN "callout_heading";
  ALTER TABLE "programs_blocks_features_locales" DROP COLUMN "callout_text";
  ALTER TABLE "programs_blocks_features_locales" DROP COLUMN "callout_cta_label";
  ALTER TABLE "_programs_v_blocks_features" DROP COLUMN "callout_cta_destination";
  ALTER TABLE "_programs_v_blocks_features_locales" DROP COLUMN "callout_heading";
  ALTER TABLE "_programs_v_blocks_features_locales" DROP COLUMN "callout_text";
  ALTER TABLE "_programs_v_blocks_features_locales" DROP COLUMN "callout_cta_label";
  DROP TYPE "public"."enum_programs_blocks_features_callout_cta_destination";
  DROP TYPE "public"."enum__programs_v_blocks_features_callout_cta_destination";`)
}
