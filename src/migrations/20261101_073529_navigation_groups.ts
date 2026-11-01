import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "navigation_header_left_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_header_left_children_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_header_right_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_header_right_children_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_menu_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_menu_children_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "navigation_header_left" ALTER COLUMN "href" DROP NOT NULL;
  ALTER TABLE "navigation_header_right" ALTER COLUMN "href" DROP NOT NULL;
  ALTER TABLE "navigation_menu" ALTER COLUMN "href" DROP NOT NULL;
  ALTER TABLE "navigation_header_left_children" ADD CONSTRAINT "navigation_header_left_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_left"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_left_children_locales" ADD CONSTRAINT "navigation_header_left_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_left_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_right_children" ADD CONSTRAINT "navigation_header_right_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_right"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_right_children_locales" ADD CONSTRAINT "navigation_header_right_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_right_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_menu_children" ADD CONSTRAINT "navigation_menu_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_menu_children_locales" ADD CONSTRAINT "navigation_menu_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_menu_children"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "navigation_header_left_children_order_idx" ON "navigation_header_left_children" USING btree ("_order");
  CREATE INDEX "navigation_header_left_children_parent_id_idx" ON "navigation_header_left_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_header_left_children_locales_locale_parent_id_uni" ON "navigation_header_left_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_header_left_children_locales_parent_id_idx" ON "navigation_header_left_children_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_header_right_children_order_idx" ON "navigation_header_right_children" USING btree ("_order");
  CREATE INDEX "navigation_header_right_children_parent_id_idx" ON "navigation_header_right_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_header_right_children_locales_locale_parent_id_un" ON "navigation_header_right_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_header_right_children_locales_parent_id_idx" ON "navigation_header_right_children_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_menu_children_order_idx" ON "navigation_menu_children" USING btree ("_order");
  CREATE INDEX "navigation_menu_children_parent_id_idx" ON "navigation_menu_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_menu_children_locales_locale_parent_id_unique" ON "navigation_menu_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_menu_children_locales_parent_id_idx" ON "navigation_menu_children_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "navigation_header_left_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header_left_children_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header_right_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header_right_children_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_menu_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_menu_children_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "navigation_header_left_children" CASCADE;
  DROP TABLE "navigation_header_left_children_locales" CASCADE;
  DROP TABLE "navigation_header_right_children" CASCADE;
  DROP TABLE "navigation_header_right_children_locales" CASCADE;
  DROP TABLE "navigation_menu_children" CASCADE;
  DROP TABLE "navigation_menu_children_locales" CASCADE;
  ALTER TABLE "navigation_header_left" ALTER COLUMN "href" SET NOT NULL;
  ALTER TABLE "navigation_header_right" ALTER COLUMN "href" SET NOT NULL;
  ALTER TABLE "navigation_menu" ALTER COLUMN "href" SET NOT NULL;`)
}
