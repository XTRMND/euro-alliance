# Content import and redirects

How to bring the current site's courses, news and pages into Payload, the proposed URL scheme, and the 301 map from the old URLs.

## 1. Ground rules

- **Only official content.** Import what is on euro-alliance.net; never fill gaps. Anything missing or doubtful goes into the import report (§ 3.6) for the user to ask the client.
- **Don't import what the brief replaces:**
  - the old privacy page (it says the site uses no cookies; the new approved privacy and cookie texts replace it);
  - «20 години» wording (use «от 1999 г.»);
  - translation prices per topic (dropped).
- **Photos:** every image in the approved Figma file is used in its slot, and a Figma image that belongs to a real article becomes its cover (the user's decision, 02.11.2026; CLAUDE.md § 12). Nothing else from the old site's photos is imported. Slots Figma doesn't cover may take the user's picks (the old cover or an Unsplash photo); About page photos beyond Figma's are the client's only.
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
- **Prices:** import exactly as written, including the currency. If a price is in лв, don't convert it; list it in the report (Bulgaria has used the euro since 01.01.2026).
- Slugs from titles via `src/lib/slug.ts` (§ 4).

### 3.4 Images

- `pnpm import:images` downloads every image the crawl found once (one request a second, cached in `out/files/`), sorts it by use (news cover, inside an article's text, course, page, site chrome) and writes `out/images.json` and a contact sheet, `out/contact-sheet/index.html`.
- None of them is imported (02.11.2026). The scans, EU logo strips and partner logos the design uses are already seeded, from the same files. The report lists the old pages that had photos, for the client.
- Covers for the news Figma doesn't cover, and the homepage's small photo if Figma's isn't used, come from `out/photo-decisions.json` (the user's picks: the old cover, an Unsplash photo, or none) as the import's last step (`IMPORT_ONLY=covers`): originals by content hash, Unsplash photos from `in/unsplash/` by the photo id in the file name, with the photographer in «Автор». A kept original with text in it is marked «Има текст в изображението». Alt text: the old alt where there is one, otherwise drafted with `altReviewed: false` and listed in the report.

### 3.5 Load

`pnpm import:run` (or the agreed package manager) uses Payload's Local API. Options, as environment variables (`payload run` doesn't pass arguments on): `IMPORT_DRY_RUN=1` (no writes; the report says what would change), `IMPORT_ONLY=news|courses|pages`. Every imported record keeps `legacyUrl` (and `legacyId` for news). Imported records are **published**: the client approved all the content (02.11.2026) and reviews it on staging. The old site's English copies (`/en/…`) go in as the English locale where they're real translations, for the later English site.

### 3.6 Report

`scripts/import/out/report.md`, attached to PR 21: counts per collection versus the inventory, missing fields (prices, dates, photos), images without reviewed alt, legacy URLs with no mapping, and anything the extractors couldn't parse.

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

The real addresses, from the crawl of 02.11.2026 (`scripts/import/legacy-urls.json`); the map is `src/lib/redirects.ts`.

| Old | New |
|---|---|
| `/Language-Education/Language-Educations-for-Adults/{English,German,Spanish,Italian,Bulgarian}-Language`, `…/French-Language-Adults` | `/ezitsi/{language}/vazrastni` |
| `/Language-Education/Language-Education-For-Students/{English,German,French,Spanish,Italian,Bulgarian}-Language`, `…/Russian-language` | `/ezitsi/{language}/uchenitsi` (Bulgarian → the БЕЛ page) |
| `/Language-Education/Language-Educations-for-Adults`, `/Language-Education/Language-Education-For-Students` | `/kursove?kategoria=ezitsi` (no page of their own) |
| `…/Language-Certificates` (both), `…/Accreditation-of-Language-Skills` | **Proposed:** `/ezitsi/angliyski/vazrastni#sertifikati` |
| `…/Entry-Level-Tests`, `…/Entry-Level-Tests-for-Adults` | **Proposed:** `/kontakti?tema=test-za-nivo` |

### Programmes, translations, about, news

| Old | New |
|---|---|
| `/Vouchers` | `/vaucheri` |
| `/Courses` | `/kursove` |
| `/Courses/{id}/{slug}` | `/kursove/{new-slug}`, from the import |
| `/Professional-Education` | **Proposed:** `/profesionalno-obuchenie/profesii` |
| `/Contact-Us` | `/kontakti` |
| `/Translations` | `/prevodi` |
| `/Translations/Interpreting` | `/prevodi#ustni-prevodi` |
| `/Translations/Translations-Price` | `/prevodi` (prices dropped) |
| `/en`, `/en/…` (and `/en/en/…`) | **Proposed:** the Bulgarian page of the same address, until the English site exists |
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
- Static patterns are in `src/lib/redirects.ts`, per-article and manual redirects in the `redirects` collection; the proxy (`src/proxy.ts`) answers both (PR 19). Not `next.config` `redirects()`: it can't ignore case, and Next's own trailing-slash redirect would add a hop (`skipTrailingSlashRedirect` is on, the proxy drops the slash).
- **CI test (PR 19, extended in PR 21):** request every URL in `inventory.json` against the new build and assert a single 301 to a URL that returns 200.
