import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// docs/admin-redesign.md, decision 8. «This deploy migrates data» (it drops two tables).
// up: drops the search index (derived data: the search page now reads the published content
//     itself) and the «Липсващи адреси» log with its rows (the 404 addresses collected so far).
// down: recreates both tables, empty, with the index's full-text index. The older version fills
//     the search index again when it starts; the collected 404 addresses don't come back.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "missing_addresses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_search_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_missing_addresses_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_search_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_missing_addresses_id_idx";
  DROP TABLE "search" CASCADE;
  DROP TABLE "missing_addresses" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "search_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "missing_addresses_id";
  DROP TYPE "public"."enum_search_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_search_type" AS ENUM('course', 'page', 'news');
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_search_type" NOT NULL,
  	"title" varchar NOT NULL,
  	"path" varchar,
  	"excerpt" varchar,
  	"text" varchar,
  	"url" varchar NOT NULL,
  	"source" varchar NOT NULL,
  	"source_id" numeric,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "missing_addresses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL,
  	"hits" numeric DEFAULT 0 NOT NULL,
  	"last_seen" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "search_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "missing_addresses_id" integer;
  CREATE INDEX "search_type_idx" ON "search" USING btree ("type");
  CREATE UNIQUE INDEX "search_source_idx" ON "search" USING btree ("source");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX "search_document_idx" ON "search" USING gin (to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("path", '') || ' ' || coalesce("excerpt", '') || ' ' || coalesce("text", '')));
  CREATE UNIQUE INDEX "missing_addresses_path_idx" ON "missing_addresses" USING btree ("path");
  CREATE INDEX "missing_addresses_updated_at_idx" ON "missing_addresses" USING btree ("updated_at");
  CREATE INDEX "missing_addresses_created_at_idx" ON "missing_addresses" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_missing_addresses_fk" FOREIGN KEY ("missing_addresses_id") REFERENCES "public"."missing_addresses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_locked_documents_rels_missing_addresses_id_idx" ON "payload_locked_documents_rels" USING btree ("missing_addresses_id");`)
}
