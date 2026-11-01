# Content import and redirects

How to bring the current site's courses, news and pages into Payload, the proposed URL scheme, and the 301 map from the old URLs.

## 1. Ground rules

- **Only official content.** Import what is on euro-alliance.net; never fill gaps. Anything missing or doubtful goes into the import report (§ 3.6) for the user to ask the client.
- **Don't import what the brief replaces:**
  - the old privacy page (it says the site uses no cookies; the new approved privacy and cookie texts replace it);
  - «20 години» wording (use «от 1999 г.»);
  - translation prices per topic (dropped).
- **Photos:** real photos only. Import the client's photos; never substitute stock.
- **Be polite to their server:** one request per second, an identifying user agent, respect `robots.txt`. The site is small (the baseline crawl found 120 pages and 1473 images).
- The import is code in `scripts/import/`, run against a local or staging database. It is idempotent: re-running it updates records (matched on `legacyUrl`) instead of duplicating them.

## 2. Timing

Page PRs (8–19) seed only the content shown in the approved Figma file, so each page can be checked against its screenshot. PR 21 runs the full import (all courses, all news, all pages) on top.

## 3. Pipeline

### 3.1 Inventory

Crawl from the homepage and `sitemap.xml` (if present). Write `scripts/import/out/inventory.json` with, per URL: status, final URL after redirects, page type (guessed from the URL pattern, § 5), `<title>`, H1, meta description, outgoing internal links, and images (src, alt, size). Compare the page count with the baseline (120); explain any difference in the PR.

### 3.2 Extract

One extractor per page type, using `cheerio` on the fetched HTML (Playwright only if a page needs JavaScript to render content):

| Old page type | Goes to |
|---|---|
| Language education for adults / students, per language | Programs (`type: language`) + Courses |
| Language certificates, entry-level tests | Certificates + the relevant Programs sections |
| Vouchers | Programs (`type: vouchers`) |
| Professions and specialty | Programs (`type: vocational`) + Professions |
| Pedagogical specialists | Programs (`type: teachers`) + Teacher programmes |
| Training for farmers | Programs (`type: farmers`) + Funded projects |
| Computer education | Programs (`type: computer`) |
| Document translations | `translation` global (languages, topics) |
| About: history, team, standards, documents, projects, online education, learning | About sections, Documents, Funded projects, Team |
| News listing and articles | News |

### 3.3 Transform

- HTML → Payload Lexical rich text. Strip inline styles, fonts, empty paragraphs and layout tables.
- News bodies: keep the heading structure and make section headings H2 (they feed the contents rail). Never more than one H1; the title is the H1.
- Normalise typography: Bulgarian quotation marks „…“, non-breaking spaces in numbers («175 958») and before «г.» / «лв».
- Dates → ISO. Phone numbers → `+359 …` format as in `CLAUDE.md`.
- **Prices:** import exactly as written, including the currency. If a price is in лв, don't convert it; set the record to draft and list it in the report (Bulgaria has used the euro since 01.01.2026).
- Slugs from titles via `src/lib/slug.ts` (§ 4).

### 3.4 Images

- Download originals (largest available), deduplicate by content hash, upload to `media` with the right `kind` (`photo`, `scan`, `logo`).
- **EU logo strips:** upload as `kind: logo`, byte-for-byte as found. If the old site's versions are low resolution, flag them; ask the client for the originals rather than upscaling.
- **Alt text:** keep the existing alt where present. 22% of images (328 of 1473) have none; for those, draft a factual description of what the image shows, set `altReviewed: false`, and list them in the report. Editors confirm them in Payload.

### 3.5 Load

`pnpm import:run` (or the agreed package manager) uses Payload's Local API. Flags: `--dry-run` (no writes; prints what would change), `--only=news|courses|pages`. Every imported record keeps `legacyUrl` (and `legacyId` for news). Imported records start as **drafts** unless they are complete and checked; the user decides when to publish.

### 3.6 Report

`scripts/import/out/report.md`, attached to PR 21: counts per collection versus the inventory, records left as draft and why, missing fields (prices, dates, photos), images without reviewed alt, legacy URLs with no mapping, and anything the extractors couldn't parse.

## 4. URL scheme (agreed 31.10.2026)

Transliterated Bulgarian slugs, following the official Bulgarian transliteration (Закон за транслитерацията): а a, б b, в v, г g, д d, е e, ж zh, з z, и i, й y, к k, л l, м m, н n, о o, п p, р r, с s, т t, у u, ф f, х h, ц ts, ч ch, ш sh, щ sht, ъ a, ь y, ю yu, я ya; «ия» at the end of a word becomes «ia». Lowercase, hyphens, no trailing slash. Every internal link is built in `src/lib/routes.ts`; route folders under `src/app/(frontend)` use the same segments, and a unit test keeps the two in sync.

| Page | Proposed route |
|---|---|
| Home | `/` |
| Course listing | `/kursove`; filters in the query (PR 9): `auditoria`, `kategoria`, `ezik`, `format`, `finansirane=vaucher`, `nachalo=YYYY-MM`, `sortirane=tsena`, `pokazani=18` (values in `src/lib/routes.ts`) |
| Course | `/kursove/{slug}` |
| Language program | `/ezitsi/{language}/{audience}`, e.g. `/ezitsi/angliyski/vazrastni`, `/ezitsi/angliyski/uchenitsi` |
| Languages | `angliyski`, `nemski`, `frenski`, `ispanski`, `italianski`, `balgarski`, `ruski` |
| Vouchers | `/vaucheri` |
| Professions (ЦПО) | `/profesionalno-obuchenie/profesii` |
| Pedagogical specialists | `/profesionalno-obuchenie/pedagogicheski-spetsialisti` |
| Farmers | `/profesionalno-obuchenie/zemedeltsi` |
| Computer courses | `/kompyutarni-kursove` |
| Translations | `/prevodi` |
| News | `/novini`, article `/novini/{slug}`, pages `/novini?stranitsa={n}` |
| About | `/za-nas`, sections as anchors (`#istoria`, `#ekip`, `#standarti`, `#dokumenti`, `#proekti`; final ids from the Subnav items) |
| Contact | `/kontakti`, topic preselected with `?tema={topic}` |
| Privacy | `/poveritelnost` |
| Cookies | `/biskvitki` |
| Search | `/tarsene?q=…` |
| English (later) | `/en/…` with English slugs |

If the page titles in Figma suggest different words, prefer the Figma words and update this table.

## 5. 301 redirect map

Patterns from the old site, mapped to the proposed routes. **Derive the definitive list from the inventory (§ 3.1)**, because the old site may have variations not listed here.

### Language education

| Old | New |
|---|---|
| `/Language-Education/Language-Educations-for-Adults/English` | `/ezitsi/angliyski/vazrastni` |
| `/Language-Education/Language-Educations-for-Adults/German` | `/ezitsi/nemski/vazrastni` |
| `/Language-Education/Language-Educations-for-Adults/French` | `/ezitsi/frenski/vazrastni` |
| `/Language-Education/Language-Educations-for-Adults/Spanish` | `/ezitsi/ispanski/vazrastni` |
| `/Language-Education/Language-Educations-for-Adults/Italian` | `/ezitsi/italianski/vazrastni` |
| `/Language-Education/Language-Educations-for-Adults/Bulgarian` | `/ezitsi/balgarski/vazrastni` |
| `/Language-Education/Language-Education-For-Students/{English…Bulgarian}` | `/ezitsi/{language}/uchenitsi` (Bulgarian → the БЕЛ page) |
| `/Language-Education/Language-Education-For-Students/Russian` | `/ezitsi/ruski/uchenitsi` |
| `…/Language-Certificates` | **Open:** proposed `/ezitsi/angliyski/vazrastni#sertifikati` (where the homepage «Изпити и сертификати» card leads) |
| `…/Entry-Level-Tests` | **Open:** the section of the language pages that covers entry-level tests, if the design has one; otherwise `/kursove` |

### Programmes, translations, about, news

| Old | New |
|---|---|
| `/Vouchers` | `/vaucheri` |
| `/Professional-Education/Professions-and-specialty` | `/profesionalno-obuchenie/profesii` |
| `/Professional-Education/Pedagogical-specialists` | `/profesionalno-obuchenie/pedagogicheski-spetsialisti` |
| `/Professional-Education/Training-for-farmers` | `/profesionalno-obuchenie/zemedeltsi` |
| `/Computer-Education` | `/kompyutarni-kursove` |
| `/Translations/Document-Translations` | `/prevodi` |
| `/Translations/Upload-New-Translation-Document` | `/kontakti?tema=prevodi` (wizard with the translation topic and upload) |
| `/About-us/Our-History` | `/za-nas#istoria` |
| `/About-us/Our-Team` | `/za-nas#ekip` |
| `/About-us/Standarts` | `/za-nas#standarti` |
| `/About-us/Documents` | `/za-nas#dokumenti` |
| `/About-us/Projects` | `/za-nas#proekti` |
| `/About-us/Online-Education` | **Open:** check the content in the inventory; closest page or `/za-nas` |
| `/About-us/Learning` | **Open:** as above |
| `/About-us/Personal-data-GDPR` | `/poveritelnost` |
| `/News` and `/News?page={n}` | `/novini` (page sizes differ, so old page numbers don't line up) |
| `/News/{id}/{slug}` | `/novini/{new-slug}`, generated per article during import into the `redirects` collection |

### Rules

- **301**, one hop, no chains. A test fails if any redirect target itself redirects.
- Match old paths **case-insensitively** and with or without a trailing slash.
- A redirect target may include a fragment (`#sertifikati`); browsers keep it.
- Unknown old URLs return the real 404 page (with search), never a redirect to the homepage. Log them for review after launch.
- Static patterns go in `next.config` `redirects()`. Per-article and manual redirects come from the `redirects` collection, looked up server-side and cached.
- **CI test (PR 19, extended in PR 21):** request every URL in `inventory.json` against the new build and assert a single 301 to a URL that returns 200.
