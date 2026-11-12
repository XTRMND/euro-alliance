import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// docs/admin-redesign.md, decision 9: an inquiry's status is «Нова / В работа / Приключено».
// «This deploy migrates data.»
// up: new → new (Нова), in-progress → in-progress (В работа), closed → closed (Приключено),
//     and contract → closed with the new «Довело до договор» checkbox on, which keeps the
//     inquiry past the year's retention as the status did.
// down: a closed inquiry with the checkbox on is «Договор» again; the checkbox goes.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "inquiries" ADD COLUMN "contract" boolean;
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DEFAULT 'new'::text;
  UPDATE "inquiries" SET "contract" = true, "status" = 'closed' WHERE "status" = 'contract';
  DROP TYPE "public"."enum_inquiries_status";
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'in-progress', 'closed');
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DEFAULT 'new'::"public"."enum_inquiries_status";
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DATA TYPE "public"."enum_inquiries_status" USING "status"::"public"."enum_inquiries_status";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DEFAULT 'new'::text;
  UPDATE "inquiries" SET "status" = 'contract' WHERE "contract" AND "status" = 'closed';
  DROP TYPE "public"."enum_inquiries_status";
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'in-progress', 'contract', 'closed');
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DEFAULT 'new'::"public"."enum_inquiries_status";
  ALTER TABLE "inquiries" ALTER COLUMN "status" SET DATA TYPE "public"."enum_inquiries_status" USING "status"::"public"."enum_inquiries_status";
  ALTER TABLE "inquiries" DROP COLUMN "contract";`)
}
