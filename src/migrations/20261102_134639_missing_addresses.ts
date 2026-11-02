import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "missing_addresses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL,
  	"hits" numeric DEFAULT 0 NOT NULL,
  	"last_seen" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "missing_addresses_id" integer;
  CREATE UNIQUE INDEX "missing_addresses_path_idx" ON "missing_addresses" USING btree ("path");
  CREATE INDEX "missing_addresses_updated_at_idx" ON "missing_addresses" USING btree ("updated_at");
  CREATE INDEX "missing_addresses_created_at_idx" ON "missing_addresses" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_missing_addresses_fk" FOREIGN KEY ("missing_addresses_id") REFERENCES "public"."missing_addresses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_missing_addresses_id_idx" ON "payload_locked_documents_rels" USING btree ("missing_addresses_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "missing_addresses" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "missing_addresses" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_missing_addresses_fk";
  
  DROP INDEX "payload_locked_documents_rels_missing_addresses_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "missing_addresses_id";`)
}
