import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The follow-up to docs/admin-redesign.md (13.11.2026): «Изпити и сертификати» have a kind and a
// «Кога». «This deploy migrates data.»
// up: every record is «Международен сертификат», but ДЗИ and НВО (by the code on their seal),
//     which are «Държавен изпит»; for those two the text that stood in «Издава» («12. клас»,
//     «Края на 7. клас») moves to «Кога» and «Издава» is emptied. The same in their versions.
//     The site's card shows «Издава» or else «Кога» on its first line, so it reads as before.
// down: «Кога» goes back into an empty «Издава», and the two columns go.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_certificates_kind" AS ENUM('international', 'state');
  CREATE TYPE "public"."enum__certificates_v_version_kind" AS ENUM('international', 'state');
  ALTER TABLE "certificates" ADD COLUMN "kind" "enum_certificates_kind" DEFAULT 'international';
  ALTER TABLE "certificates_locales" ADD COLUMN "when" varchar;
  ALTER TABLE "_certificates_v" ADD COLUMN "version_kind" "enum__certificates_v_version_kind" DEFAULT 'international';
  ALTER TABLE "_certificates_v_locales" ADD COLUMN "version_when" varchar;

  UPDATE "certificates" SET "kind" = 'state' WHERE "code" IN ('ДЗИ', 'НВО');
  UPDATE "_certificates_v" SET "version_kind" = 'state' WHERE "version_code" IN ('ДЗИ', 'НВО');
  UPDATE "certificates_locales" l SET "when" = l."issuer", "issuer" = NULL
    FROM "certificates" c WHERE c."id" = l."_parent_id" AND c."kind" = 'state';
  UPDATE "_certificates_v_locales" l SET "version_when" = l."version_issuer", "version_issuer" = NULL
    FROM "_certificates_v" v WHERE v."id" = l."_parent_id" AND v."version_kind" = 'state';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "certificates_locales" SET "issuer" = "when" WHERE "issuer" IS NULL AND "when" IS NOT NULL;
  UPDATE "_certificates_v_locales" SET "version_issuer" = "version_when"
    WHERE "version_issuer" IS NULL AND "version_when" IS NOT NULL;
  ALTER TABLE "certificates" DROP COLUMN "kind";
  ALTER TABLE "certificates_locales" DROP COLUMN "when";
  ALTER TABLE "_certificates_v" DROP COLUMN "version_kind";
  ALTER TABLE "_certificates_v_locales" DROP COLUMN "version_when";
  DROP TYPE "public"."enum_certificates_kind";
  DROP TYPE "public"."enum__certificates_v_version_kind";`)
}
