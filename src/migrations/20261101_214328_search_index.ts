import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Typo tolerance for the search (word_similarity): a trusted extension, so the database's owner
  // can create it.
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`)
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
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "search_id" integer;
  CREATE INDEX "search_type_idx" ON "search" USING btree ("type");
  CREATE UNIQUE INDEX "search_source_idx" ON "search" USING btree ("source");
  CREATE INDEX "search_document_idx" ON "search" USING gin (to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("path", '') || ' ' || coalesce("excerpt", '') || ' ' || coalesce("text", '')));
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "search" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_search_fk";
  
  DROP INDEX "payload_locked_documents_rels_search_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "search_id";
  DROP TYPE "public"."enum_search_type";`)
}
