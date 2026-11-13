# Seeding staging

How the staging database gets the site's content: the base seed (company facts, offices, programme pages, the ЦПО and teachers' lists, funded projects, licence scans, the privacy and cookie policies from Figma) and the old site's content (all 203 news as text with Figma's seven covers, the 55 approved courses with their groups, the language pages, the translation languages).

Two steps:

| Step | Where | What |
|---|---|---|
| `pnpm seed:scrape` | locally | Crawls euro-alliance.net (one request a second) and writes the fixtures to `seed/`: JSON, plus the documents the news link to in `seed/media/`. Committed, so the box never reaches the old site. `--cached` re-extracts from the last crawl in `scripts/import/out/`. |
| `pnpm seed:staging` | the staging box | Reads `seed/` and writes through Payload's Local API (the upload hooks make the photo tints). Refuses to run unless `SEED_TARGET=staging`, refuses with `NODE_ENV=production` or `ALLOW_INDEXING=true`. `--dry-run` prints every write it would make and writes nothing. |

Safe to run again: each record is matched on a natural key (news on `legacyUrl`, courses on `slug`, their groups on the old entry's `legacyUrl`, professions on `code`, media on `filename`, the rest on their title or name) and updated only when the fixture differs. The base seed only fills in what's missing, as on every start of the app. A cover chosen in the admin is kept. Admin users aren't touched. **A record a person has edited in the admin is never overwritten** (news, courses, groups, language pages, textbook systems, certificates: `src/hooks/admin-edits.ts` dates every change made by a signed-in user, and the seed leaves such a record as it is). Where the old site says otherwise, the report lists it under «Edited in the admin, so kept as edited»; update it by hand if the old site's version should win. The base seed's content is only ever filled in. Nothing is invented: what the sources don't give stays empty and is listed in the report at the end of the run, after the counts per collection.

The repository is public, so documents with personal data stay out of `seed/`: the children's contest results lists (`scripts/seed/withheld.json`, the user's decision of 09.11.2026), and any document whose link reads as results or prize winners. Their links are removed from the article; the report lists them.

## On the staging box

Staging is on the VPS (`deploy/README.md`): `/opt/euro-alliance-staging`, the containers `staging-site` and `staging-postgres`, the media volume `euro-alliance-staging_media`. The site's image has no CLI and the VPS never builds, so the seed has its own image, built by CI from `main`:

1. Once the merge is deployed (CI green on `main`), run **Actions → Seed image → Run workflow** on `main` (or `gh workflow run seed-image.yml --ref main`). It pushes `musev/eac:seed-staging` (about 1.9 GB) to Docker Hub.
2. On the VPS, as root (`ssh root@185.123.188.101`, or log in as yourself and `sudo -i`): the Docker Hub login that pulls the private `musev/eac` is root's, and the backups go to `/root/backups`. Paste the block in one go. `seed` and `STAMP` live only in that shell: after a reconnect, paste it again with `STAMP` set to the backup's stamp.

```sh
cd /opt/euro-alliance-staging
docker pull musev/eac:seed-staging
STAMP=$(date +%Y%m%d-%H%M)
mkdir -p /root/backups

# The database and secret the running site uses, and nothing else from its environment (no job
# queues, no email). Memory capped: the VPS's 2 GB are shared with the CRM.
seed() {
  DATABASE_URL="$(docker exec staging-site printenv DATABASE_URL)" \
  PAYLOAD_SECRET="$(docker exec staging-site printenv PAYLOAD_SECRET)" \
  docker run --rm --memory 1g --network euro-alliance-staging_default \
    -e DATABASE_URL -e PAYLOAD_SECRET -e SEED_TARGET=staging \
    -v euro-alliance-staging_media:/app/media \
    musev/eac:seed-staging pnpm seed:staging "$@"
}
```

### 1. Back up

The database, and the media volume (the seed adds files to it).

```sh
docker exec staging-postgres pg_dump -U euro_alliance -d euro_alliance -Fc > /root/backups/staging-$STAMP.dump
docker exec -i staging-postgres pg_restore -l < /root/backups/staging-$STAMP.dump | head -5   # a readable archive
docker run --rm -v euro-alliance-staging_media:/media:ro -v /root/backups:/backup alpine \
  tar czf /backup/staging-media-$STAMP.tgz -C /media .
ls -lh /root/backups/*$STAMP*
docker exec staging-postgres psql -U euro_alliance -d euro_alliance -Atc "select count(*) from users"   # note it
```

### 2. Dry run

```sh
seed --dry-run 2>&1 | tee /root/backups/seed-dry-run-$STAMP.log
```

If it refuses with «the database is missing … migration(s)», staging-site hasn't started on this version yet: the site applies migrations when it starts (`src/instrumentation.ts`), and the seed never does. `docker restart staging-site`, wait until `docker ps` shows it `healthy`, and run it again.

Check the first line names the database `db:5432/euro_alliance`, then read «Would write (N)» and the counts. On one seeded before, only what changed. On an empty database it's over 400 writes, and the count runs a few higher than the real run: a dry run can't see what it would have created earlier in the same run, such as a textbook system two pages share.

### 3. Run

```sh
seed 2>&1 | tee /root/backups/seed-$STAMP.log
# The site caches its CMS reads (src/lib/cms.ts) and the seed can't reach that cache: clear it.
docker exec staging-site rm -rf /app/.next/cache/fetch-cache && docker restart staging-site
```

### 4. Check

```sh
seed --dry-run 2>&1 | grep '^Would write'      # «Would write (0)»: a second run changes nothing
docker exec staging-postgres psql -U euro_alliance -d euro_alliance -c "
  select (select count(*) from news) as news,
         (select count(*) from courses) as courses,
         (select count(*) from professions) as professions,
         (select count(*) from teacher_programmes) as teacher_programmes,
         (select count(*) from offices) as offices,
         (select count(*) from legal_pages) as legal_pages,
         (select count(*) from users) as users;
  select legacy_url, count(*) from news group by 1 having count(*) > 1;"
```

Expected: 203 news, 55 courses, 20 professions, 29 teacher programmes, 3 offices and 2 legal pages (more only where the client has added their own), the same number of users as in step 1, and no duplicate rows. Then open on https://staging.euro-alliance.net: `/novini` and an article with a cover (Ден на народните будители), `/kursove` and a course page, `/profesionalno-obuchenie/profesii`, `/profesionalno-obuchenie/pedagogicheski-spetsialisti`, `/prevodi` (the translation languages), `/ezitsi/nemski/uchenitsi`, `/poveritelnost` and `/biskvitki`.

The report at the end of `seed-$STAMP.log` lists what's missing or estimated, for the client.

### Undo

The database restore was tried on a test database (09.11.2026); the media restore (the `find … -delete` line) wasn't run. Check the volume name before running it.

```sh
docker stop staging-site
docker exec -i staging-postgres pg_restore -U euro_alliance -d euro_alliance --clean --if-exists --single-transaction < /root/backups/staging-$STAMP.dump
docker run --rm -v euro-alliance-staging_media:/media -v /root/backups:/backup alpine \
  sh -c "find /media -mindepth 1 -delete && tar xzf /backup/staging-media-$STAMP.tgz -C /media"
docker start staging-site && docker exec staging-site rm -rf /app/.next/cache/fetch-cache && docker restart staging-site
```

## Refreshing the fixtures

Locally: `pnpm seed:scrape` (about 7 minutes), then `git diff --stat seed/`. New old-site entries (a news article, a dated course) come in as they are. A dated course that the approved list (`scripts/import/courses.json`) doesn't take in is listed in the report, not imported. Commit `seed/` on a branch, open a PR (with its version, `docs/git-workflow.md` § 6), and run the steps above once it's merged and deployed.

`pnpm import:covers` applies the local photo picker's choices (`scripts/import/out/photo-decisions.json`). It's local only: staging is shown without them (02.11.2026).
