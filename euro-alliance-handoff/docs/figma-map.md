# Figma map

Every page and component in the approved design, with its node, and the order to build them.

- **File:** https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh
- **File key:** `0DS5cbqWVsErHFWV8hfOxh`
- **Node links:** `https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=<id with - instead of :>`. The MCP tools also accept the file key and the node ID (`48:184`) separately.
- **Workflow per node:** `get_design_context` → `get_screenshot` → `get_variable_defs` → build with our components (see `CLAUDE.md` § 4). For large page frames, `get_metadata` first, then design context per section.

## Figma pages

| Page | Use |
|---|---|
| 00 Before · euro-alliance.net 31.10.2026 ([`270:245`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=270-245)) | Snapshots of the old site for the before/after comparison. Do not touch. |
| 01 Directions | Early design directions. History only; do not build from it. |
| 02 Foundations | Colour, type, spacing, grid. Source for tokens (PR 3). |
| 03 Components | Every component below. |
| 04 Templates desktop | Page templates at 1440 px. |
| 05 Templates mobile | Page templates at 390 px. |
| 06 Logo | Logo source. Export from here or from the Logo components. |
| 99 Playground | Experiments. Never build from it. |

All pages are built from the components on page 03; the one-off frames were swapped for components on 31.10.2026. If you find a frame on a template that is not a component instance, flag it in the PR rather than building a one-off.

Frames named «Prototype · … landing (not a template)» hold the start states of the landing motion. Use them only for start values (`docs/motion.md`).

## Build order

The order follows `docs/pr-plan.md`. Components first, then pages from the most reused patterns outwards.

1. **Tokens** (PR 3): `get_variable_defs` on page 02 Foundations (and on any template, e.g. Home [`48:184`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=48-184), to confirm all variables are in use).
2. **Basics** (PR 4): Button, Chip, Checkbox, Radio card, Toggle.
3. **Shell** (PR 5): Logo, Logo mark, Header, Header Mobile, Mobile menu, Footer, Footer Mobile, Inquiry band, Inquiry band Mobile.
4. **Patterns** (PR 6): Section heading, List row, Index card, Figure card, Callout band, Count bubble, Project card, Polaroid, Torn window, Data table.
5. **Visuals** (PR 7): sticker set and flags, Course visual, Program hero art, marquees, globe, halftone and duotone helpers.
6. **Pages** (PR 8 onwards): each page PR builds the domain components it needs first (the PR column below), then the page at 1440, then at 390.

## Pages

| PR | Page | Desktop (1440) | Mobile (390) | Notes |
|---|---|---|---|---|
| 8 | Home | [`48:184`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=48-184) | [`115:233`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=115-233) |  |
| 9 | Courses (listing) | [`80:880`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=80-880) | [`116:557`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=116-557) | Filters sheet (mobile): [`116:1190`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=116-1190) |
| 10 | Course | [`81:1226`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=81-1226) | [`117:895`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=117-895) | Course states board: [`126:1940`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=126-1940) |
| 11 | Contact | [`119:1795`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=119-1795) | [`121:1145`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=121-1145) |  |
| 12 | Program: English, adults | [`130:1993`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=130-1993) | [`147:1317`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=147-1317) | Language template |
| 12 | Program: English, students | [`159:1993`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=159-1993) | [`166:1701`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=166-1701) | Language template |
| 13 | Vouchers | [`236:3391`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=236-3391) | [`249:3443`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=249-3443) | Course-page hero |
| 13 | Professions (ЦПО) | [`236:3667`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=236-3667) | [`249:3659`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=249-3659) | Course-page hero |
| 13 | Pedagogical specialists | [`237:3686`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=237-3686) | [`249:3908`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=249-3908) | Course-page hero |
| 13 | Farmers | [`237:3973`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=237-3973) | [`249:4165`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=249-4165) | Course-page hero |
| 13 | Computer courses | [`258:3937`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=258-3937) | [`262:3673`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=262-3673) | Course-page hero |
| 14 | Translations | [`171:2511`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=171-2511) | [`175:2005`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=175-2005) |  |
| 15 | News | [`183:2437`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=183-2437) | [`188:2196`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=188-2196) |  |
| 15 | News article | [`183:2574`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=183-2574) | [`188:2385`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=188-2385) |  |
| 16 | About (За нас) | [`190:2677`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=190-2677) | [`210:2395`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=210-2395) |  |
| 17 | Privacy | [`218:2842`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=218-2842) | [`226:2581`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=226-2581) |  |
| 17 | Cookies | [`224:3208`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=224-3208) | [`226:2775`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=226-2775) |  |
| 17 | Cookie consent, first visit (prototype) | [`224:3391`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=224-3391) | [`226:3826`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=226-3826) | Prototype, not a template |
| 18 | Search | [`219:2913`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=219-2913) | [`226:2920`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=226-2920) |  |
| 19 | 404 | [`219:3127`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=219-3127) | [`226:3254`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=226-3254) |  |
| 5 | Mobile menu | — | [`121:1399`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=121-1399) | Mobile only |

The other language program pages (German, French, Spanish, Italian, Bulgarian / БЕЛ, Russian for students) have no frames of their own. They use the language template from the English pages, with their own flag sticker and CMS content.

## Components (page 03 Components)

The PR column is where each component is first expected. If a page needs a component listed for a later PR (for example, if the homepage turns out to use Course card), build it in the earlier PR.

| Built in PR | Area | Component | Node | Notes |
|---|---|---|---|---|
| 4 | Basics | Button | [`18:30`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=18-30) |  |
| 4 | Basics | Checkbox | [`79:968`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=79-968) |  |
| 4 | Basics | Chip | [`135:328`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=135-328) |  |
| 4 | Basics | Radio card | [`98:270`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=98-270) |  |
| 4 | Basics | Toggle | [`223:349`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=223-349) | Used in cookie settings |
| 5 | Brand | Logo | [`18:21`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=18-21) |  |
| 5 | Brand | Logo mark | [`127:312`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=127-312) | Also the favicon |
| 5 | Shell | Footer | [`79:887`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=79-887) |  |
| 5 | Shell | Footer Mobile | [`114:311`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=114-311) |  |
| 5 | Shell | Header | [`79:784`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=79-784) | Torn bottom edge, soft shadow |
| 5 | Shell | Header Mobile | [`114:295`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=114-295) |  |
| 5 | Shell | Inquiry band | [`79:822`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=79-822) | Navy band |
| 5 | Shell | Inquiry band Mobile | [`114:306`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=114-306) |  |
| 6 | Patterns | Callout band | [`259:449`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=259-449) | Component set; Layout=Row/Stack |
| 6 | Patterns | Count bubble | [`259:475`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=259-475) | Navy, sand number, −8° |
| 6 | Patterns | Data table | [`259:621`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=259-621) |  |
| 6 | Patterns | Figure card | [`259:410`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=259-410) |  |
| 6 | Patterns | Index card | [`264:448`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=264-448) |  |
| 6 | Patterns | List row | [`259:2318`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=259-2318) |  |
| 6 | Patterns | Polaroid | [`259:582`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=259-582) |  |
| 6 | Patterns | Project card | [`259:574`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=259-574) |  |
| 6 | Patterns | Section heading | [`259:2319`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=259-2319) |  |
| 6 | Patterns | Torn window | [`259:588`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=259-588) | About hero |
| 7 | Courses | Course sticker set | [`50:274`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=50-274) | 16 topics + flags: English, German, French, Italian, Spanish, Russian, Bulgarian |
| 7 | Courses | Course visual | [`86:416`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=86-416) | Pose=A/Intro (Intro = landing start state) |
| 7 | Motion | Halftone globe | — | No node ID in the brief: find it by name; behaviour from `docs/motion.md` |
| 7 | Motion | Marquee / Languages | [`63:524`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=63-524) | Component set |
| 7 | Motion | Marquee / Logos | — | No node ID in the brief: find it by name with `get_metadata` on page 03 |
| 7 | Programs | Program hero art | [`131:311`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=131-311) | Notebook; language pages only |
| 8 | News | News card | [`62:240`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=62-240) | State × Tint=Light/Strong |
| 9 | Courses | Course card | [`62:229`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=62-229) | Props: Level, Show level, Level label |
| 11 | Contact | Contact wizard | [`100:518`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=100-518) | Step 1/2/3/Done |
| 11 | Contact | Location card | [`125:302`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=125-302) |  |
| 12 | Programs | Audience tabs | [`129:321`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=129-321) |  |
| 12 | Programs | Certificate card | [`145:364`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=145-364) |  |
| 12 | Programs | FAQ item | [`129:335`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=129-335) |  |
| 12 | Programs | Feature card | [`129:348`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=129-348) | Hover: white to navy |
| 12 | Programs | Level card | [`129:357`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=129-357) |  |
| 12 | Programs | Steps | [`129:385`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=129-385) |  |
| 12 | Programs | System card | [`135:389`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=135-389) | Columns=Two/One |
| 14 | Translations | Page counter | [`173:378`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=173-378) | 1 page = 1800 characters |
| 15 | News | News feature | [`181:365`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=181-365) |  |
| 15 | News | Page number | [`181:371`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=181-371) |  |
| 15 | News | TOC item | [`185:366`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=185-366) | Contents rail, fed by H2s |
| 16 | About | Document photo | [`193:351`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=193-351) |  |
| 16 | About | Subnav item | [`189:349`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=189-349) |  |
| 16 | About | Timeline item | [`189:361`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=189-361) |  |
| 17 | Consent | Cookie consent | [`223:398`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=223-398) | View=Banner/Settings/Mobile |
| 18 | Search | Search field | [`217:358`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=217-358) |  |
| 18 | Search | Search result | [`217:368`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=217-368) |  |

## Variants and states to check per component

Before building a component, read its variant properties with `get_design_context` and implement each one. In particular:

- **Button:** every type and every state (default, hover, focus, pressed, disabled).
- **Course card:** `Level`, `Show level`, `Level label`. When the CMS has no level, the bubble is not rendered.
- **Course visual:** `Pose=A` is the resting state; `Pose=Intro` is the landing start state.
- **News card:** `State` × `Tint=Light/Strong`. Light (30%) on news pages, Strong (55%) on the homepage.
- **System card:** `Columns=Two/One`.
- **Callout band:** `Layout=Row/Stack`.
- **Contact wizard:** Step 1, 2, 3 and Done.
- **Cookie consent:** `View=Banner/Settings/Mobile`.
- **Course states board** [`126:1940`](https://www.figma.com/design/0DS5cbqWVsErHFWV8hfOxh?node-id=126-1940): every state a course page can be in. Derive each state from CMS fields (`docs/cms-schema.md`, Courses) and note the rule in the PR.

## Code Connect (PR 26)

When every component above exists in code, map each Figma component to its code component: `get_code_connect_suggestions` for the node, review, then `send_code_connect_mappings` in one batch. This is the only time you write to the Figma file, and only after the user says go. Check first that the team's Figma plan supports Code Connect; if it doesn't, tell the user and skip the PR.
