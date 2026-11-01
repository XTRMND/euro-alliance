import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_teacher_programmes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__teacher_programmes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__teacher_programmes_v_published_locale" AS ENUM('bg', 'en');
  CREATE TABLE "programs_blocks_teacher_programmes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "programs_blocks_teacher_programmes_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_programs_v_blocks_teacher_programmes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_programs_v_blocks_teacher_programmes_locales" (
  	"heading" varchar,
  	"highlight" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "teacher_programmes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"number" varchar,
  	"hours" numeric,
  	"credits" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_teacher_programmes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "teacher_programmes_locales" (
  	"theme" varchar,
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_teacher_programmes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_number" varchar,
  	"version_hours" numeric,
  	"version_credits" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__teacher_programmes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__teacher_programmes_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_teacher_programmes_v_locales" (
  	"version_theme" varchar,
  	"version_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "programs_blocks_figures_locales" ADD COLUMN "note" varchar;
  ALTER TABLE "_programs_v_blocks_figures_locales" ADD COLUMN "note" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "teacher_programmes_id" integer;
  ALTER TABLE "programs_blocks_teacher_programmes" ADD CONSTRAINT "programs_blocks_teacher_programmes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_blocks_teacher_programmes_locales" ADD CONSTRAINT "programs_blocks_teacher_programmes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_blocks_teacher_programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_teacher_programmes" ADD CONSTRAINT "_programs_v_blocks_teacher_programmes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_blocks_teacher_programmes_locales" ADD CONSTRAINT "_programs_v_blocks_teacher_programmes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programs_v_blocks_teacher_programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teacher_programmes_locales" ADD CONSTRAINT "teacher_programmes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teacher_programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_teacher_programmes_v" ADD CONSTRAINT "_teacher_programmes_v_parent_id_teacher_programmes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."teacher_programmes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_teacher_programmes_v_locales" ADD CONSTRAINT "_teacher_programmes_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_teacher_programmes_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "programs_blocks_teacher_programmes_order_idx" ON "programs_blocks_teacher_programmes" USING btree ("_order");
  CREATE INDEX "programs_blocks_teacher_programmes_parent_id_idx" ON "programs_blocks_teacher_programmes" USING btree ("_parent_id");
  CREATE INDEX "programs_blocks_teacher_programmes_path_idx" ON "programs_blocks_teacher_programmes" USING btree ("_path");
  CREATE UNIQUE INDEX "programs_blocks_teacher_programmes_locales_locale_parent_id_" ON "programs_blocks_teacher_programmes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programs_blocks_teacher_programmes_locales_parent_id_idx" ON "programs_blocks_teacher_programmes_locales" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_teacher_programmes_order_idx" ON "_programs_v_blocks_teacher_programmes" USING btree ("_order");
  CREATE INDEX "_programs_v_blocks_teacher_programmes_parent_id_idx" ON "_programs_v_blocks_teacher_programmes" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_blocks_teacher_programmes_path_idx" ON "_programs_v_blocks_teacher_programmes" USING btree ("_path");
  CREATE UNIQUE INDEX "_programs_v_blocks_teacher_programmes_locales_locale_parent_" ON "_programs_v_blocks_teacher_programmes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programs_v_blocks_teacher_programmes_locales_parent_id_idx" ON "_programs_v_blocks_teacher_programmes_locales" USING btree ("_parent_id");
  CREATE INDEX "teacher_programmes__order_idx" ON "teacher_programmes" USING btree ("_order");
  CREATE INDEX "teacher_programmes_updated_at_idx" ON "teacher_programmes" USING btree ("updated_at");
  CREATE INDEX "teacher_programmes_created_at_idx" ON "teacher_programmes" USING btree ("created_at");
  CREATE INDEX "teacher_programmes__status_idx" ON "teacher_programmes" USING btree ("_status");
  CREATE UNIQUE INDEX "teacher_programmes_locales_locale_parent_id_unique" ON "teacher_programmes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teacher_programmes_locales_parent_id_idx" ON "teacher_programmes_locales" USING btree ("_parent_id");
  CREATE INDEX "_teacher_programmes_v_parent_idx" ON "_teacher_programmes_v" USING btree ("parent_id");
  CREATE INDEX "_teacher_programmes_v_version_version__order_idx" ON "_teacher_programmes_v" USING btree ("version__order");
  CREATE INDEX "_teacher_programmes_v_version_version_updated_at_idx" ON "_teacher_programmes_v" USING btree ("version_updated_at");
  CREATE INDEX "_teacher_programmes_v_version_version_created_at_idx" ON "_teacher_programmes_v" USING btree ("version_created_at");
  CREATE INDEX "_teacher_programmes_v_version_version__status_idx" ON "_teacher_programmes_v" USING btree ("version__status");
  CREATE INDEX "_teacher_programmes_v_created_at_idx" ON "_teacher_programmes_v" USING btree ("created_at");
  CREATE INDEX "_teacher_programmes_v_updated_at_idx" ON "_teacher_programmes_v" USING btree ("updated_at");
  CREATE INDEX "_teacher_programmes_v_snapshot_idx" ON "_teacher_programmes_v" USING btree ("snapshot");
  CREATE INDEX "_teacher_programmes_v_published_locale_idx" ON "_teacher_programmes_v" USING btree ("published_locale");
  CREATE INDEX "_teacher_programmes_v_latest_idx" ON "_teacher_programmes_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_teacher_programmes_v_locales_locale_parent_id_unique" ON "_teacher_programmes_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_teacher_programmes_v_locales_parent_id_idx" ON "_teacher_programmes_v_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_teacher_programmes_fk" FOREIGN KEY ("teacher_programmes_id") REFERENCES "public"."teacher_programmes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_teacher_programmes_id_idx" ON "payload_locked_documents_rels" USING btree ("teacher_programmes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programs_blocks_teacher_programmes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programs_blocks_teacher_programmes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_teacher_programmes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programs_v_blocks_teacher_programmes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "teacher_programmes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "teacher_programmes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_teacher_programmes_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_teacher_programmes_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "programs_blocks_teacher_programmes" CASCADE;
  DROP TABLE "programs_blocks_teacher_programmes_locales" CASCADE;
  DROP TABLE "_programs_v_blocks_teacher_programmes" CASCADE;
  DROP TABLE "_programs_v_blocks_teacher_programmes_locales" CASCADE;
  DROP TABLE "teacher_programmes" CASCADE;
  DROP TABLE "teacher_programmes_locales" CASCADE;
  DROP TABLE "_teacher_programmes_v" CASCADE;
  DROP TABLE "_teacher_programmes_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_teacher_programmes_fk";
  
  DROP INDEX "payload_locked_documents_rels_teacher_programmes_id_idx";
  ALTER TABLE "programs_blocks_figures_locales" DROP COLUMN "note";
  ALTER TABLE "_programs_v_blocks_figures_locales" DROP COLUMN "note";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "teacher_programmes_id";
  DROP TYPE "public"."enum_teacher_programmes_status";
  DROP TYPE "public"."enum__teacher_programmes_v_version_status";
  DROP TYPE "public"."enum__teacher_programmes_v_published_locale";`)
}
