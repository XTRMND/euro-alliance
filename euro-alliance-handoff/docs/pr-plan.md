# PR plan

The ordered list of pull requests. Work through them in order; each one is a logical step, reviewed and squash-merged by the user before the next one starts (or in parallel only when the user says so). Every page PR meets the definition of done in `CLAUDE.md` § 9. Node links are in `docs/figma-map.md`.

**Needs** lists what must be settled before the PR can be finished. If it isn't settled, build what you can, leave the rest behind a clear TODO, and list it under Open items in the PR.

## Before PR 1: kick-off

- Read `CLAUDE.md` and every file in `docs/`.
- Check the Figma MCP connection: `get_metadata` on Home (48:184) must return the frame.
- Clone the repository the user created.
- Ask the user, in one message: hosting and preview setup (servers, CDN, media storage, SMTP, cron, backups), whether the proposed URL scheme (`docs/content-import.md` § 4) is agreed, and whether pnpm and CSS Modules are fine.

## Foundation

### 1. Repo scaffold: `chore/repo-scaffold`

- Next.js (App Router) + TypeScript strict, ESLint, Prettier, Vitest, Playwright, `@axe-core/playwright`, Lighthouse CI config with the budget from `CLAUDE.md` § 9.
- GitHub Actions CI with every job in `docs/git-workflow.md` § 5 (jobs that have nothing to test yet pass trivially).
- `output: 'standalone'`, Dockerfile, `docker-compose.yml` for local Postgres, `.env.example`, `.github/pull_request_template.md`, `.gitignore`.
- `src/lib/routes.ts` with the URL scheme, `src/lib/slug.ts` (Bulgarian transliteration) with unit tests.
- Fill `CLAUDE.md` § 11 with the real commands. List pinned versions in the PR.
- **Done when:** CI is green on an empty app; `docker build` succeeds.

### 2. Payload + Postgres + env + media pipeline: `feat/payload-setup`

- Payload in the same app (`src/app/(payload)`), `@payloadcms/db-postgres`, committed migrations, admin at `/admin`.
- `users` with `admin` / `editor` roles and the access rules in `docs/cms-schema.md` § 2.
- Localization (`bg` default, `en`).
- `media` collection with `kind`, required `alt`, responsive sizes and the duotone tint derivatives (`docs/cms-schema.md` § 4); `media:regen` script; storage adapter behind an interface.
- `site` global seeded with the company facts; `Offices` seeded with the three offices.
- Email adapter configured with `INQUIRY_EMAIL_OVERRIDE` support (no sending yet).
- **Done when:** a fresh database migrates and seeds in CI; uploading a photo creates every derivative; an editor can't reach users or routing.
- **Needs:** media storage choice (local volume or S3-compatible).

### 3. Design tokens + fonts: `feat/design-tokens`

- `get_variable_defs` → `src/styles/tokens.css` (colours, plus type, spacing and motion tokens from 02 Foundations and `docs/motion.md` § 1).
- Fonts with `next/font/google`: Sofia Sans Extra Condensed, Sofia Sans, Caveat, Cyrillic + Latin, `display: swap`, size-adjusted fallbacks to avoid layout shift.
- Global styles: paper background, base type, focus ring, `prefers-reduced-motion` defaults.
- Contrast unit test for every text/background pair in use.
- **Done when:** a token reference page (dev only) matches 02 Foundations in a side-by-side screenshot.

### 4. Base components: `feat/base-components`

- Button (18:30), Chip (135:328), Checkbox (79:968), Radio card (98:270), Toggle (223:349), every variant and state.
- Decide the uppercase rule for labels (`docs/i18n.md` § 1).
- **Done when:** a dev-only component gallery matches each component's `get_screenshot`; keyboard and screen-reader behaviour tested; axe clean.

### 5. Shell: `feat/shell`

- Logo (18:21), favicon set from Logo mark (127:312), Header (79:784) with torn edge and shadow, Header Mobile (114:295), Mobile menu (121:1399), Footer (79:887), Footer Mobile (114:311), Inquiry band (79:822, 114:306).
- `navigation` global; skip link; landmarks; logo behaviour (`docs/motion.md` § 8); «Настройки на бисквитките» footer button wired to a stub that PR 17 completes.
- **Done when:** the shell around an empty page matches the Home frames' header and footer at 1440 and 390; mobile menu is keyboard-operable with focus trapped and `Esc` to close.

### 6. Pattern components: `feat/patterns`

- Section heading (259:2319), List row (259:2318), Index card (264:448), Figure card (259:410), Callout band (259:449, Row/Stack), Count bubble (259:475), Project card (259:574), Polaroid (259:582), Torn window (259:588), Data table (259:621).
- Highlighter (one phrase per headline) as part of Section heading and hero headings.
- Equal-height paired cards and the 32 px card gap as layout utilities.
- **Done when:** gallery matches screenshots; Data table is a real `<table>` and scrolls inside its own container on mobile.

### 7. Stickers and visuals: `feat/visuals`

- Course sticker set (50:274) and flags exported to `src/assets/`; `Sticker` and `Flag` components with live-text labels.
- Course visual (86:416, Pose A/Intro), Program hero art (131:311).
- Halftone dot patterns (42% and 7%) as CSS/SVG; `DuotoneImage` (`docs/cms-schema.md` § 4).
- Marquee / Languages (63:524) and Marquee / Logos with the speed, pause control and reduced-motion behaviour from `docs/motion.md` § 3.
- Globe from `docs/reference/globe-demo.html` (`docs/motion.md` § 4).
- Landing motion utilities (`docs/motion.md` § 2).
- **Done when:** gallery matches; strips move at 18 px/s (unit-tested duration calculation); the globe redraws only during scroll (tested by counting draws); everything is still with reduced motion.

## Pages

Each page PR adds the collections it needs (with migrations and seed content from the Figma copy), builds the domain components it needs, then the page at 1440 and 390, and adds `track()` calls (a no-op until PR 20) where `docs/measurement.md` lists events.

### 8. Homepage: `feat/home`

- Home 48:184 / 115:233. `home` global. Hero with the classroom photo at 88% tint, globe, language strip, program cards (fixed targets for «Изпити и сертификати» and «Компютърни курсове»), news cards at `Tint=Strong` (55%), partner logos, landing motion.
- `src/lib/analytics.ts` with the typed `track()` no-op.

### 9. Course listing + filters: `feat/course-listing`

- Courses 80:880 / 116:557, filters sheet 116:1190, Course card 62:229. `Courses` collection.
- Filters in the URL query; «Покажи още»; empty state; pills with visible labels.

### 10. Course page + states: `feat/course-page`

- Course 81:1226 / 117:895, states board 126:1940. State derivation in `lib/course-state.ts` with tests; rules listed in the PR.
- `course_view`, `enrol_click`.

### 11. Contact wizard + inquiry routing + email: `feat/contact-wizard`

- Contact 119:1795 / 121:1145, Contact wizard 100:518, Location card 125:302.
- `inquiries`, `inquiryFiles` (private), `inquiryRouting` global, server action, email notification and confirmation, retry job, retention job, honeypot and rate limit, topic preselection (`?tema=`), map as static image + link.
- **Done when:** each topic routes to the right inbox (unit-tested), staging sends only to the override address, uploads are unreachable without login, retention deletes the right records in a test.
- **Needs:** SMTP and sender domain; upload limits; routing for non-language programmes.

### 12. Program template (language) + English adults and students: `feat/program-language`

- English adults 130:1993 / 147:1317, English students 159:1993 / 166:1701.
- `Programs` collection with blocks, `Textbook systems`, `Certificates`. Notebook hero with flag sticker; Audience tabs; `#sertifikati` anchor.
- Other languages render from the same template with CMS content (no new frames).

### 13. Other program pages: `feat/program-pages`

- Vouchers 236:3391 / 249:3443, Professions 236:3667 / 249:3659, Pedagogical specialists 237:3686 / 249:3908, Farmers 237:3973 / 249:4165, Computer courses 258:3937 / 262:3673.
- Course-page hero (no notebook). `Professions`, `Teacher programmes`, `Funded projects` collections; EU logo strips exactly as supplied.
- Split into one PR per page if it grows past the size limit.
- **Needs:** whether the ОП «Наука и образование за интелигентен растеж» teacher training card stays; лв / € display for funded projects.

### 14. Translations + page counter + upload: `feat/translations`

- Translations 171:2511 / 175:2005, Page counter 173:378, `translation` global; CTA into the wizard with the translation topic and upload.
- **Needs:** counting with spaces and rounding confirmed.

### 15. News listing + article: `feat/news`

- News 183:2437 / 188:2196, article 183:2574 / 188:2385, News feature 181:365, Page number 181:371, TOC item 185:366.
- `News` collection; contents rail from H2s; 30% tint, clearing on hover; pagination; related articles.

### 16. About: `feat/about`

- About 190:2677 / 210:2395. Torn-window hero with the team photo and «А» bubble, Subnav (189:349) with anchors, Timeline (189:361), Document photo (193:351) for licences and certificates, projects; team section hidden until photos exist.
- `Documents`, `Team` collections.

### 17. Legal pages + cookie consent + Consent Mode: `feat/consent`

- Privacy 218:2842 / 226:2581, Cookies 224:3208 / 226:2775, Cookie consent 223:398, first-visit prototype 224:3391 / 226:3826.
- `Legal pages` seeded with the approved texts; consent cookie; Consent Mode v2 defaults; footer button reopens settings (`docs/motion.md` § 7).
- **Done when:** a Playwright test proves no non-essential cookie or request before consent, and that each choice is stored and respected.

### 18. Search: `feat/search`

- Search 219:2913 / 226:2920, Search field 217:358, Search result 217:368. Search plugin, Postgres full-text + trigram, tabs with counts, highlighting, `search` event with the cleaned term.

### 19. 404 + redirects: `feat/404-redirects`

- 404 219:3127 / 226:3254 (real 404 status, with search).
- Static redirect patterns in `next.config`, `redirects` collection lookup, case-insensitive matching, the redirect test from `docs/content-import.md` § 5.
- **Needs:** the agreed URL scheme; targets for the open redirect rows.

## Integration and polish

### 20. Analytics events: `feat/analytics`

- Connect `track()` to GA4 (gtag.js, or GTM if decided) behind statistics consent; all events from `docs/measurement.md`; `cookie_expires` ≤ 12 months; key event set up (documented for the user, who owns the GA4 property).
- **Needs:** GA4 property and measurement ID; the decisions in `docs/measurement.md` § 1.

### 21. Content import: `feat/content-import`

- `scripts/import/` per `docs/content-import.md`: inventory, extract, transform, images, load, report. Per-article news redirects. The redirect test extended to every URL in the inventory.
- **Done when:** a dry run and a real run against staging both succeed; the report is attached; the user decides what gets published.

### 22. SEO: `feat/seo`

- Metadata per page (unique title and description, from CMS SEO fields with sensible fallbacks), canonical URLs, Open Graph and Twitter cards (with a default image from the `site` global).
- JSON-LD: `Organization` / `EducationalOrganization` on the homepage (name, legal name, ЕИК as identifier, founding date, addresses, phones, emails), `Course` on course pages (only with real data), `BreadcrumbList` where there are breadcrumbs, `NewsArticle` on articles.
- `sitemap.xml` (published, indexable pages only), `robots.txt` (production allows, staging disallows), `hreflang` only once English exists.
- **Done when:** a crawl of the staging build finds one H1, a canonical, an OG image and a unique title + description on every page; JSON-LD validates.

### 23. Performance pass: `perf/performance`

- Measure every template with Lighthouse (mobile and desktop). Fix what blocks the budget: LCP image priority and sizes, font loading, JavaScript per route (client components only where needed), third-party scripts after consent only, cache headers for static assets (`immutable`) and pages.
- **Done when:** Lighthouse CI budget passes on every template.

### 24. Security headers: `feat/security-headers`

- HSTS (with `includeSubDomains`; `preload` only if the user wants it), Content-Security-Policy (nonce-based, allowing only the analytics domains in use and only after consent), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny what the site doesn't use), `frame-ancestors 'none'` (and `X-Frame-Options: DENY`).
- Document the recommended TLS settings for the user's servers (TLS 1.2 and 1.3 only, forward-secret ECDHE suites) for the SSL Labs result; the user applies them.
- **Done when:** Mozilla Observatory scores A or better on staging; nothing breaks with the CSP (Playwright run with CSP violations failing the test).

### 25. Accessibility pass: `a11y/accessibility`

- axe at 1440 and 390 on every page and open state; manual keyboard pass; screen-reader spot checks (VoiceOver and NVDA) of the header, menu, filters, wizard, consent and search; heading order and landmark audit; zoom to 200% and text spacing check.
- **Done when:** zero axe violations everywhere; findings from the manual pass fixed or listed.

### 26. Code Connect mappings: `chore/code-connect`

- Map every component on page 03 to its code component (`get_code_connect_suggestions`, review, `send_code_connect_mappings`). Only after the user says go; skip if the Figma plan doesn't support Code Connect.

### 27. Launch checklist: `chore/launch`

Adds `docs/launch.md` and works through it with the user:

- [ ] All page PRs merged; content imported and the client has approved what's published.
- [ ] Open items resolved or explicitly deferred by the user.
- [ ] Production environment variables set; `INQUIRY_EMAIL_OVERRIDE` **unset** in production only.
- [ ] Test inquiry for every topic reaches the right inbox (with the client), including a translation upload.
- [ ] SPF, DKIM and DMARC set for the sending domain; confirmation emails don't land in spam.
- [ ] Database and media backups scheduled and a restore tested.
- [ ] Uptime monitoring and error logging in place.
- [ ] Retention job scheduled and verified.
- [ ] Every legacy URL from the inventory returns one 301 to a 200 page.
- [ ] `robots.txt` allows production; staging is `noindex`.
- [ ] Sitemap submitted in Search Console (needs the client's access).
- [ ] GA4 receives events only after consent; real-time view checked.
- [ ] Security headers and TLS checked (Observatory, SSL Labs).
- [ ] Editors trained: a short guide for the client on adding courses and news, uploading photos (alt text), and handling inquiries.
- [ ] DNS cut-over planned with the user, with a rollback path.
- [ ] Measurement scheduled: launch + 1 week and + 28 days (`docs/measurement.md` § 2).
