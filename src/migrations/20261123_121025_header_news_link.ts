import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// «Новини» in the header, first on the right of the logo (the client's request, 23.11.2026). No
// schema change: a navigation that exists gets the link once, unless a header link already goes
// to the news page. A new database has no navigation yet; the base seed writes it with the link.
// After this the link is the client's: taken out in the admin, it stays out.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   WITH nav AS (
     SELECT n."id" FROM "navigation" n
     WHERE NOT EXISTS (
       SELECT 1 FROM "navigation_header_left" l
       WHERE l."_parent_id" = n."id" AND l."type" = 'page' AND l."page" = 'news'
     ) AND NOT EXISTS (
       SELECT 1 FROM "navigation_header_right" r
       WHERE r."_parent_id" = n."id" AND r."type" = 'page' AND r."page" = 'news'
     )
   ), moved AS (
     UPDATE "navigation_header_right" r SET "_order" = r."_order" + 1
     FROM nav WHERE r."_parent_id" = nav."id"
   ), added AS (
     INSERT INTO "navigation_header_right" ("_order", "_parent_id", "id", "type", "page")
     SELECT 1, nav."id", substr(md5(random()::text || clock_timestamp()::text), 1, 24), 'page', 'news'
     FROM nav
     RETURNING "id"
   )
   INSERT INTO "navigation_header_right_locales" ("label", "_locale", "_parent_id")
   SELECT 'Новини', 'bg', added."id" FROM added;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // The labels go with their links (ON DELETE CASCADE); the links left are numbered from 1 again.
  await db.execute(sql`
   DELETE FROM "navigation_header_right" WHERE "type" = 'page' AND "page" = 'news';
   UPDATE "navigation_header_right" r SET "_order" = s."n"
   FROM (
     SELECT "id", row_number() OVER (PARTITION BY "_parent_id" ORDER BY "_order") AS "n"
     FROM "navigation_header_right"
   ) s WHERE s."id" = r."id";`)
}
