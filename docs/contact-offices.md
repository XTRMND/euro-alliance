# Brief for Claude Code: Contact page, offices section (Option A)

Rebuild the section under the Contact hero so the wizard keeps its natural height and the office cards no longer form one tall block. This affects the public site only. Work through the Figma MCP. Save this brief as `docs/contact-offices.md` in the PR.

## Ground rules

- Follow CLAUDE.md and docs/git-workflow.md. Use **one PR**, on branch `feat/contact-offices-a`, and never push to `main`.
- Merging to `main` deploys staging. This PR doesn't migrate data. If you find it has to, stop and write it under «Open questions» instead.
- **Don't stop when something is unclear.** Pick the option closest to Figma and this brief, write it under «Open questions» in the PR description, and carry on.
- **Never invent content.** Every text, number, phone and hour comes from the CMS as it is today. Nothing gets hard-coded.
- The hero, the wizard's content, the «Как да ни намерите» section, the header and the footer stay exactly as they are. Visual snapshots for every other page stay green.

## Figma (source of truth)

- **File:** `0DS5cbqWVsErHFWV8hfOxh`, page «99 Playground» (`1:6`).
- **How to read it:**
  1. Call `create_session` first.
  2. For each frame: `get_design_context` on the node, then `get_screenshot` to compare.
  3. Use `get_variable_defs` for tokens.
- **Build with the project's own components and tokens.** Never ship the raw generated code.

| Frame | Node | Use it for |
|---|---|---|
| Contact redesign · Option A · 1440 | `513:2` | Desktop layout, Step 1 |
| Contact redesign · Option A · 390 | `515:63` | Mobile layout, Step 1 |
| Contact redesign · Option A · 1440 · Step 2 Превод | `521:220` | How the layout behaves when the wizard is tallest |
| Contact redesign · Option A · 390 · Step 2 Превод | `522:262` | Same, mobile |
| Halftone globe (turns on scroll) | `229:355` | The decoration under the wizard |

- **Only build the body section.** In these frames the header and hero are copies of what's already live.
- **The wizard in the frames is a reference for size only:**
  - Step 1 in Figma still shows the old «Курс» description under «Обучение». Keep the build's copy.
  - The Step 2 frames use **stand-in labels**: «Кога» for the date, «Къде да донесете документите» for the office choice, and chip rows for the languages. Don't copy them. The wizard's fields and copy stay exactly as they are in the build.
- **Ignore the notes above the frames.** They're for design review.
- Options B and C (`516:81`, `517:130`, `518:145`, `519:200`) were rejected. Don't build them.

## What changes

**1. Two columns, as now.**

- Desktop grid: wizard column 760 px, offices column 472 px, 48 px gap. Section padding is 16 / 80 / 80 / 80.
- Both columns start at the top. The wizard keeps its natural height in every step. It must never stretch to match the offices.

**2. Offices that share an address become one card.**

- **Grouping rule:** offices with the same address render as one card, in their existing order. Today that means «Централен офис, Пловдив» and «Преводи, Пловдив».
- **Fallback:** if the grouped offices' hours aren't identical, render them as separate cards, as now. Hours are only shown once when they are identical.
- **Shared card, top to bottom:**
  1. Kicker «Пловдив · курсове и преводи» and title «ул. Самара №13». These are the same values the Location card (`125:302`) shows for that address, so take them from the same source. If that source isn't the Offices collection, say so in «Open questions».
  2. The full address line.
  3. Two columns, 16 px gap. One per office: its kicker («Курсове и обучения» / «Преводи и легализация»), its name, then its phone and e-mail.
  4. The hours stub (point 3).
  5. The bank line, last.
- **The Sofia card** keeps its own content: kicker, name, address, phone, e-mail, then the hours stub.

**3. Hours as a ticket stub.**

- **Perforation:** a dashed line (`border/default`, 1.5 px, dash 6 / gap 5, round caps) separates the contact details from the hours.
- **Notches:** a 22 px circle sits on each card edge, centred on the line. Fill it with the page paper (`bg/warm`) and give it a 1 px `border/default` outline. The card clips them so they read as notches. Both the perforation and the notches are `aria-hidden`.
- **Columns:** «Работно време» and the seasonal block («Работно време от 15 юни до 1 септември») sit side by side, 20 px gap. On mobile they stack.
  - The forced line break after «време» in Figma is only a hint. Let the label wrap naturally and don't split the CMS string.
- **Rows:** the day label is 68 px wide in `text/muted`, the time uses `text/primary`. Values with «почивен ден / почивни дни» are muted. Use a `<dl>` or a small table so screen readers pair each day with its time.
- **Data:** hours come from the Offices records as they are now. If the seasonal block isn't modelled with its own label and dates, write it under «Open questions». Don't reshape the data in this PR.

**4. The globe fills the leftover space under the wizard (desktop only).**

- Reuse the homepage globe component, `aria-hidden`.
- **Size:** it takes the height left after the wizard: offices column − wizard − 24 px gap. It's centred, with a diameter of at most 340 px.
- **When it hides:** below 140 px of space, hide it and don't run its script. That's the case on Step 2 «Превод»; compare against `521:220`.
- **Pure CSS is enough:**
  - left column: `display:flex; flex-direction:column`;
  - globe container: `flex: 1 1 0; min-height: 0`;
  - a ResizeObserver hides the container when it's under 140 px.
- **Motion:** same as on the homepage. It turns only while scrolling, and stays still with `prefers-reduced-motion`.
- The globe must update when the wizard changes step.

**5. Mobile (390).**

- **Order:** hero, wizard, then an «Офиси» heading (38 px, already in the mobile template), the Plovdiv card, the Sofia card. No globe.
- **Sizes:** card padding 22 / 20, 16 px between blocks, 16 px between cards.
- **Tap rows:** every phone and e-mail sits in its own row at least 48 px high, with a hairline top border, and the whole row is the link.
- In the shared card, the two offices stack.

**6. Links and events.**

- Phones are `tel:` and e-mails are `mailto:`.
- Keep the existing `tel_click` / `mailto_click` events (behind consent). Add the office as a parameter if it isn't there.

## Type and spacing (from the frames)

| Element | Style |
|---|---|
| Kicker | Sofia Sans Extra Condensed Bold 14, uppercase, +4% tracking, `text/muted` |
| Card title | Sofia Sans Extra Condensed ExtraBold 28, `brand/primary-strong` |
| Office name in the shared card | Sofia Sans Extra Condensed Bold 23, `brand/primary-strong` |
| Address | Sofia Sans 15, `text/primary` |
| Phone | Sofia Sans SemiBold 18, `brand/primary` |
| E-mail | Sofia Sans Medium 15, `brand/primary` |
| Hours | Sofia Sans 15 (day) / Medium 15 (time) |
| Bank line | Sofia Sans 13, `text/muted` |

- **Cards:** white, 1 px `border/default`, 16 px radius, 24 px padding, 18 px between blocks, 24 px between cards.

## Not in scope

- A sticky offices column. On Step 2 the column ends about 170 px before the wizard, which is accepted. If you think sticky is worth it, add it under «Open questions» instead of building it.
- Changes to the wizard's steps, fields or copy.
- Updating the approved Contact templates in Figma (`119:1795`, `121:1145`). That's done separately in Figma, with the copy from staging.
- JSON-LD opening hours. If the SEO PR already outputs Organization data, list `openingHoursSpecification`, including the seasonal dates, as a follow-up.

## The PR includes

- The Figma nodes above.
- Screenshots next to the Figma screenshot at 1440 and 390, for Step 1 and Step 2 «Превод».
- Updated visual snapshots for the Contact page only.
- Checks: types, lint, unit, e2e, visual tests, axe and Lighthouse (no regressions). Also check reduced motion, and that no element overflows or collides at 390 / 768 / 1024 / 1440.
- Its «Open questions» list, if any.
