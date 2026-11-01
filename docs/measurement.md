# Measurement

Two jobs: analytics events on the new site (behind consent), and the before/after comparison for the user's portfolio.

## 1. Analytics on the new site

### Decisions (PR 20)

| Question | Built |
|---|---|
| GA4 property | The client's existing property if they grant access, so history stays in one place; otherwise a new one. The measurement ID goes in `GA4_MEASUREMENT_ID` (open item). |
| gtag.js or GTM | **gtag.js** directly: fewer scripts, a tighter Content Security Policy. GTM only if the client's marketing needs it. |
| Facebook Pixel | Not added. If the client uses it, it loads only with marketing consent (its cookies are already removed on withdrawal). |
| Consent Mode | **Basic**: no Google tag loads until statistics consent (`docs/motion.md` § 7). |
| Consent counter | The anonymous per-choice counter below isn't built: the user decides. |

### Implementation

- `src/lib/analytics.ts` exports `track(event, params)`. It sends nothing without statistics consent; with it, the event is queued in `dataLayer` (the head script defines `gtag`) until gtag.js has loaded.
- `src/components/shell/GoogleAnalytics.tsx` loads gtag.js when statistics is granted, at the first visit or later from the banner or the settings, and sets `ga-disable-<id>` when it's withdrawn (the `_ga` cookies are deleted then). The measurement ID is read on the server when a page is served: no tag without it or with the placeholder.
- Typed events: a TypeScript union of the event names and their params, so a typo fails the build.
- **No personal data in events.** Never send names, emails, phone numbers, file names or message text. The `search` term is cleaned first (`cleanSearchTerm`): anything that looks like an email address, a phone number or a long digit sequence is replaced with `[redacted]`.
- GA4 cookie expiry: `cookie_expires` 31536000 seconds (no cookie lives longer than 12 months).
- Page views on client navigation come from GA4's enhanced measurement (browser history changes, on by default).
- **For the owner of the GA4 property:** mark `wizard_submit` as the key event (Admin → Data display → Events). `tel_click`, `mailto_click`, `enrol_click` and `voucher_apply_click` are secondary.
- Tests: `tests/e2e/analytics.spec.ts` runs the server with a test ID and a stubbed gtag.js: nothing reaches Google before consent or with essential cookies only; with statistics the config (12-month cookies) is queued before the events; withdrawing stops GA.

### Events

| Event | Fires when | Params |
|---|---|---|
| `wizard_start` | first interaction with the wizard | `topic` (preselected or none), `source_page` |
| `wizard_step` | the visitor reaches a step | `step` (1–3), `topic` |
| `wizard_submit` | the server confirms the inquiry was stored | `topic`, `office` (plovdiv / sofia / none), `has_upload` |
| `document_upload` | translation files are added in the wizard | `file_count` |
| `enrol_click` | an enrol button on a course or program page | `course` (slug), `language`, `audience`, `level` |
| `tel_click` | a `tel:` link is clicked | `office`, `placement` (header / footer / page / contact) |
| `mailto_click` | a `mailto:` link is clicked | `inbox` (office / prevod / trans), `placement` |
| `course_view` | a course page is viewed | `course`, `language`, `audience`, `level` |
| `search` | a search is run | `search_term` (cleaned), `results_count`, `tab` |
| `voucher_apply_click` | the voucher application link or button | `destination` |
| `cookie_consent` | a consent choice is made | `choice` (essential_only / all / custom), `functional`, `statistics`, `marketing` |

`cookie_consent` can only reach GA4 when statistics was granted. To count every choice, including «Само задължителни», the server can keep an **anonymous aggregate counter** per choice and day (no cookie, no IP, no identifier). Proposed; the user decides.

### The conversion count that doesn't depend on consent

Consent means GA4 will undercount. The `inquiries` collection in Payload is the ground truth: count inquiries per topic and month directly from the database (an admin-only report or a SQL query). Use GA4 for rates and paths, and Payload for the actual number of inquiries.

## 2. Before / after (portfolio)

The baseline was captured on 31.10.2026 from the live site, without admin access. GA4 and Search Console are not available, so conversions are measured from launch onwards.

### Visual "before"

Figma page **«00 Before · euro-alliance.net 31.10.2026»** (node 270:245): full-page snapshots of 6 pages at desktop 1440 and mobile 390.

| Old page | Old URL | New page |
|---|---|---|
| Начало | `/` | `/` |
| Английски за възрастни | `/Language-Education/Language-Educations-for-Adults/English` | `/ezitsi/angliyski/vazrastni` |
| Преводи | `/Translations/Document-Translations` | `/prevodi` |
| Ваучери | `/Vouchers` | `/vaucheri` |
| За нас | `/About-us/…` (as captured) | `/za-nas` |
| Новини | `/News` | `/novini` |

New URLs follow the proposed scheme; update them if it changes. For the "after", capture the same pages at the same widths from the new site and place them on a new Figma page «00 After · <launch date>» (the user does this, or asks for it).

### Speed: PageSpeed Insights, Lighthouse 13.6, homepage, 31.10.2026 18:54

| | Mobile | Desktop |
|---|---|---|
| Performance | 54 | 31 |
| Accessibility | 85 | 83 |
| Best practices | 96 | 100 |
| SEO (Lighthouse) | 100 | 100 |
| FCP | 7.7 s | 0.9 s |
| LCP | 33.0 s | 5.6 s |
| TBT | 120 ms | 520 ms |
| CLS | 0 | 0.268 |
| Speed Index | 14.8 s | 3.7 s |

- **Field data (CrUX, 28 days, mobile):** LCP 1.7 s, CLS 0, FCP 1.3 s, TTFB 0.4 s, INP n/a. Core Web Vitals pass in the field.
- **Report:** https://pagespeed.web.dev/analysis/https-euro-alliance-net/ojq3ddjhfg
- Note for the write-up: lab and field disagree a lot on the old site (lab LCP 33.0 s, field 1.7 s). Compare lab with lab and field with field, never across.

### SEO: crawl of 120 pages

- 80 pages without an H1; 6 with several H1s.
- 120/120 without a canonical; 120/120 without an Open Graph image; 0 with structured data.
- 32 pages with duplicate titles; 6 with an empty meta description. The homepage description is a keyword list.
- 328 of 1473 images without alt text (22%).
- No broken internal links.

### Accessibility: axe-core 4.10, 5 pages

| Page | Issue types | Elements | Serious or critical |
|---|---|---|---|
| Home | 9 | 78 | 60 |
| English for adults | 8 | 69 | 57 |
| Translations | 8 | 64 | 52 |
| Vouchers | 8 | 43 | 28 |
| About | 8 | 43 | 31 |
| **Total** | | **297** | **228** |

Main issue: colour contrast (200 elements), then missing landmarks, link names and heading order.

### Security and infrastructure

- **SSL Labs:** B (no forward secrecy).
- **Mozilla Observatory:** F, 10/100 (5 tests failed).
- **Response headers:** no HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy or Permissions-Policy. Server: Apache. `cache-control: max-age=0`.

### Privacy

- Runs GA (gtag, GTM, old Universal Analytics) and the Facebook Pixel with no consent banner.
- The privacy page says the site uses no cookies.

### Proposed "after" targets

| Area | Target |
|---|---|
| Lighthouse (homepage, mobile) | Performance ≥ 90, Accessibility 100, Best practices 100, SEO 100 |
| Lighthouse (homepage, desktop) | Performance ≥ 95, others 100 |
| Lab vitals (mobile) | LCP ≤ 2.5 s, CLS ≤ 0.05, TBT ≤ 200 ms |
| Field (CrUX, +28 days) | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (all "good") |
| SEO crawl | one H1 per page; canonical, Open Graph image and unique title + description on every page; structured data on the homepage and every course; 0% images without alt |
| axe (same 5 pages) | 0 violations |
| SSL Labs | A or better (TLS configuration on the user's servers) |
| Observatory | A or better (headers from PR 24) |
| Privacy | no non-essential cookie or tag before consent |

### After launch

1. **Launch + 1 week:** repeat the lab tests (PageSpeed Insights, homepage, mobile and desktop; run 3 times and report the median plus the Lighthouse version), the crawl (same tool and settings as the baseline), axe on the same 5 pages (same axe version, or note the version change), SSL Labs, Observatory, response headers, and the 6 snapshots at 1440 and 390.
2. **Launch + 28 days:** CrUX field data, once there is enough traffic for a report.
3. **Conversions:** from launch, month over month, from the events above and from the Payload inquiry count. Enrolment peaks in September, so compare September with September once a year of data exists.
4. **Before publishing anything:** get the client's written OK for the numbers and screenshots.

Keep every raw result (JSON from Lighthouse and axe, crawl exports, screenshots) in `measurement/after-<date>/` in the repo, or wherever the user prefers, so the comparison can be reproduced.
