# Brief for Claude Code: Euro Alliance CMS admin redesign

Rework the Payload admin to match the Figma mockups and the decisions below. Work through the Figma MCP. Save this brief as `docs/admin-redesign.md` in the first PR.

## Ground rules

- Follow CLAUDE.md and docs/git-workflow.md: one PR per step, branches `feat/…`, `fix/…`, `chore/…`, and never push to `main`.
- Merging to `main` deploys staging. Any PR with a migration must:
  - have a working `down`;
  - be tested on a local copy of the staging database;
  - say clearly in its description: "This deploy migrates data."
- The public site must look exactly the same unless a step says otherwise. Visual snapshots stay green.
- **Work through every step without stopping for review.**
  - Stack the branches: each PR is based on the previous one.
  - I merge them in order. When one is merged, rebase the rest onto `main`.
- **When something is unclear, don't stop.**
  - Pick the option closest to Figma and this brief.
  - Write it under «Open questions» in that PR's description, then carry on.
  - Never invent content: no made-up prices, names, dates or texts.
- The admin stays in Bulgarian. English is the second content language, through Payload localization, which is already on.

## Figma (source of truth)

- **File:** `0DS5cbqWVsErHFWV8hfOxh`, page «07 CMS admin» (`354:2`).
- **How to read it:**
  1. Call `create_session` first.
  2. For every screen: `get_design_context` on the node, then `get_screenshot` to compare against.
  3. Use `get_variable_defs` for tokens.
- **Build with the project's own components and tokens.** Never ship the raw generated code.
- **Read the notes on the page:**
  - the frame «Решения · 11.11.2026» lists the decisions;
  - the title and note above each screen explain it.
- **The data in the mockups is sample data.** Do not seed it. The «Примерни данни» tag in the top bar is for the mockups only; don't build it.

**Components (frame `354:3`):**

| Component | Node | Notes |
|---|---|---|
| Admin / Sidebar v2 | `366:1133` | Every item is named "Nav / path". Per screen, branches open or close and one item is active. |
| Admin / Top bar | `354:83` | |
| Admin / Nav item | `354:53` | 3 levels × Default/Active |
| Admin / Sub-nav tab | `354:58` | The hairline sub-nav |
| Admin / Pill | `354:67` | |
| Admin / Field | `354:82` | Has a «БГ» badge for localized fields |

**Screens:**

| # | Screen | Node |
|---|---|---|
| 01 | Табло | `359:969` |
| 02 | Обучения › Езикови курсове › Курсове | `356:100` |
| 03 | Course edit (Групи tab, price link, draft/publish, versions, live preview) | `367:664` |
| 04 | Цени | `370:1186` |
| 05 | Вход | `360:1120` |
| 06 | Запитвания (list + detail) | `371:1332` |
| 07 | News edit + live preview | `372:1586` |
| 08 | Programme: «Секции» + «Добави секция» drawer | `373:1726` |
| 10 | За нас by section + live preview | `375:2345` |
| 12 | Навигация (menu editor) | `377:2711` |

## Decisions

**1. The sidebar mirrors the public site.**

| Item | Children |
|---|---|
| Табло | |
| Запитвания | badge with the count of new ones |
| Начална страница | |
| Обучения | Езикови курсове › Програми · Курсове · Учебни системи · Сертификати |
| | Професии (ЦПО) › Страница · Професии · Изпити · Курсове |
| | Педагогически специалисти › Страница · Програми |
| | Земеделски стопани › Страница · Курсове |
| | Компютърни курсове › Страница · Курсове |
| | Ваучери › Страница · Курсове |
| | Всички курсове |
| Цени | |
| Преводи | Страница · Езици |
| Новини | |
| За нас | Страница · Екип · Документи и лицензи · Проекти |
| Контакти | Страница · Офиси |
| Сайт | Навигация · Данни за фирмата · Правни страници · Пренасочвания |
| Footer | Потребители · Изход |

- No «Глобални» anywhere in the UI, but the globals stay globals in the backend (no migration).
- Items open filtered list views or a document's edit view.

**2. Light theme only.** Lock the admin to light and remove the theme option from the account page.

**3. Layout rule:**

- One card per screen at full height: 32 px margin, max width 1096 px.
- Equal columns: `flex: 1 1 0`.
- Fixed row heights; content scrolls inside the card, and table headers stay pinned.

**4. Courses nest by programme.** Reduce the `category` values to programme branches: languages, vocational, teachers, farmers, computer. Migrate:

| From | To |
|---|---|
| exams (Cambridge FCE and CAE prep, БЕЛ ДЗИ, БЕЛ НВО) | languages |
| vouchers, English courses | languages |
| vouchers, «Дигитални умения» | computer |

«С ваучер» (`voucherEligible`) stays a checkbox. «Ваучери › Курсове» is the filter `voucherEligible = true`.

**5. «Групи» become their own collection, `groups`.**

- **Fields:**
  - `course` (required), `name` (localized), `start`, `end`, `seats`;
  - `days` (localized), `hours`;
  - `format`, `office` (relationship).
- **Migration:** move `courses.groups[]` into it (7 of 55 courses on staging have groups), then remove the array.
- **In the course edit screen**, show the groups with a `join` field in the «Групи» tab. Label each row by its start date and days, never «Item 01».

**6. Prices are their own collection, `prices` (the «Цени» screen).**

- **Fields:**
  - `course` (required), `group` (optional);
  - `price`, `currency`, `regularPrice` (for promotions);
  - `label` (localized), `note` (localized).
- **Rule:** at most one base price per course (group empty) and one price per group.
- **Migration:** move the existing group price fields into it.
- **On the site:** the price shown is the group's price, or else the course's base price. Use one resolver everywhere a price appears. The output must stay identical.

**7. «Преводи» is a section, not a global.** Move the languages list from the `translation` global into the «Преводи и легализация» programme (type translations), migrate it, then delete the global.

**8. Dropped:**

- **Search plugin and the `search` collection.** The site's search page (Figma `219:2913`) queries courses, news, programmes and the page globals directly. Keep its tabs and counts: Всичко / Курсове / Страници / Новини.
- **The `missing-addresses` collection** and whatever writes to it.
- **«Медия» as a menu item and library.** Keep the uploads collection hidden; it is only reached from photo fields, and alt text is filled in there. `media-tints` stays hidden too.

**9. Inquiries.** Status values are «Нова / В работа / Приключено». Map any existing values to these and tell me how you mapped them. Keep the 1-year retention.

**10. Navigation links are picked, not typed.**

- A link is one of:
  - a programme or course (relationship);
  - a fixed site page (select: Начална, Курсове, За нас, Контакти, Новини, …);
  - a custom URL as the fallback.
- **Migration:** convert the existing hrefs and list anything you couldn't match.

**11. Live preview, client-side** (`admin.livePreview` + `useLivePreview`), on top of the existing drafts.

- Covers courses, programmes, news and the home, about and contact globals.
- Breakpoints 390 and 1440.
- Render the existing page templates from live data.

**12. Copy fixes:**

- every array row gets a real label: no «Item 01», «Добави Item» or «Phone 01»;
- Bulgarian tooltips in the text editor;
- «Текстът е проверен / не е проверен» instead of «вярно / невярно»;
- a proper admin 404 page;
- Bulgarian date formats.

## PR plan (in order, stacked, without waiting between them)

**Data:**

1. **`groups` collection** + migration + `join` field on courses. The site reads groups from there.
2. **`prices` collection** + migration + price resolver. The site output is unchanged.
3. **Category clean-up** (decision 4) + the translation languages moved into the programme (decision 7).
4. **Removals:**
   - search plugin and `search` collection → direct search on the search page;
   - `missing-addresses`;
   - hide `media`;
   - lock the light theme.
5. **Navigation link pickers** + migration (decision 10).

**Admin UI:**

6. **Admin shell:**
   - branding (tokens and fonts from Figma, the logo mark as the admin icon);
   - custom Nav (the sidebar tree, active state, open/closed branches, the inquiries badge);
   - top bar (breadcrumbs, BG/EN switch, «Виж сайта», account menu);
   - hairline sub-nav;
   - login (05).
7. **Dashboard (01):** a custom dashboard view following the one-card rule.
8. **Lists:**
   - courses per programme (02: grouping, columns, sort);
   - news;
   - inquiries as list + detail (06).
9. **Edit screens:** the course (03) tabs and «Групи», news (07), row labels, the «БГ» badges, draft/publish and versions placement.
10. **«Цени» custom view (04):** inline editing of `prices`, grouped by programme, with an unsaved-changes state.
11. **Live preview** (decision 11).
12. **Page editors:**
    - programme sections with Bulgarian section names and a grouped «Добави секция» drawer (08);
    - «За нас» by section (10), using a section rail;
    - the Навигация editor (12).
13. **Copy fixes** (decision 12) and a polish pass.

**Every PR includes:**

- its Figma node(s);
- screenshots at 1440 next to the Figma screenshot;
- regenerated `payload-types.ts`;
- the migration name, if any;
- checks: types, lint, unit, e2e, visual tests and Lighthouse;
- its «Open questions» list, if any.

**When all 13 are open**, post one summary with:

- the PRs and the order to merge them;
- which ones migrate data;
- every open question across them.

## Not in scope

- Screens not yet in Figma: «Преводи», the other programmes' lists, Начална страница, Контакти, the smaller collections.
  - Build them from the same patterns only when you reach them.
  - Note anything unclear as an open question.
- The admin at mobile width.
