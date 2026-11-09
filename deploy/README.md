# Deploy

Staging runs on the user's VPS (185.123.188.101, SuperHosting), beside the Euro Alliance CRM.
DNS for `staging` and `staging-cms` is an A record at SuperHosting (cPanel → Zone Editor); MX is
never touched.

| Address | What | Access |
|---|---|---|
| https://staging.euro-alliance.net | the site | basic auth |
| https://staging-cms.euro-alliance.net | the same app; `/` opens `/admin` | basic auth, then the Payload login |
| https://crm.euro-alliance.net | the CRM (separate repo) | IP allowlist in the CRM's nginx |

## On the VPS

```
/opt/edge                     Caddy on 80/443, Let's Encrypt (edge/)
  Caddyfile, docker-compose.yml
  .env                        STAGING_AUTH_USER, STAGING_AUTH_HASH (bcrypt, single-quoted)
/opt/euro-alliance-staging    Postgres 18 + the site (staging/)
  docker-compose.yml, deploy.sh
  .env                        POSTGRES_PASSWORD
  site.env                    the app's environment (staging/site.env.example)
/opt/euro-alliance-crm        the CRM; its nginx (crm-proxy) sits behind Caddy on the `edge` network
```

The stacks share the external Docker network `edge` (`docker network create edge`, once). Caddy
reaches `staging-site:3000` and `crm-proxy:80` by container name.

## How a deploy happens

On every push to `main`, CI's `docker` job builds the image with
`NEXT_PUBLIC_SITE_URL=https://staging.euro-alliance.net` and pushes `musev/eac:site-staging` (and
`site-staging-<sha>`) to Docker Hub. Once typecheck, lint, unit tests and the secret scan pass too,
`deploy-staging` SSHes into the VPS with a key that may only run `deploy.sh` (pull, restart,
prune). e2e and Lighthouse don't hold the deploy. The VPS never builds.

Repository secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `VPS_HOST`, `VPS_USER`,
`STAGING_DEPLOY_KEY` (private key; its public half is in root's `authorized_keys` as
`command="/opt/euro-alliance-staging/deploy.sh",restrict ssh-ed25519 …`). The VPS's ED25519 host
key is pinned in the workflow (`HOST_KEY`); update it there if the server is rebuilt.

By hand, on the VPS: `/opt/euro-alliance-staging/deploy.sh`. To roll back, set
`SITE_TAG=site-staging-<sha>` in `/opt/euro-alliance-staging/.env` and run it again.

## Staging is never indexed

Three layers, all needed only outside production:

1. The app: `ALLOW_INDEXING=false` (`site.env`), so `robots.txt` is `Disallow: /` and every page
   has `<meta name="robots" content="noindex, nofollow">`.
2. Caddy: `X-Robots-Tag: noindex, nofollow` on every response, files and media included.
3. Caddy: basic auth on everything except `robots.txt`, which stays readable so crawlers see the
   disallow instead of a 401.

**Production:** set `ALLOW_INDEXING=true`, drop `INQUIRY_EMAIL_OVERRIDE`, and give the production
host its own Caddy block **without** the `staging` snippet (no basic auth, no `X-Robots-Tag`).
Build the production image with the production `NEXT_PUBLIC_SITE_URL`: the staging image carries
the staging address. Then check that `https://<production>/robots.txt` allows crawling and lists
the sitemap, and that pages have no `noindex` (`docs/pr-plan.md` § 27).

## Content import against staging

The staging database listens on the VPS's loopback only (port 5433). Tunnel to it and point the
import at it:

```bash
ssh -N -L 5433:127.0.0.1:5433 eac
# POSTGRES_PASSWORD is in /opt/euro-alliance-staging/.env
DATABASE_URL=postgres://euro_alliance:<password>@localhost:5433/euro_alliance pnpm import:run
```

Media uploaded by the import lands in the local `MEDIA_DIR`, not on the server: copy it into the
`euro-alliance-staging_media` volume afterwards, and restart the site so its cached reads refresh.

## Useful

```bash
docker compose -f /opt/euro-alliance-staging/docker-compose.yml logs -f --tail=200 site
docker compose -f /opt/edge/docker-compose.yml logs -f --tail=200 caddy
docker compose -f /opt/edge/docker-compose.yml exec caddy caddy reload --config /etc/caddy/Caddyfile
# backup
docker exec staging-postgres pg_dump -U euro_alliance -d euro_alliance -Fc > staging.dump
```
