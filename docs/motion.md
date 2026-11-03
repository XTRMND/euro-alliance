# Motion and behaviour

Figma's design context does not reliably carry motion or behaviour, so implement everything here from this file. Values marked **spec** are approved. Values marked **proposed** fill a gap; use the Figma value instead if the relevant frame or variant has one, and note in the PR which you used.

## 1. Tokens

Put these in `src/styles/tokens.css` next to the colour tokens and use them everywhere. No magic numbers in components.

| Token | Value | Status | Used for |
|---|---|---|---|
| `--motion-button` | 150ms | spec | Button hover, focus, press |
| `--motion-card` | 250ms | spec | Course, program and feature card hovers |
| `--motion-news` | 350ms | spec | News photo clearing to full colour |
| `--motion-landing` | 850ms | spec ("about 0.85 s") | One-time landing motion |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | proposed (spec says ease-out) | Landing and hovers |
| `--landing-rise` | 30px | spec ("about 30 px") | Copy fade-up distance |
| `--landing-stagger` | 120ms | proposed | Delay between copy, art and badge |
| `--strip-height` | 56px | spec | Language strip and partner logos |
| `--strip-speed` | 18 (px/s) | spec | Both strips |

## 2. One-time landing motion

**Spec:** one landing motion per page. Copy fades up about 30 px; the hero art settles: the sticker drops into the panel and the badge turns in from −40°. Ease-out, about 0.85 s. Nothing loops except the strips and the globe.

- **When:** once per page load, on first render of the hero. It never replays on scroll, on re-render, or when the page is restored from the back/forward cache. (Interpretation of "one-time"; if the user wants once per session instead, it is a one-line change in `lib/motion.ts`.)
- **Sequence (proposed timing):**
  1. 0 ms: hero copy (headline with highlighter, lead, buttons) from `opacity: 0; transform: translateY(var(--landing-rise))` to rest.
  2. 120 ms: hero art. The sticker drops into the panel from above to its resting position and rotation.
  3. 240 ms: the badge / count bubble from `rotate(-40deg); opacity: 0` to its resting `rotate(-8deg)`.
- **Start values:** read them from the «Prototype · … landing (not a template)» frames and from `Course visual` `Pose=Intro` (86:416). Resting values come from the template frames.
- **Implementation:** CSS keyframes with `animation-fill-mode: both`, no JavaScript. Server-rendered HTML animates on its own, so there's no flash and no dependency on hydration.
- **LCP guard:** never fade the LCP element in from `opacity: 0` (on the homepage that is likely the hero photo). Animate the copy and the art only, and confirm the LCP element in the Lighthouse report for each page.
- **Reduced motion:** none of this runs. Everything renders in its resting state.
- **Sections below the first screen** (the homepage's About island, 03.11.2026): the same fade-up, once, the first time the section comes into view: the copy at 0 ms, the art 120 ms later (`RevealOnScroll`, `landing.module.css`'s `.revealCopy` / `.revealArt`). This needs JavaScript: the section is hidden only after the script has found it off screen, so without JavaScript, already on screen or with reduced motion it simply shows. The other homepage sections don't do this yet.

## 3. Language strip and partner logos

**Spec:** thin (56 px) and slow, about 18 px/s (one pass about 48 s). Pauses on hover. Partner logos move at the same speed.

- Duration is computed from the measured width of one set of items: `duration = width / 18` seconds. Set it as a CSS custom property from a small `ResizeObserver`, so the speed stays at 18 px/s whatever the content length or viewport.
- Seamless loop: render the item list twice and translate by exactly one set width. The duplicate set is `aria-hidden="true"` and `inert`.
- Animate `transform: translate3d()` only. Use `will-change: transform` only while the strip is on screen.
- Pause (`animation-play-state: paused`) on hover, on `:focus-within`, and while the strip is off screen (`IntersectionObserver`).
- **Accessibility:** WCAG 2.2.2 requires a way to pause moving content that lasts more than 5 s, and hover isn't available to keyboard or touch users. Add a small pause/play button with a label from `messages/*.json`. If Figma has no such control, add one in the design language and list it in the PR as a deviation for the user to approve.
- The language names are live text with flag stickers, not an image. Partner logos are images with alt text (the partner name).
- **Reduced motion:** the strips don't move. The content stays visible as a static row (wrapping on mobile).

## 4. Homepage hero globe

**Spec:** turns only while the page scrolls, about 0.22° per px, eased, and stops when scrolling stops. Halftone world: navy land, sand Europe, Bulgaria marked; dots smaller toward the edge. A tiny canvas script that redraws only during scroll.

Reference implementation: `docs/reference/globe-demo.html` (copied from the approved live demo). Port its drawing and scroll logic into `components/visuals/Globe`. Its values:

| Parameter | Value |
|---|---|
| Land data | 360 × 180 mask, 1° cells, 2 bits each: 0 sea, 1 land, 2 Bulgaria. Base64 in the demo (21.6 kB; 16.2 kB raw, about 1.8 kB gzipped). |
| Europe | lat 34° to 72°, lon −12° to 42° (land there is drawn sand) |
| Start rotation | −24° |
| Rotation per scroll px | 0.22° (target = −24 − scrollY × 0.22) |
| Easing | each frame `current += (target − current) × 0.12`; stops when the gap is under 0.05° |
| Tilt | 0.42 rad, north tipped toward the viewer so Europe sits on the face |
| Dot grid | hexagonal; spacing `d = max(6, size / 46)`; row height `d × 0.866` |
| Dot radius | land `0.4d`, Bulgaria `0.5d`, sea `0.16d`, each × `(0.45 + 0.55 × z)` so dots shrink toward the edge |
| Colours | land and Bulgaria brand/primary-strong (#183169); Europe brand/accent (#C0AA81); sea `rgba(24, 49, 105, 0.13)` |
| Pixel ratio | `min(2, devicePixelRatio)` |

Production changes from the demo:

- **Light only.** The demo has dark-mode colour values for the chat preview; the site has no dark mode, so drop them. Read colours from the token custom properties.
- **Redraw only while scrolling and only while visible.** Attach the passive scroll listener only while the globe is in view (`IntersectionObserver`); no `requestAnimationFrame` loop runs when the page is still.
- **Size:** the script is about 3.2 kB raw (about 1.5 kB gzipped). Ship the land mask as a static binary asset with a long cache lifetime instead of inline base64, or inline it if that measures better.
- **Loading:** the globe is decoration. Load it after first paint so it never competes with LCP, and reserve its box so there's no layout shift.
- **Semantics:** the canvas is `aria-hidden="true"`. The bubble on it («7» + «ЕЗИКА») is HTML text from i18n, not drawn on the canvas.
- Drop the demo's scroll hint; it was only for the demo.
- **Reduced motion:** draw once at −24° and never attach the scroll listener.

## 5. Hovers

**Spec:** course cards lift and their sticker tilts; news photos clear to full colour; program cards straighten; feature cards turn from white to navy. Buttons 0.15 s, cards 0.25 s, news 0.35 s.

| Element | Effect | Duration | Values |
|---|---|---|---|
| Button (18:30) | colour change per the Hover variant | `--motion-button` | from Figma |
| Course card (62:229) | card lifts; sticker tilts | `--motion-card` | from a hover variant if one exists; else proposed `translateY(-6px)` with a deeper shadow, sticker `rotate(+6deg)` from rest |
| News card photo (62:240) | duotone layer fades to full colour | `--motion-news` | tint layer opacity → 0 |
| Program cards (homepage) | straighten | `--motion-card` | rotation → 0deg |
| About island (homepage) | the polaroid straightens; the sticker tilts like a course card's | `--motion-card` | polaroid 4° → 0°; sticker −4.2° → 5°, 1.107×, up and right; on hovering the art |
| Feature card (129:348) | white → navy | `--motion-card` | background brand/primary, text text/on-brand |
| About photos | clear to full colour where the design says so | `--motion-news` | as news |

- All hover effects sit inside `@media (hover: hover) and (pointer: fine)`. Touch devices don't get stuck hover states.
- Keyboard: `:focus-visible` on the card's link produces the same visual state as hover, plus the focus ring.
- A whole card is one link (a single `<a>` with the stretched-link pattern). No nested interactive elements inside a card link.
- Transition `transform`, `opacity`, `background-color`, `color` and `box-shadow` only. Never transition layout properties.
- **Reduced motion (proposed):** keep colour and opacity changes (they help orientation), drop the lift, tilt and straighten movement.

## 6. Reduced motion, summarised

With `prefers-reduced-motion: reduce`:

- no landing motion; everything renders at rest;
- strips don't move; content stays visible;
- the globe is drawn once and stays still;
- hovers keep colour and opacity changes and lose movement (proposed);
- smooth scrolling (logo to top, anchor links) becomes instant.

Playwright covers this with `reducedMotion: 'reduce'` on every page (definition of done, `CLAUDE.md` § 9).

## 7. Cookie consent

**Spec:** banner on first visit with equal-weight «Само задължителни» and «Приеми всички», plus «Настройки» for categories. Essential is always on; functional, statistics and marketing are off by default. The choice is stored for 6 months. «Настройки на бисквитките» in the footer reopens it. Consent Mode v2 for any Google tags.

- **Figma:** Cookie consent 223:398 (`View=Banner/Settings/Mobile`); first-visit prototype 224:3391 (desktop) and 226:3826 (mobile).
- **Equal weight:** the two main buttons have the same size, style prominence and position weight. No pre-ticked boxes, no dark patterns.
- **Storage:** a first-party cookie `ea_consent`, value `{ v, ts, functional, statistics, marketing }`, `Max-Age=15552000` (180 days), `SameSite=Lax`, `Secure`, `Path=/`. `v` is the consent version: bump it when categories or vendors change, and the banner asks again.
- **Before consent:** no non-essential cookie is set and no non-essential script runs. Verify in Playwright by asserting the cookie jar and network requests on first load.
- **Consent Mode v2:** before any Google tag loads, set defaults to `denied` for `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`, `functionality_storage` and `personalization_storage`; `security_storage` is `granted`. On a choice, call `gtag('consent', 'update', …)`: statistics → `analytics_storage`; marketing → `ad_storage`, `ad_user_data`, `ad_personalization`; functional → `functionality_storage`, `personalization_storage`.
- **Proposed: basic mode.** Google tags don't load at all until statistics consent is given (instead of advanced mode's cookieless pings). The client's current site runs tracking without consent; basic mode is the clean break. The user decides (`docs/measurement.md`).
- **Retention:** no cookie lives longer than 12 months. GA4's own cookies default to 2 years, so set `cookie_expires` to at most 31536000 seconds in the GA4 config.
- **Reopening:** the footer button opens the Settings view as a dialog with focus trapped inside, `Esc` to close, and focus returned to the footer button.
- The banner doesn't block reading the page and isn't a modal. The Settings view is a modal dialog.

## 8. Links and in-page actions

- **Logo:** links to the homepage. On the homepage it scrolls to the top (smooth; instant with reduced motion) and moves focus to the top of `main`.
- **Every card and button has a destination.** A Playwright test crawls each page and fails on any `<a>` without `href`, any `href="#"`, and any button without a handler.
- **In-page actions are `<button>`s:** filters, «Покажи още», «Копирай адреса», PDF download, wizard steps.
  - «Копирай адреса» copies the office address with the Clipboard API and announces success through a polite live region.
  - «Покажи още» loads the next batch and moves focus to the first new item.
  - Filters update the URL query (shareable, back button works) without a full reload.
- Homepage program cards: «Изпити и сертификати» goes to the certificates section of the language pages; «Компютърни курсове» goes to the Computer courses page.

## 9. Contact wizard

**Spec:** 3 steps + done. The topic is preselected from the page the visitor came from.

- **Figma:** Contact wizard 100:518 (Step 1, 2, 3, Done); Contact page 119:1795 / 121:1145.
- **Preselection:** every CTA that leads to the wizard carries the topic in the link, e.g. `/kontakti?tema=prevodi` (route names per the agreed URL scheme). Don't rely on `document.referrer`. Unknown or missing topic → no preselection.
- Each step is validated before moving on. Errors appear next to the field and are announced. Moving to a step moves focus to its heading. The step indicator says «Стъпка 2 от 3» to screen readers.
- Back keeps entered data. Leaving the page with unsent data doesn't need a confirm dialog.
- Translation topics include the document upload (`docs/cms-schema.md` § Inquiries).
- Spam protection without third-party cookies: a honeypot field, a minimum time-to-submit check and server-side rate limiting per IP.
- Submission goes through a server action. The Done step shows only after the server confirms the inquiry was stored.
- Events: `wizard_start`, `wizard_step`, `wizard_submit`, `document_upload` (`docs/measurement.md`).

## 10. Page counter (translations)

**Spec:** counts characters; 1 page = 1800 characters.

- **Figma:** Page counter 173:378.
- Counts characters including spaces (the usual Bulgarian standard page). **Confirm with the client**, and confirm how to round: proposal is to show the exact character count plus pages to one decimal.
- Updates as the visitor types or pastes; works without uploading anything.
- No prices (translation price per topic was dropped).
- The result is announced through a polite live region, throttled so screen readers aren't flooded.

## 11. Search

**Spec:** the query is highlighted in results; filter tabs Всичко / Курсове / Страници / Новини with counts.

- **Figma:** Search 219:2913 / 226:2920; Search field 217:358; Search result 217:368.
- The search page reads `?q=` and the tab from the URL, so results are shareable and the back button works.
- Matches are wrapped in `<mark>` (styled per Figma).
- Tabs are a proper tablist with counts in their accessible names.
- Empty query: show the field only. No results: say so and suggest the main sections (from Figma; if Figma has no empty state, propose one in the PR).
- Index and ranking: `docs/cms-schema.md` § Search.
