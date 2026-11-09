# Seeding staging

How the staging database gets the site's content: the base seed (company facts, offices, programme pages, the ЦПО and teachers' lists, funded projects, licence scans, the privacy and cookie policies from Figma) and the old site's content (all 203 news as text with Figma's seven covers, the 55 approved courses with their groups, the language pages, the translation languages).

Two steps:

| Step | Where | What |
|---|---|---|
| `pnpm seed:scrape` | locally | Crawls euro-alliance.net (one request a second) and writes the fixtures to `seed/`: JSON, plus the documents the news link to in `seed/media/`. Committed, so the box never reaches the old site. `--cached` re-extracts from the last crawl in `scripts/import/out/`. |
| `pnpm seed:staging` | the staging box | Reads `seed/` and writes through Payload's Local API (the upload hooks make the photo tints). Refuses to run unless `SEED_TARGET=staging`, refuses with `NODE_ENV=production` or `ALLOW_INDEXING=true`. `--dry-run` prints every write it would make and writes nothing. |

Safe to run again: each record is matched on a natural key (news on `legacyUrl`, courses on `slug`, professions on `code`, media on `filename`, the rest on their title or name) and updated only when the fixture differs. The base seed only fills in what's missing, as on every start of the app. A cover chosen in the admin is kept. Admin users aren't touched. **A record a person has edited in the admin is never overwritten** (news, courses, language pages, textbook systems, certificates: `src/hooks/admin-edits.ts` dates every change made by a signed-in user, and the seed leaves such a record as it is). Where the old site says otherwise, the report lists it under «Edited in the admin, so kept as edited»; update it by hand if the old site's version should win. The base seed's content is only ever filled in. Nothing is invented: what the sources don't give stays empty and is listed in the report at the end of the run, after the counts per collection.

The repository is public, so documents with personal data stay out of `seed/`: the children's contest results lists (`scripts/seed/withheld.json`, the user's decision of 09.11.2026), and any document whose link reads as results or prize winners. Their links are removed from the article; the report lists them.

## On the staging box

The Docker image has no CLI, so the seed runs from its own image (`--target seed` of the Dockerfile), on the app's network, with the app's environment file and media volume. Build it from a checkout of the commit staging runs, so the schema matches.

```sh
cd ~/euro-alliance                 # a checkout of the repository
git fetch && git checkout <the commit staging runs>
docker build --target seed -t euro-alliance-seed .

APP=<the staging app's container>
DB=<its PostgreSQL container>
ENV_FILE=<the env file the app runs with: DATABASE_URL, PAYLOAD_SECRET>
NET=$(docker inspect -f '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}} {{end}}' "$APP" | awk '{print $1}')
MEDIA=$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/app/media"}}{{if .Name}}{{.Name}}{{else}}{{.Source}}{{end}}{{end}}{{end}}' "$APP")
echo "network: $NET, media: $MEDIA"   # both must be set
STAMP=$(date +%Y%m%d-%H%M)
mkdir -p ~/backups

seed() {
  docker run --rm --network "$NET" --env-file "$ENV_FILE" -e SEED_TARGET=staging \
    -v "$MEDIA:/app/media" euro-alliance-seed pnpm seed:staging "$@"
}
```

If `DATABASE_URL` points at `localhost` (Postgres on the host, not in a container), replace `--network "$NET"` with `--network host`.

### 1. Back up

The database, and the media volume (the seed adds files to it).

```sh
docker exec "$DB" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > ~/backups/staging-$STAMP.dump
docker exec -i "$DB" pg_restore -l < ~/backups/staging-$STAMP.dump | head -5   # a readable archive
docker run --rm -v "$MEDIA:/media:ro" -v ~/backups:/backup alpine \
  tar czf /backup/staging-media-$STAMP.tgz -C /media .
ls -lh ~/backups/*$STAMP*
docker exec "$DB" sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "select count(*) from users"'   # note it
```

### 2. Dry run

```sh
seed --dry-run 2>&1 | tee ~/backups/seed-dry-run-$STAMP.log
```

Check the first line names the staging database, then read «Would write (N)» and the counts. On one seeded before, only what changed. On an empty database it's over 400 writes, and the count runs a few higher than the real run: a dry run can't see what it would have created earlier in the same run, such as a textbook system two pages share.

### 3. Run

```sh
seed 2>&1 | tee ~/backups/seed-$STAMP.log
# The app caches its CMS reads (src/lib/cms.ts) and the seed can't reach that cache: clear it.
docker exec "$APP" rm -rf /app/.next/cache/fetch-cache && docker restart "$APP"
```

### 4. Check

```sh
seed --dry-run 2>&1 | grep '^Would write'      # «Would write (0)»: a second run changes nothing
docker exec "$DB" sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
  select (select count(*) from news) as news,
         (select count(*) from courses) as courses,
         (select count(*) from professions) as professions,
         (select count(*) from teacher_programmes) as teacher_programmes,
         (select count(*) from offices) as offices,
         (select count(*) from legal_pages) as legal_pages,
         (select count(*) from users) as users;
  select legacy_url, count(*) from news group by 1 having count(*) > 1;"'
```

Expected: 203 news, 55 courses, 20 professions, 29 teacher programmes, 3 offices and 2 legal pages (more only where the client has added their own), the same number of users as in step 1, and no duplicate rows. Then open on staging: `/novini` and an article with a cover (Ден на народните будители), `/kursove` and a course page, `/profesionalno-obuchenie/profesii`, `/profesionalno-obuchenie/pedagogicheski-spetsialisti`, `/prevodi` (the translation languages), `/ezitsi/nemski/uchenitsi`, `/poveritelnost` and `/biskvitki`.

The report at the end of `seed-$STAMP.log` lists what's missing or estimated, for the client.

### Undo

The database restore was tried on a test database (09.11.2026); the media restore (the `find … -delete` line) wasn't run. Check `$MEDIA` before running it.

```sh
docker stop "$APP"
docker exec -i "$DB" sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --single-transaction' < ~/backups/staging-$STAMP.dump
docker run --rm -v "$MEDIA:/media" -v ~/backups:/backup alpine \
  sh -c "find /media -mindepth 1 -delete && tar xzf /backup/staging-media-$STAMP.tgz -C /media"
docker start "$APP" && docker exec "$APP" rm -rf /app/.next/cache/fetch-cache && docker restart "$APP"
```

## Refreshing the fixtures

Locally: `pnpm seed:scrape` (about 7 minutes), then `git diff --stat seed/`. New old-site entries (a news article, a dated course) come in as they are. A dated course that the approved list (`scripts/import/courses.json`) doesn't take in is listed in the report, not imported. Commit `seed/` on a branch, open a PR, and run the steps above once it's deployed.

`pnpm import:covers` applies the local photo picker's choices (`scripts/import/out/photo-decisions.json`). It's local only: staging is shown without them (02.11.2026).
