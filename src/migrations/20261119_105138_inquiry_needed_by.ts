import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inquiries" ADD COLUMN "needed_by" timestamp(3) with time zone;
  CREATE INDEX "inquiries_needed_by_idx" ON "inquiries" USING btree ("needed_by");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "inquiries_needed_by_idx";
  ALTER TABLE "inquiries" DROP COLUMN "needed_by";`)
}
