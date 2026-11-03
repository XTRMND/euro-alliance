# Euro Alliance website

The new website for ЕВРО-АЛИАНС ООД: a language school, licensed vocational training centre (ЦПО) and translation agency in Plovdiv and Sofia, since 1999. It replaces euro-alliance.net. Content is in Bulgarian first, with English to follow on the same templates.

The design is approved in [Figma](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh). The client edits all content in the CMS.

## Stack

- **Next.js 16** (App Router) with **TypeScript** (strict) and React 19
- **Payload CMS 3** inside the same app, on **PostgreSQL 18**, with committed migrations
- **CSS Modules**, with design tokens as CSS custom properties taken from Figma variables
- **Vitest** for unit and integration tests, **Playwright** with axe for end-to-end tests, **Lighthouse CI** for performance budgets
- A portable **Docker** image (Next.js standalone output) for self-hosting. No managed platform is assumed.

## Getting started

You need Node 24 (`nvm use`), pnpm (any recent version switches itself to the one pinned in `package.json`) and Docker.

```sh
pnpm install
docker compose up -d     # local PostgreSQL
cp .env.example .env     # then set PAYLOAD_SECRET, e.g. `openssl rand -hex 32`
pnpm migrate
pnpm seed                # company facts and the three offices
pnpm dev
```

The site runs at http://localhost:3200 and the CMS at http://localhost:3200/admin. The first account you create there becomes the admin; later accounts are editors.

## Everyday commands

| | |
|---|---|
| `pnpm dev` | Development server |
| `pnpm typecheck` · `pnpm lint` · `pnpm format` | Static checks |
| `pnpm test` | Unit tests |
| `pnpm test:int` | Payload against a throwaway database (`TEST_DATABASE_URL`) |
| `pnpm build && pnpm test:e2e` | End-to-end checks on the production build |
| `pnpm build && pnpm lhci` | Lighthouse budgets, mobile and desktop |
| `pnpm migrate:create <name>` | New migration after a schema change (then `pnpm generate:types` and `pnpm generate:importmap`) |
| `pnpm media:regen` | Rebuild every photo's tints after changing `src/lib/media/tints.ts` |

The full list is in [`CLAUDE.md`](CLAUDE.md) § 11.

## Project layout

```
src/
  app/(frontend)/     the public site; folder names follow src/lib/routes.ts
  app/(payload)/      Payload admin and REST API (generated)
  collections/ globals/ hooks/ seed/   CMS schema, behaviour and seed data
  lib/                routes, slugs, email, media pipeline
  migrations/         committed database migrations
  payload.config.ts
tests/unit/ tests/int/ tests/e2e/
docs/                 the build brief: plan, Figma map, CMS schema, motion, i18n, measurement
```

## Content and media

- **Roles:** admins manage everything. Editors (client staff) edit and publish content and upload media, but can't manage accounts or change how inquiries are routed.
- **Photos** get four duotone tints on upload (88% hero, 55% homepage news, 45% about, 30% news pages), measured from the Figma file. `next/image` serves every size in AVIF or WebP from those tints.
- **Logos** (including EU logo strips) are stored and served exactly as uploaded.
- Every upload needs alt text.

## Deployment

`docker build -t euro-alliance .` produces the image. At runtime it needs:

- `DATABASE_URL`, `PAYLOAD_SECRET` and `NEXT_PUBLIC_SITE_URL`
- the SMTP settings, once email is configured
- a volume mounted at `/app/media` for uploads

Set `ALLOW_INDEXING=true` in production only: anywhere else `robots.txt` disallows everything and every page is `noindex`. On start, the app applies any pending migrations and seeds an empty database. Outside production, set `INQUIRY_EMAIL_OVERRIDE` so no email ever reaches the client's inboxes. All variables are listed in [`.env.example`](.env.example).

### Background jobs

Inquiry emails are sent right after an inquiry is stored; a failed send is retried by a job, and a nightly job deletes inquiries older than a year that didn't lead to a contract. Run the jobs one of two ways:

- **In the app:** `JOBS_AUTORUN=true`. Only with a single app server, or the servers would race.
- **System cron:** set `CRON_SECRET` (32+ random characters) and call, with `Authorization: Bearer $CRON_SECRET`:
  - every minute: `GET /api/payload-jobs/run`
  - nightly: `GET /api/payload-jobs/handle-schedules`, then `GET /api/payload-jobs/run?queue=nightly`

  For example: `* * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/payload-jobs/run`.

### Security headers and TLS

The app sends its own security headers ([`src/lib/security-headers.ts`](src/lib/security-headers.ts)): HSTS in production (five minutes, this host only, until launch), `nosniff`, the referrer policy, a Permissions-Policy, `X-Frame-Options: DENY`, and on every page a Content-Security-Policy with a fresh nonce. The proxy or CDN in front of it should pass them through unchanged, not add a second HSTS header, and not cache whole pages: each page's nonce is new on every response.

At launch HSTS goes to two years. `includeSubDomains` is added only once the client confirms every subdomain of the site's domain serves HTTPS (mail and webmail hosts too).

TLS is terminated in front of the app. For an A on SSL Labs, use Mozilla's «intermediate» profile without the DHE suites ([ssl-config.mozilla.org](https://ssl-config.mozilla.org)):

- TLS 1.2 and 1.3 only.
- TLS 1.2 suites, all forward-secret ECDHE: `ECDHE-ECDSA-AES128-GCM-SHA256`, `ECDHE-RSA-AES128-GCM-SHA256`, `ECDHE-ECDSA-AES256-GCM-SHA384`, `ECDHE-RSA-AES256-GCM-SHA384`, `ECDHE-ECDSA-CHACHA20-POLY1305`, `ECDHE-RSA-CHACHA20-POLY1305`; the client picks (`ssl_prefer_server_ciphers off`).
- OCSP stapling on, session tickets off, plain HTTP answered with a 301 to HTTPS.

Check with [Mozilla Observatory](https://developer.mozilla.org/en-US/observatory) (target: A or better) and SSL Labs once staging is up.

### Analytics

Set `GA4_MEASUREMENT_ID` to the GA4 property's measurement ID (`G-…`); it's read when a page is served, so changing it needs a restart, not a build. Without it, or with the placeholder `G-XXXXXXXXXX`, no tag loads. With it, gtag.js still loads only after a visitor allows statistics cookies (Consent Mode basic), and its cookies expire within 12 months. In the GA4 property, mark `wizard_submit` as a key event (Admin → Data display → Events). The events and their parameters are in [`docs/measurement.md`](docs/measurement.md).

## Working on the project

- [`docs/pr-plan.md`](docs/pr-plan.md) is the build order. Each step is pushed to `main` once every check passes locally, and CI runs again on `main`.
- [`CLAUDE.md`](CLAUDE.md) holds the rules that always apply. The most important is never to invent content: prices, dates, people, numbers, quotes and photos come only from the client or the current site.
