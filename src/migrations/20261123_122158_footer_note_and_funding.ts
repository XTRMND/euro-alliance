import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The footer's text under the logo and its EU funding notice move from the company facts to the
// navigation's «Долна част» (v0.27.0).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "navigation_locales" (
  	"footer_note" varchar,
  	"funding_statement" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "site" DROP CONSTRAINT "site_funding_logos_id_media_id_fk";
  
  DROP INDEX "site_funding_funding_logos_idx";
  ALTER TABLE "navigation" ADD COLUMN "funding_logos_id" integer;
  ALTER TABLE "navigation_locales" ADD CONSTRAINT "navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "navigation_locales_locale_parent_id_unique" ON "navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_locales_parent_id_idx" ON "navigation_locales" USING btree ("_parent_id");
  ALTER TABLE "navigation" ADD CONSTRAINT "navigation_funding_logos_id_media_id_fk" FOREIGN KEY ("funding_logos_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "navigation_funding_funding_logos_idx" ON "navigation" USING btree ("funding_logos_id");
  ALTER TABLE "site" DROP COLUMN "funding_logos_id";
  ALTER TABLE "site_locales" DROP COLUMN "funding_statement";`)

  // The text under the footer's logo was built from the licence in the company facts; it's now
  // the client's own text, so an existing navigation starts with the line the footer showed.
  // The EU funding notice isn't carried over: the client wants it out of the footer
  // (23.11.2026). Its fields are in «Навигация» → «Долна част», empty, should it come back.
  await db.execute(sql`
   INSERT INTO "navigation_locales" ("footer_note", "_locale", "_parent_id")
   SELECT
     'Лицензиран център за професионално обучение, лиценз № ' || s."licence_number" || ' от ' ||
       to_char(s."licence_issued_on" AT TIME ZONE 'Europe/Sofia', 'DD.MM.YYYY'),
     'bg', n."id"
   FROM "navigation" n CROSS JOIN "site" s
   WHERE s."licence_number" IS NOT NULL AND s."licence_issued_on" IS NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "navigation_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "navigation_locales" CASCADE;
  ALTER TABLE "navigation" DROP CONSTRAINT "navigation_funding_logos_id_media_id_fk";
  
  DROP INDEX "navigation_funding_funding_logos_idx";
  ALTER TABLE "site" ADD COLUMN "funding_logos_id" integer;
  ALTER TABLE "site_locales" ADD COLUMN "funding_statement" varchar;
  ALTER TABLE "site" ADD CONSTRAINT "site_funding_logos_id_media_id_fk" FOREIGN KEY ("funding_logos_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_funding_funding_logos_idx" ON "site" USING btree ("funding_logos_id");
  ALTER TABLE "navigation" DROP COLUMN "funding_logos_id";`)
}
