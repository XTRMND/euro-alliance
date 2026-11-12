# CMS schema (Payload)

Payload runs inside the Next.js app on PostgreSQL. The client edits content in Payload's admin at `/admin`. This file defines the collections, globals, access rules, image pipeline, inquiry routing and retention.

**Legend:** fields in the brief are plain. Fields marked *(proposed)* are additions this package suggests; drop them if the user disagrees.

**Rules for every collection:**

- Add each collection in the PR of the first page that needs it (`docs/pr-plan.md`), with a migration.
- Every user-facing text field is localized (`localization: { locales: ['bg', 'en'], defaultLocale: 'bg' }`). English stays empty until the client supplies it; templates fall back to Bulgarian only in development, never silently in production.
- Content that appears on a page has `slug` *(proposed)*, SEO fields (`meta.title`, `meta.description`, `meta.image`; PR 22: on Courses, News, Programs, Legal pages and the Home, About and Contact globals, each falling back to the page's own title, lead and photo; the site's default image is `site.seoImage`), and drafts + versions enabled.
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
| `missing-addresses` | none (written by the proxy) | read | read, delete |
| `users` | none | read self, update self | all |
| Globals | read | update (except `inquiryRouting`) | all |

Disable GraphQL if nothing uses it. Lock down the REST API to what the site needs.

## 3. Collections

### Courses

| Field | Type | Notes |
|---|---|---|
| `title` | text, required | |
| `slug` | text, unique | *(proposed)* transliterated from the title (`src/lib/slug.ts`) |
| `topic` | select, required | Language or topic. **Drives the sticker.** Values = the course stickers of set 50:274 (`courseTopics` in `src/lib/courses.ts`; the hero and contact art aren't offered). |
| `category` | select, required | *(PR 8)* The «Категория» filter group (116:1190): languages, exams, vocational, vouchers, teachers, farmers, computer |
| `language` | select | *(PR 8)* The «Език» filter group; the 7 languages |
| `audience` | select | Students / adults / companies (the «Аудитория» filter group, 116:1190) |
| `audienceNote` | text, optional | *(PR 8)* Shown after the audience on the card («Ученици 12 клас») |
| `cardTag` | text, optional | *(PR 8)* The card's second tag («Вечерна група»); empty: «С ваучер» for a voucher course, else the format |
| `level` | text, optional | Drives the level bubble. Empty → no bubble (`Show level` off). |
| `format` | select | In person / online (the «Формат» filter group): the usual format; each group may have its own |
| `description` | textarea | *(PR 10)* The course page lead |
| `duration` | text | *(PR 10)* Хорариум, for the whole course |
| `levelName`, `program`, `document`, `included` | text | *(PR 10)* Какво получавате |
| `levelUnit` | select: level / grade | *(02.11.2026)* The word under the bubble: «НИВО», or «КЛАС» for exam preparation by school year («11–12») |
| `originalTitle` | text, read-only | *(PR 21)* The old site's title, before audience and format words went to the tags |
| `groups` | join → Groups | *(v0.3.0, `docs/admin-redesign.md` decision 5)* The dates belong to groups, records of the **Groups** collection (`src/collections/Groups.ts`), listed on the course by a join on their `course`: `course` (required), `name` (optional, «Съботни групи»), `start` (required), `end`, `seats`, `days`, `hours`, `format`, `office` (relation to Offices), `legacyUrl` (an old /Courses/N address, redirected to the course), its price is a record of Prices (below). `title` is filled in on save: start date, days and name («4 октомври 2026 · събота · Съботни групи»). No drafts: a group is visible to visitors while its course is published, and is deleted with its course. A group starting today or later is upcoming; one that has started is running until its `end` (none is guessed); one past its end is over. The course's state comes from its groups (`src/lib/course-state.ts`); the site reads them in one query and attaches them as a list (`SiteCourse`, `src/lib/course-query.ts`). |
| `prices` | join → Prices | *(v0.4.0, `docs/admin-redesign.md` decision 6)* Prices are records of the **Prices** collection (`src/collections/Prices.ts`, the «Цени» screen): `course` (required), `group` (optional), `price` (required) with `currency` (EUR default; **never convert imported лв prices silently**), `regularPrice` (above `price`: a promotion, struck through), `label` (the chip: «Промоция», «Базова цена», «за целия курс»), `note` (a line under the price). At most one base price per course (no group) and one price per group: a validation hook and two unique indexes. The site shows the group's price, or else the course's base price, through one resolver (`resolvePrice`, `src/lib/price.ts`); without either it shows «Попитайте». Visible to visitors while the course is published; deleted with its group or course. |
| `seats` | number, optional | |
| `voucherEligible` | checkbox | Voucher flag |
| `relatedProgram` | relationship → Programs | |
| `legacyUrl` | text | *(proposed)* |

**Course states** (board 126:1940): derive each state from `startDate`, `seats` and `_status`. Write the derivation in `lib/course-state.ts` with unit tests, and list the rules in the PR so the user can confirm them.

### Programs

Built in PR 12 (`src/collections/Programs.ts`, blocks in `src/blocks/index.ts`). Drafts and versions as for Courses.

| Field | Type | Notes |
|---|---|---|
| `title`, `slug` | text | `title` is the browser title |
| `type` | select, required | `language` / `vocational` / `vouchers` / `teachers` / `farmers` / `computer` / `translations` (the translation agency's page, /prevodi, PR 14) |
| `language`, `audience` | select | For `language` only: the 7 languages; adults / students. One page per language and audience (a hook rejects a second one); no Russian for adults. The page lives at `/ezitsi/<language>/<audience>` (`routes.languageProgram`), and the pair feeds Audience tabs (129:321). Every other type has one page (a hook rejects a second one) at its route: `/vaucheri`, `/profesionalno-obuchenie/profesii` … |
| `hero` | group | `kicker`, `heading`, `highlight` (part of the heading; on the course-page hero it sits on its own line unless `highlightBreak` is off, as on Translations), `lead`, `ctas` (up to 2 × { label, destination or anchor }: an anchor links a section of the page), `sticker` and `countBubble` { value, label } (course-page hero only) |
| `upcoming` | group | «Курсове по …» (renamed from «Предстоящи курсове», 02.11.2026): every course of the program with its state (`src/lib/programs.ts`): a language page lists its language and audience, the vouchers page the courses payable with a voucher (`voucherEligible`), every other page its course category. `linkScope`: the link goes to the program's courses in the listing, or to all language courses («Всички езикови курсове» on Bulgarian). Hidden without a heading or without courses. |
| `notebook` | group | For `language` only: Program hero art 131:311. `title`, `phrases` (array of { phrase, translation }), `highlight` (1–4: the highlighted phrase), `note` { title, steps, done } (the optional sticky note) |
| `sections` | blocks | See below |

`type: language` renders the notebook hero with the flag sticker for `language`. Every other type renders the course-page hero (halftone panel, sticker, tape, count bubble; PR 13).

Hero buttons and block links pick a destination from `src/lib/destinations.ts`. On a language page, `languageCourses` goes to the page's own «Предстоящи курсове» when it has courses and to the course listing filtered to the language and audience otherwise.

**Section blocks** (each maps to a component on page 03). Every block but `callout` has `anchor`, `heading`, `highlight` and `lead`; an empty heading hides the heading, an empty list hides the section, and the anchor (lowercase Latin, digits, hyphens) becomes the section's id for the hero's buttons.

| Block | Component | Data |
|---|---|---|
| `features` | Feature card 129:348 | `items` { title, text }; optional `callout` { heading, text, cta } under the cards (the computer courses' «Безплатно с ваучер») |
| `levels` | Level card 129:357 | `items` { level, title, text } |
| `steps` | Steps 129:372 (vertical) | `items` { title, text }; optional `callout` { heading, text, cta } above the steps (Callout band 259:449) and a `note` below them (the vouchers page) |
| `textbookSystems` | System card 135:389 | `systems` → Textbook systems; `columns` (two / one); `link` { label, destination } under the cards |
| `systemCards` | System card 240:662 | `cards`: inline cards with the fields of a textbook system, for one page (the voucher programmes, the farmers' courses); `columns`; `link` |
| `certificates` | Certificate card 145:364 | `certificates` → Certificates. The section's anchor is `sertifikati` (homepage «Изпити и сертификати» links here). |
| `faq` | FAQ item 129:335 | `items` { question, answer (rich text, may hold links) } |
| `figures` | Figure card 259:410 | `items` { figure, label } (two by two on a phone); `note` under them. Only official numbers. |
| `callout` | Callout band 259:449 | `layout` (row / stack), `heading`, `text`, `cta`. Phone numbers and email addresses in a callout's text become links (`src/lib/linkify.ts`); a button into the voucher inquiry reports `voucher_apply_click`. |
| `richText` | Section heading 259:2319 + prose | heading + rich text |
| `professions` | Direction card (236:3760) | heading only: every published profession, by direction |
| `exams` | Data table 259:621 | heading only: the exams from 60 days ago on |
| `teacherProgrammes` | Index card 264:448 with numbered List rows 259:2318 | heading only: every published programme, a card per theme |
| `indexCards` | Index card 264:448 | `cards` (up to 3: title, rows numbered or checked, the count on a chip or a navy bubble with its label); numbered rows run on from card to card; optional navy `checklist` { title, items } (the farmers' documents) |
| `projects` | Project card 259:574 | `projects` → Funded projects; the heading beside the cards from 1024px |
| `sendDocument` | Send a document 172:2255 | heading, lead, `steps`, `buttonLabel`, `dropzoneArt` (always / phone only); the languages come from the Translation global, the dropzone and the button open the wizard (PR 8) |
| `priceFactors` | 172:2288 + Page counter 173:378 | heading, lead, numbered `items` { title, text }, `counter` (the Page counter beside them) |
| `faqColumns` | FAQ item 129:335 in two columns (172:2357) | `columns` (up to 2: anchor, heading, items { question, answer }, note) |
| `locations` | Location card 125:302 | heading only: the Contact global's locations |

### Textbook systems

System card 135:389: `name`, `kicker` (the publisher chip, e.g. LONGMAN), `count` and `countLabel` (the level bubble), `description`, `levels` (array of { level }; numbered in order on the card), `strip` { label, note } (the navy «Включено» strip). Seeded from Figma: New Total English, SpeakOut, Team Together, Wider World, Gold Experience.

### Certificates

Certificate card 145:364: `name`, `issuer` (the line above the name, e.g. CAMBRIDGE ESOL), `code` (on the seal: FCE, CAE …), `prep` (the textbook it prepares with). Seeded from Figma: FCE, CAE, CPE, IELTS.

### Professions

Built in PR 13 (`src/collections/Professions.ts`): `directionCode` (3 digits), `directionName`, `name`, `code` (6 digits, unique), `degrees` (multi-select I / II / III, shown «I, II, III степен»). Ordered by dragging in the admin (`orderable`); the page shows a card per direction where its first profession is. Seeded with the 20 professions in 5 directions of the 2026 list (Figma 236:3755).

### Exams

Built in PR 13 (`src/collections/Exams.ts`), the ЦПО's qualification exams in the Data table: `kind` («Вид изпит»), `subject` («Професия / специалност»), `part` (theory / practice / both), `date` (date and time), `place`, `results` (a link to the results, optional). The page lists them by date from 60 days ago on; without any it shows the table's empty state. Not seeded.

### Teacher programmes

Built in PR 13 (`src/collections/TeacherProgrammes.ts`): `number` (official programme number, kept as given, e.g. «01»), `theme` (text; the card the programme is in), `title`, `hours` and `credits` (1–3; optional, not on the page: Figma doesn't show them and they're never invented). Ordered by dragging in the admin (`orderable`); a theme's card comes where its first programme is, and its chip counts its programmes. Seeded with the 29 programmes of Figma 237:3823 in five themes.

### News

| Field | Type | Notes |
|---|---|---|
| `title`, `slug` | text | |
| `shortTitle` | text | *(PR 15)* The breadcrumb's last crumb («Стажове по GreenHost»); empty: the title |
| `date` | date, required | |
| `cover` | upload → media (`kind: photo`) | Auto duotone (§ 4). Tint 30% on news pages, 55% on the homepage. |
| `excerpt` | textarea | For the lead story, cards and the meta description |
| `lead` | textarea | *(PR 15)* The article's first paragraph, set larger; optional |
| `body` | rich text (Lexical) | **H2 headings feed the contents rail** (TOC item 185:366): each H2 gets an id from its text (`src/lib/news.ts`), the rail its text. H2 and H3 only; the page H1 is the title. Quotes are pull quotes. Two blocks: `newsFigures` (up to 4 Figure cards and a caption) and `newsLinkCard` (label, url, button: one link, in a new window). Reading time is computed (200 words a minute). |
| `gallery` | array of uploads | Not shown yet: no design |
| `related` | relationship → News, max 3 *(proposed)* | |
| `legacyId`, `legacyUrl` | text | *(proposed)* `/News/{id}/{slug}` redirects |

### Offices

`name`, `address`, `phones` (array), `emails` (array), `map`, `routes` (rich text: how to get there), `role` *(proposed: `courses` / `translations-plovdiv` / `translations-sofia`, used by routing)*.

- Seed the three offices from `CLAUDE.md` § 3 in PR 2.
- **Map (proposed):** store coordinates and render a static map image plus an "open in maps" link. An embedded Google Maps iframe sets third-party cookies and would need marketing consent first.

### Translation (global)

`languages` (array), `topics` (array). No prices per topic (dropped).


The Translations page (/prevodi) is a Program of type `translations` (PR 14): its hero and sections are blocks like the other program pages. This global keeps the languages for the «Изпратете документ» pair (the homepage and /prevodi).
### Funded projects

Built in PR 13 (`src/collections/FundedProjects.ts`): `title`, `code` (e.g. BG16RFPR001-1.004-1004; not shown on the card), `facts` (array of { label, value }), `goals` (array of text, shown as chips), `logoStrip` (upload → media, `kind: logo`). Seeded with the farmers' project from Figma 237:4189 and its EU logo strip.

- Amounts are stored as the official text from the contract (e.g. «175 958 лв»), not as a number to format. **Open item:** since 01.01.2026 Bulgaria uses the euro; ask the client whether to show лв, € or both.
- The logo strip is rendered exactly as uploaded (§ 4).

### Documents / licences

Built in PR 16 (`src/collections/Documents.ts`): `title` (the caption), `type` (licence / certificate / sample), `scan` (upload → media, `kind: scan`, shown untinted and full size in a dialog). Ordered by dragging. Only details that appear on the document itself. Seeded with the four licences and certificates and the three sample documents from the About frame's image fills (low resolution: ask the client for the originals).

### Team

Built in PR 16 (`src/collections/Team.ts`): `name`, `role`, `photo` (upload → media, `kind: photo`), ordered by dragging. Not shown yet: the About page's «Екип» section is text only in Figma (the `about` global), and member cards with photos have no design. Nothing seeded.

### Inquiries

| Field | Type | Notes |
|---|---|---|
| `topic` | select | The six options of Step 1 (100:260): course, voucher, translation, level test, corporate, other |
| `office` | select | Plovdiv / Sofia, for translations |
| `routedTo` | email | Set by the server from the routing table (§ 5) |
| `name`, `email`, `phone`, `message` | text | Step 3: name and email required, phone and message optional |
| `answers` | array of { question, answer } | *(PR 11)* Step 2's answers as the visitor saw them (schedule, level, voucher, document, languages, company …) |
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

`page` (`privacy` / `cookies`, unique: the addresses are fixed, `routes.privacy()` and `routes.cookies()`), `title` and `highlight`, `kicker`, `sections` (array: `heading`, `tocLabel` for the contents rail, which Figma keeps shorter than the heading, and `body` rich text with paragraphs, numbered lists, links, a table block and a link-button block), `updatedOn` (date, shown under the text; empty: hidden), `pdf` (optional upload, for «Изтегли като PDF»; empty: hidden). The approved privacy and cookie policy texts are seeded as given (PR 17). Versions enabled so changes are traceable.

### Redirects

`from` (the old path, stored lowercase without a trailing slash; unique), `to` (a path or an https address; never an address that redirects again), `source` (`import` / `manual`). Every redirect is a 301, so there's no `type`. Our own collection (PR 19), not Payload's redirects plugin: the proxy (`src/proxy.ts`) reads it directly with `pg`, once a minute at most, without loading Payload. Editors read it; the admin edits it.

### Missing addresses

*(02.11.2026, the user's Y8)* `path` (lowercase, no trailing slash; unique), `hits`, `lastSeen`. Addresses that ended on the 404 page: the proxy counts them and writes the counts once a minute with `pg` (an upsert, at most 200 a minute), leaving out bot noise (`.php`, `wp-…`, `.env`). Nobody adds rows by hand; one worth keeping becomes a redirect, and the row can go.

## 4. Media and the image pipeline

`media` is an upload collection with sharp.

| Field | Notes |
|---|---|
| `alt` | **required** (localized). Decorative images aren't uploaded here; they live in the code. |
| `altReviewed` | checkbox *(proposed)*; false when alt text was drafted during import |
| `kind` | `photo` / `art` / `scan` / `logo` (required) |
| `credit` | optional; the photographer of an Unsplash photo |
| `textInImage` | checkbox, photos only: a poster or a photo with text in it stays out of the wide article banner (`src/lib/media/slots.ts`) |

**What each kind gets on upload:**

| Kind | Treatment |
|---|---|
| `photo` | **Five pre-composited tints**: 88% (hero), 55% (homepage news), 45% (about and general photos), 38% (the homepage's About island), 30% (news pages). Stored as uploads in the hidden `media-tints` collection, at most 2880 px wide, JPEG without EXIF. |
| `art` | Original only. Optional halftone derivative later if a design needs it. |
| `scan` | Original only; no colour treatment. |
| `logo` | **Served exactly as uploaded** (EU publicity rules). No recompression, tint, crop or reformat. |

Every kind also gets a 480 px WebP `thumbnail` for the admin list; it is never used on the site. **Responsive widths and AVIF/WebP** come from Next's image optimizer (`next/image`) on top of the original or the tint, encoded on the first request for each width and format and kept on disk in a volume that outlives deploys (`/app/.next/cache/images`, 500 MB, least recently used first out; v0.2.2), and behind the CDN once there is one, instead of a dozen pre-generated files per tint. (Implemented in PR 2; the earlier proposal pre-generated widths 480–2880 in both formats.)

**Duotone, as measured in Figma (PR 2).** Figma uses two treatments, and the code reproduces both (`src/lib/media/tints.ts`):

- **55%, 45%, 38% and 30%** (News card 62:240, Polaroid 259:582, Torn window 259:588): the colour photo with a duotone copy on top at the tint's opacity. The duotone is a gradient map of the photo's luminance with three stops, not two: brand/primary-strong #183169 → brand/accent #C0AA81 (at 48%) → bg/warm #F7F3EC, with luminance raised to the power 1.34. Fitted to the Figma images within RMSE 6/255.
- **88%, the homepage hero** (57:301): the photo in greyscale under Figma's blend layers, navy #183169 in *screen* mode and sand #E6D6B8 in *multiply* mode, each at 88%. Figma's render is desaturated first (a filter on the image fill that design context doesn't report; measured in PR 8, mean colour within 1/255). #E6D6B8 appears only here and is not a colour token.

**Rendering (`DuotoneImage`):** the component takes `tint` (88 / 55 / 45 / 30) and `clearOnHover`. It serves the pre-composited variant for that tint as a single image, which is best for LCP. With `clearOnHover`, the colour original sits underneath, lazy-loaded, and the composite fades to `opacity: 0` on hover (`docs/motion.md` § 5).

**Halftone and photos:** the brief says duotone and halftone are applied on upload, and also that halftone dots never go over a regular photo. Resolved as: **photos get duotone only; halftone applies to `art` uploads and to the panel patterns.** The course card panels (42%) and textbook cards (7%) are CSS or SVG dot patterns in navy, not image processing. Confirm with the user.

**Tints live in one file** (`src/lib/media/tints.ts`). A script `media:regen` rebuilds all derivatives if a tint changes.

**Hero photo:** the client's classroom photo, `kind: photo`, tint 88%, loaded at once with `fetchpriority="high"` (it is the mobile LCP element). Seeded from Figma's crop of its image fill (666 × 796); a full-resolution original is an open item.

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
| `home` | Homepage hero (heading, highlight, lead, two buttons, the photo and an optional second photo), section titles, program cards, the About island (kicker, heading and its highlighted phrase, lead, the result line, the team photo in a polaroid with its caption, a sticker, a button), the translations block (title, lead, steps, button), featured news count, partner logos. Every link picks a destination from a fixed list (`src/lib/destinations.ts`), which gives «Изпити и сертификати» and «Компютърни курсове» their fixed targets. |
| `translation` | Languages (PR 8: they fill the language pair of «Изпратете документ»; hidden with fewer than two) and topics (PR 14) |
| `about` | *(PR 16)* The About page, a group per section in the subnav's order: hero (kicker, title, highlight, lead, photo, two links), history (lead, years, closing), figures, the «Обучили сме…» statement (audiences, note, up to three polaroids), team (quote, values), standards (the ticket's groups and stub), licences (→ Documents, links), documents after a course (list, fees box, → Documents as samples), projects (→ Funded projects), e-learning (benefits, platforms). An empty section hides itself and its subnav item. |
| `inquiryRouting` | Routing table (§ 5), admin-only |

## 8. Search

- A `search` collection is the index (PR 18), kept in sync by hooks on Courses, Programs, News and Legal pages (afterChange, afterDelete; a draft save indexes the published version) and on the About global, and rebuilt from what's published on every start (`reindexSearch`, at the end of the seed). Not Payload's search plugin: it indexes collections only, and the About page is a global.
- Each record: `type` (`course` / `page` / `news`), `title`, `path` (the section, «Езици › Английски»), `excerpt`, `text` (everything the page is found by), `url`, `source` (`news:12`, unique), `sourceId`, `publishedAt`. Bulgarian only until the English site exists.
- Query (`src/lib/search.ts`): PostgreSQL full-text search with the `simple` configuration (there's no Bulgarian dictionary: words as written, lowercased), every word matched as a prefix, plus `pg_trgm` word similarity (0.5) on the title and excerpt for typos. Ranked by both, newest first on a tie. `unaccent` isn't used: Bulgarian has no accents to fold. The migration creates `pg_trgm` (a trusted extension: the database's owner can) and a GIN index on the indexed text.
- The tabs map to `type`: Всичко (all), Курсове (`course`), Страници (`page`), Новини (`news`), each with a count.

## 9. Revalidation and caching

- Pages are server-rendered and cached. Each collection's `afterChange` and `afterDelete` hooks call `revalidateTag` for the affected pages (a course change revalidates the course, the listing, its program and search).
- CDN purge goes through an interface `purge(paths)` that does nothing until the user's CDN is known.
- Drafts use Payload's preview with draft mode; drafts are never cached publicly.
