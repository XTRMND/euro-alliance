import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_programs_upcoming_link_scope" AS ENUM('program', 'languages');
  CREATE TYPE "public"."enum__programs_v_version_upcoming_link_scope" AS ENUM('program', 'languages');
  ALTER TYPE "public"."enum_courses_topic" ADD VALUE 'bulgarian' BEFORE 'exam-prep';
  ALTER TYPE "public"."enum__courses_v_version_topic" ADD VALUE 'bulgarian' BEFORE 'exam-prep';
  ALTER TYPE "public"."enum_programs_hero_sticker" ADD VALUE 'bulgarian' BEFORE 'exam-prep';
  ALTER TYPE "public"."enum__programs_v_version_hero_sticker" ADD VALUE 'bulgarian' BEFORE 'exam-prep';
  ALTER TYPE "public"."enum_home_programs_cards_sticker" ADD VALUE 'bulgarian' BEFORE 'exam-prep';
  ALTER TABLE "programs" ADD COLUMN "upcoming_link_scope" "enum_programs_upcoming_link_scope" DEFAULT 'program';
  ALTER TABLE "_programs_v" ADD COLUMN "version_upcoming_link_scope" "enum__programs_v_version_upcoming_link_scope" DEFAULT 'program';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" ALTER COLUMN "topic" SET DATA TYPE text;
  DROP TYPE "public"."enum_courses_topic";
  CREATE TYPE "public"."enum_courses_topic" AS ENUM('english', 'german', 'french', 'italian', 'spanish', 'russian', 'exam-prep', 'exams', 'student', 'teaching', 'professional', 'corporate', 'computer', 'farming', 'translation');
  ALTER TABLE "courses" ALTER COLUMN "topic" SET DATA TYPE "public"."enum_courses_topic" USING "topic"::"public"."enum_courses_topic";
  ALTER TABLE "_courses_v" ALTER COLUMN "version_topic" SET DATA TYPE text;
  DROP TYPE "public"."enum__courses_v_version_topic";
  CREATE TYPE "public"."enum__courses_v_version_topic" AS ENUM('english', 'german', 'french', 'italian', 'spanish', 'russian', 'exam-prep', 'exams', 'student', 'teaching', 'professional', 'corporate', 'computer', 'farming', 'translation');
  ALTER TABLE "_courses_v" ALTER COLUMN "version_topic" SET DATA TYPE "public"."enum__courses_v_version_topic" USING "version_topic"::"public"."enum__courses_v_version_topic";
  ALTER TABLE "programs" ALTER COLUMN "hero_sticker" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_hero_sticker";
  CREATE TYPE "public"."enum_programs_hero_sticker" AS ENUM('english', 'german', 'french', 'italian', 'spanish', 'russian', 'exam-prep', 'exams', 'student', 'teaching', 'professional', 'corporate', 'computer', 'farming', 'translation');
  ALTER TABLE "programs" ALTER COLUMN "hero_sticker" SET DATA TYPE "public"."enum_programs_hero_sticker" USING "hero_sticker"::"public"."enum_programs_hero_sticker";
  ALTER TABLE "_programs_v" ALTER COLUMN "version_hero_sticker" SET DATA TYPE text;
  DROP TYPE "public"."enum__programs_v_version_hero_sticker";
  CREATE TYPE "public"."enum__programs_v_version_hero_sticker" AS ENUM('english', 'german', 'french', 'italian', 'spanish', 'russian', 'exam-prep', 'exams', 'student', 'teaching', 'professional', 'corporate', 'computer', 'farming', 'translation');
  ALTER TABLE "_programs_v" ALTER COLUMN "version_hero_sticker" SET DATA TYPE "public"."enum__programs_v_version_hero_sticker" USING "version_hero_sticker"::"public"."enum__programs_v_version_hero_sticker";
  ALTER TABLE "home_programs_cards" ALTER COLUMN "sticker" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_programs_cards_sticker";
  CREATE TYPE "public"."enum_home_programs_cards_sticker" AS ENUM('english', 'german', 'french', 'italian', 'spanish', 'russian', 'exam-prep', 'exams', 'student', 'teaching', 'professional', 'corporate', 'computer', 'farming', 'translation');
  ALTER TABLE "home_programs_cards" ALTER COLUMN "sticker" SET DATA TYPE "public"."enum_home_programs_cards_sticker" USING "sticker"::"public"."enum_home_programs_cards_sticker";
  ALTER TABLE "programs" DROP COLUMN "upcoming_link_scope";
  ALTER TABLE "_programs_v" DROP COLUMN "version_upcoming_link_scope";
  DROP TYPE "public"."enum_programs_upcoming_link_scope";
  DROP TYPE "public"."enum__programs_v_version_upcoming_link_scope";`)
}
