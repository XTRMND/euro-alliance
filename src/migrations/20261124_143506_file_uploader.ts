import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "files" ADD COLUMN "uploaded_by_id" integer;
  ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "files_uploaded_by_idx" ON "files" USING btree ("uploaded_by_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "files" DROP CONSTRAINT "files_uploaded_by_id_users_id_fk";
  
  DROP INDEX "files_uploaded_by_idx";
  ALTER TABLE "files" DROP COLUMN "uploaded_by_id";`)
}
