import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programs_blocks_price_factors" DROP COLUMN "counter";
  ALTER TABLE "_programs_v_blocks_price_factors" DROP COLUMN "counter";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programs_blocks_price_factors" ADD COLUMN "counter" boolean DEFAULT true;
  ALTER TABLE "_programs_v_blocks_price_factors" ADD COLUMN "counter" boolean DEFAULT true;`)
}
