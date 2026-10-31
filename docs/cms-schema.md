# CMS schema (Payload)

Payload runs inside the Next.js app on PostgreSQL. The client edits content in Payload's admin at `/admin`. This file defines the collections, globals, access rules, image pipeline, inquiry routing and retention.

**Legend:** fields in the brief are plain. Fields marked *(proposed)* are additions this package suggests; drop them if the user disagrees.

**Rules for every collection:**

- Add each collection in the PR of the first page that needs it (`docs/pr-plan.md`), with a migration.
- Every user-facing text field is localized (`localization: { locales: ['bg', 'en'], defaultLocale: 'bg' }`). English stays empty until the client supplies it; templates fall back to Bulgarian only in development, never silently in production.
- Content that appears on a page has `slug` *(proposed)*, SEO fields (`meta.title`, `meta.description`, `meta.image`) *(proposed)*, and drafts + versions enabled.
- Imported documents keep `legacyUrl` *(proposed)* for the redirect map (`docs/content-import.md`).
- An empty optional field hides its element in the template. Never render a placeholder.

## 1. Users and roles

| Role | Who | Can |
|---|---|---|
| `admin` | the user | everything, including users, redirects, routing, settings |
| `editor` | client staff | create, edit and publish content; read and update inquiries; upload media |

`users`: `email`, `name`, `role` (`admin` / `editor`). No public sign-up. Payload's auth cookie is essential and httpOnly; set its expiry to at most 12 months (cookie rule, `docs/motion.md` § 7).

## 2. Access rules

| Collection | Public (site) | Editor | Admin |
|---|---|---|---|
| Content (Courses, Programs, News, Professions, Teacher programmes, Textbook systems, Certificates, Offices, Funded projects, Documents, Team, Legal pages) | read **published** only | create, read, update, publish; delete with confirmation | all |
| `media` | read | create, update | all |
| `inquiries` | none (created only by the wizard's server action, never through the public REST/GraphQL API) | read, update `status` and notes | all |
| `inquiryFiles` | **none**; never served publicly | read (download through an authenticated route) | all |
| `redirects` | none (used by the server) | read | all |
| `users` | none | read self, update self | all |
| Globals | read | update (except `inquiryRouting`) | all |

Disable GraphQL if nothing uses it. Lock down the REST API to what the site needs.

## 3. Collections

### Courses

| Field | Type | Notes |
|---|---|---|
| `title` | text, required | |
| `slug` | text, unique | *(proposed)* transliterated from the title (`src/lib/slug.ts`) |
| `topic` | select, required | Language or topic. **Drives the sticker.** Values = the 16 topic stickers and 7 flag stickers in Course sticker set 50:274; read their names with `get_design_context`. |
| `audience` | select | Students / adults (and any other audience in the Courses filters, 80:880) |
| `level` | text, optional | Drives the level bubble. Empty → no bubble (`Show level` off). |
| `format` | select | Values from the Courses filters in Figma |
| `startDate` | date, optional | |
| `schedule` | text / rich text | |
| `price` | number, optional | Empty → price hidden. Store with `currency` *(proposed)*, default EUR. **Never convert imported лв prices silently**; flag them. |
| `priceNote` | text, optional | |
| `seats` | number, optional | |
| `voucherEligible` | checkbox | Voucher flag |
| `relatedProgram` | relationship → Programs | |
| `legacyUrl` | text | *(proposed)* |

**Course states** (board 126:1940): derive each state from `startDate`, `seats` and `_status`. Write the derivation in `lib/course-state.ts` with unit tests, and list the rules in the PR so the user can confirm them.

### Programs

| Field | Type | Notes |
|---|---|---|
| `type` | select, required | `language` / `vocational` / `vouchers` / `teachers` / `farmers` / `computer` |
| `language` | select | *(proposed)* For `language` only: the 7 languages |
| `audience` | select | *(proposed)* For `language` only: adults / students. Feeds Audience tabs (129:321). |
| `title`, `slug` | text | |
| `hero` | group | Hero content: `heading`, `highlight` (the one phrase to highlight; validated to be a substring of `heading`), `lead`, `sticker` (select from the sticker set), `countBubble` { `value`, `label` }, `ctas` (array of { label, link }) |
| `sections` | blocks | See below |

`type: language` renders the notebook hero (Program hero art 131:311) with the flag sticker for `language`. Every other type renders the course-page hero (halftone panel, sticker, tape, count bubble).

**Section blocks** (each maps to a component on page 03):

| Block | Component | Data |
|---|---|---|
| `features` | Feature card 129:348 | array of { title, text, link } |
| `levels` | Level card 129:357 | array of { level, title, text } |
| `steps` | Steps 129:385 | array of { title, text } |
| `textbookSystems` | System card 135:389 | relationship → Textbook systems; `columns` (two / one) |
| `certificates` | Certificate card 145:364 | relationship → Certificates. The block's anchor is `sertifikati` (homepage «Изпити и сертификати» links here). |
| `faq` | FAQ item 129:335 | array of { question, answer } |
| `professions` | Data table 259:621 | relationship → Professions, grouped by direction |
| `teacherProgrammes` | Index card 264:448 / List row 259:2318 | relationship → Teacher programmes, grouped by theme |
| `figures` | Figure card 259:410 | array of { figure, label }. Only official numbers. |
| `callout` | Callout band 259:449 | { layout (row / stack), heading, text, cta } |
| `projects` | Project card 259:574 | relationship → Funded projects |
| `richText` | Section heading 259:2319 + prose | heading + rich text |

### Textbook systems

`name` (text), `levels` (array of text).

### Certificates

The brief lists no fields. Build the fields from Certificate card 145:364 (read with `get_design_context`), likely `name`, `language`, `levels`, `description`. List them in the PR for the user to confirm.

### Professions

`directionCode`, `directionName`, `professionCode`, `name`, `degrees` (array or multi-select of qualification degrees). 20 professions in 5 directions, from the 2026 list.

### Teacher programmes

`number` (official programme number, kept as given), `title`, `theme` (select; grouping by theme is an editorial choice), `hours` (number), `credits` (number, 1–3). 29 programmes under Наредба 12.

### News

| Field | Type | Notes |
|---|---|---|
| `title`, `slug` | text | |
| `date` | date, required | |
| `cover` | upload → media (`kind: photo`) | Auto duotone (§ 4). Tint 30% on news pages, 55% on the homepage. |
| `excerpt` | textarea | *(proposed)* for cards and meta description |
| `body` | rich text (Lexical) | **H2 headings feed the contents rail** (TOC item 185:366). Give each H2 a stable id from its text. Allow H2 and H3 only; the page H1 is the title. |
| `gallery` | array of uploads | |
| `related` | relationship → News, max 3 *(proposed)* | |
| `legacyId`, `legacyUrl` | text | *(proposed)* `/News/{id}/{slug}` redirects |

### Offices

`name`, `address`, `phones` (array), `emails` (array), `map`, `routes` (rich text: how to get there), `role` *(proposed: `courses` / `translations-plovdiv` / `translations-sofia`, used by routing)*.

- Seed the three offices from `CLAUDE.md` § 3 in PR 2.
- **Map (proposed):** store coordinates and render a static map image plus an "open in maps" link. An embedded Google Maps iframe sets third-party cookies and would need marketing consent first.

### Translation (global)

`languages` (array), `topics` (array). No prices per topic (dropped).

### Funded projects

`title`, `code` (e.g. BG16RFPR001-1.004-1004), `facts` (array of { label, value }), `goals` (rich text or array), `logoStrip` (upload → media, `kind: logo`).

- Amounts are stored as the official text from the contract (e.g. «175 958 лв»), not as a number to format. **Open item:** since 01.01.2026 Bulgaria uses the euro; ask the client whether to show лв, € or both.
- The logo strip is rendered exactly as uploaded (§ 4).

### Documents / licences

`title`, `type` *(proposed: licence / certificate / diploma sample)*, `scan` (upload → media, `kind: scan`). Only details that appear on the document itself.

### Team

`name`, `role`, `photo` (upload → media, `kind: photo`), `order`. The About page team section renders only when at least one published entry has a photo. Until the client sends photos, it stays hidden.

### Inquiries

| Field | Type | Notes |
|---|---|---|
| `topic` | select | From the wizard; values per the topic list in Contact wizard 100:518 |
| `office` | select | Plovdiv / Sofia, for translations |
| `routedTo` | email | Set by the server from the routing table (§ 5) |
| `name`, `email`, `phone`, `message` | text | Per the wizard fields in Figma |
| `course` | relationship → Courses, optional | When the wizard was opened from a course |
| `files` | relationship → inquiryFiles (has many) | Translation documents |
| `privacyAck` | checkbox, required | Links to the privacy page |
| `sourcePage` | text | Path the visitor came from (no query strings with personal data) |
| `status` | select | `new` / `in-progress` / `contract` / `closed` |
| `notes` | textarea | Internal |
| `createdAt` | auto | |

### inquiryFiles (upload collection, private)

- Stored outside any public directory or bucket; served only through an authenticated route for editors and admins.
- **Proposed limits (confirm):** PDF, JPG, PNG, DOC, DOCX, ODT; 20 MB per file; 10 files per inquiry. Check the MIME type from the file content, not the extension. Strip EXIF from images.
- **Proposed:** scan uploads with ClamAV if the user's servers can run it.

### Legal pages

`title`, `slug`, `body` (rich text), `updatedOn` (date). The approved privacy and cookie policy texts are seeded as given. Versions enabled so changes are traceable.

### Redirects

`from`, `to`, `type` (301), `source` (`import` / `manual`). Payload's redirects plugin fits. Admin-only.

## 4. Media and the image pipeline

`media` is an upload collection with sharp.

| Field | Notes |
|---|---|
| `alt` | **required** (localized). Decorative images aren't uploaded here; they live in the code. |
| `altReviewed` | checkbox *(proposed)*; false when alt text was drafted during import |
| `kind` | `photo` / `art` / `scan` / `logo` (required) |
| `credit` | optional |

**What each kind gets on upload:**

| Kind | Treatment |
|---|---|
| `photo` | Responsive sizes (proposed widths 480, 768, 1080, 1440, 1920, 2880) in AVIF and WebP, plus **pre-composited duotone tints** at each size: 88% (hero), 55% (homepage news), 45% (about and general photos), 30% (news pages). |
| `art` | Responsive sizes; optional halftone derivative. |
| `scan` | Responsive sizes; no colour treatment. |
| `logo` | **Served exactly as uploaded** (EU publicity rules). No recompression, tint, crop or reformat. |

**Duotone:** map luminance to a two-colour ramp, shadows brand/primary-strong (#183169) and highlights bg/warm (#F7F3EC), then blend with the colour original at the tint percentage ("colour + 45% duotone"). Before coding, read a duotone photo fill in Figma (News card 62:240 at both tints, and the homepage hero) with `get_design_context`; if Figma uses a different colour pair or blend mode, Figma wins.

**Rendering (`DuotoneImage`):** the component takes `tint` (88 / 55 / 45 / 30) and `clearOnHover`. It serves the pre-composited variant for that tint as a single image, which is best for LCP. With `clearOnHover`, the colour original sits underneath, lazy-loaded, and the composite fades to `opacity: 0` on hover (`docs/motion.md` § 5).

**Halftone and photos:** the brief says duotone and halftone are applied on upload, and also that halftone dots never go over a regular photo. Resolved as: **photos get duotone only; halftone applies to `art` uploads and to the panel patterns.** The course card panels (42%) and textbook cards (7%) are CSS or SVG dot patterns in navy, not image processing. Confirm with the user.

**Tints live in one file** (`src/lib/media/tints.ts`). A script `media:regen` rebuilds all derivatives if a tint changes.

**Hero photo:** the client's classroom photo, full resolution, `kind: photo`, tint 88%. Preload it on the homepage with `fetchpriority="high"`.

## 5. Inquiry routing and email

| Topic | Inbox |
|---|---|
| Courses (all language courses, certificates and tests) | office@euro-alliance.net |
| Translations, Plovdiv office | prevod@euro-alliance.net |
| Translations, Sofia office | trans@euro-alliance.net |
| Vouchers, professions, teachers, farmers, computer courses | office@euro-alliance.net **(proposed default; confirm)** |
| Anything unknown | office@euro-alliance.net |

- The table lives in the `inquiryRouting` global (admin-only) so it can change without a deploy. Seed it with the table above.
- On submit the server stores the inquiry first, then sends: (1) the notification to the routed inbox with `Reply-To` set to the visitor; (2) a short confirmation to the visitor (texts in i18n). Files are linked through the authenticated admin, never attached.
- Email goes through Payload's email adapter (Nodemailer, SMTP). **Sender domain, SMTP host and SPF/DKIM/DMARC are open items for the user.**
- **Staging safety:** outside production, `INQUIRY_EMAIL_OVERRIDE` redirects every message to the user's address. Staging must never email the client's inboxes.
- A failed send is retried by a Payload job and never loses the stored inquiry.

## 6. Retention (privacy policy)

- Inquiries that don't lead to a contract are kept **1 year**. A daily Payload job deletes inquiries older than 365 days whose `status` is not `contract`, together with their files.
- The cookie choice is kept 6 months (`docs/motion.md` § 7). No cookie lives longer than 12 months.
- Log the number of deleted records per run (no personal data in logs).

## 7. Globals

| Global | Contents |
|---|---|
| `site` | Company facts (from `CLAUDE.md` § 3), default SEO image, footer legal line |
| `navigation` | Header and footer links. Nav labels are content, so they live here, not in i18n. |
| `home` | Homepage hero, program cards (with fixed targets for «Изпити и сертификати» and «Компютърни курсове»), featured news count |
| `translation` | Languages and topics |
| `inquiryRouting` | Routing table (§ 5), admin-only |

## 8. Search

- Payload's search plugin keeps a `search` collection in sync from Courses, Programs, News, Legal pages and the About page sections.
- Each record: `title`, `excerpt`, `url`, `type` (`course` / `page` / `news`), `locale`, `publishedAt`.
- Query with PostgreSQL full-text search plus `pg_trgm` for typo tolerance. Check whether a Bulgarian text-search dictionary is available on the user's Postgres; if not, use the `simple` configuration with `unaccent` and trigram similarity.
- The tabs map to `type`: Всичко (all), Курсове (`course`), Страници (`page`), Новини (`news`), each with a count.

## 9. Revalidation and caching

- Pages are server-rendered and cached. Each collection's `afterChange` and `afterDelete` hooks call `revalidateTag` for the affected pages (a course change revalidates the course, the listing, its program and search).
- CDN purge goes through an interface `purge(paths)` that does nothing until the user's CDN is known.
- Drafts use Payload's preview with draft mode; drafts are never cached publicly.
