import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "courses_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_courses_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "news" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "news_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "news_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_news_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_news_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_news_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "programs" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "programs_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "programs_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_programs_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_programs_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_programs_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "legal_pages" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "legal_pages_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "legal_pages_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_legal_pages_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_legal_pages_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_legal_pages_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "home" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "home_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "contact" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "contact_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "about" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "about_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "about_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programs" ADD CONSTRAINT "programs_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programs_v" ADD CONSTRAINT "_programs_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_pages" ADD CONSTRAINT "legal_pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_legal_pages_v" ADD CONSTRAINT "_legal_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact" ADD CONSTRAINT "contact_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "courses_meta_meta_image_idx" ON "courses" USING btree ("meta_image_id");
  CREATE INDEX "_courses_v_version_meta_version_meta_image_idx" ON "_courses_v" USING btree ("version_meta_image_id");
  CREATE INDEX "news_meta_meta_image_idx" ON "news" USING btree ("meta_image_id");
  CREATE INDEX "_news_v_version_meta_version_meta_image_idx" ON "_news_v" USING btree ("version_meta_image_id");
  CREATE INDEX "programs_meta_meta_image_idx" ON "programs" USING btree ("meta_image_id");
  CREATE INDEX "_programs_v_version_meta_version_meta_image_idx" ON "_programs_v" USING btree ("version_meta_image_id");
  CREATE INDEX "legal_pages_meta_meta_image_idx" ON "legal_pages" USING btree ("meta_image_id");
  CREATE INDEX "_legal_pages_v_version_meta_version_meta_image_idx" ON "_legal_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "home_meta_meta_image_idx" ON "home" USING btree ("meta_image_id");
  CREATE INDEX "contact_meta_meta_image_idx" ON "contact" USING btree ("meta_image_id");
  CREATE INDEX "about_meta_meta_image_idx" ON "about" USING btree ("meta_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" DROP CONSTRAINT "courses_meta_image_id_media_id_fk";
  
  ALTER TABLE "_courses_v" DROP CONSTRAINT "_courses_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "news" DROP CONSTRAINT "news_meta_image_id_media_id_fk";
  
  ALTER TABLE "_news_v" DROP CONSTRAINT "_news_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "programs" DROP CONSTRAINT "programs_meta_image_id_media_id_fk";
  
  ALTER TABLE "_programs_v" DROP CONSTRAINT "_programs_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "legal_pages" DROP CONSTRAINT "legal_pages_meta_image_id_media_id_fk";
  
  ALTER TABLE "_legal_pages_v" DROP CONSTRAINT "_legal_pages_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "home" DROP CONSTRAINT "home_meta_image_id_media_id_fk";
  
  ALTER TABLE "contact" DROP CONSTRAINT "contact_meta_image_id_media_id_fk";
  
  ALTER TABLE "about" DROP CONSTRAINT "about_meta_image_id_media_id_fk";
  
  DROP INDEX "courses_meta_meta_image_idx";
  DROP INDEX "_courses_v_version_meta_version_meta_image_idx";
  DROP INDEX "news_meta_meta_image_idx";
  DROP INDEX "_news_v_version_meta_version_meta_image_idx";
  DROP INDEX "programs_meta_meta_image_idx";
  DROP INDEX "_programs_v_version_meta_version_meta_image_idx";
  DROP INDEX "legal_pages_meta_meta_image_idx";
  DROP INDEX "_legal_pages_v_version_meta_version_meta_image_idx";
  DROP INDEX "home_meta_meta_image_idx";
  DROP INDEX "contact_meta_meta_image_idx";
  DROP INDEX "about_meta_meta_image_idx";
  ALTER TABLE "courses" DROP COLUMN "meta_image_id";
  ALTER TABLE "courses_locales" DROP COLUMN "meta_title";
  ALTER TABLE "courses_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_courses_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_meta_description";
  ALTER TABLE "news" DROP COLUMN "meta_image_id";
  ALTER TABLE "news_locales" DROP COLUMN "meta_title";
  ALTER TABLE "news_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_news_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_news_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_news_v_locales" DROP COLUMN "version_meta_description";
  ALTER TABLE "programs" DROP COLUMN "meta_image_id";
  ALTER TABLE "programs_locales" DROP COLUMN "meta_title";
  ALTER TABLE "programs_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_programs_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_programs_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_programs_v_locales" DROP COLUMN "version_meta_description";
  ALTER TABLE "legal_pages" DROP COLUMN "meta_image_id";
  ALTER TABLE "legal_pages_locales" DROP COLUMN "meta_title";
  ALTER TABLE "legal_pages_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_legal_pages_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_legal_pages_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_legal_pages_v_locales" DROP COLUMN "version_meta_description";
  ALTER TABLE "home" DROP COLUMN "meta_image_id";
  ALTER TABLE "home_locales" DROP COLUMN "meta_title";
  ALTER TABLE "home_locales" DROP COLUMN "meta_description";
  ALTER TABLE "contact" DROP COLUMN "meta_image_id";
  ALTER TABLE "contact_locales" DROP COLUMN "meta_title";
  ALTER TABLE "contact_locales" DROP COLUMN "meta_description";
  ALTER TABLE "about" DROP COLUMN "meta_image_id";
  ALTER TABLE "about_locales" DROP COLUMN "meta_title";
  ALTER TABLE "about_locales" DROP COLUMN "meta_description";`)
}
