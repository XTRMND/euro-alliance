# Git workflow

How Claude Code works with git on this project.

## 1. Repository

- The user creates the GitHub repository. Claude Code clones it and works on branches.
- **Never push to `main`.** Never merge your own PR.
- Suggested branch protection on `main` (the user sets it): require a pull request, require the CI checks to pass, require linear history (squash merges only), block force-pushes.

## 2. Branches

- One short-lived branch per PR, created from an up-to-date `main`.
- Names: `feat/…`, `fix/…`, `chore/…`, `docs/…` (plus `perf/…`, `a11y/…`, `test/…` where they fit), lowercase and hyphenated: `feat/contact-wizard`, `chore/repo-scaffold`.
- Rebase on `main` before asking for review if `main` has moved. **No force-push to shared branches.** On your own branch before review, use `--force-with-lease` only, and never after the user has started reviewing.

## 3. Commits

- [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary` in the imperative, at most 72 characters.
- Small, reviewable commits, each of which builds.
- Examples:
  - `feat(shell): add header with torn edge and shadow`
  - `feat(cms): add Courses collection and migration`
  - `fix(wizard): keep entered data when going back a step`
  - `chore(ci): add Lighthouse CI budget`
  - `docs(i18n): add consent banner keys`

## 4. Pull requests

**One PR per logical step** (`docs/pr-plan.md`). If a PR grows past roughly 800 changed lines (excluding generated files, migrations and snapshots), split it.

Every PR includes:

1. **Summary:** what and why, in a few sentences.
2. **Figma:** the node link(s) built in this PR.
3. **Screenshots:** the page or component at **1440** and **390**, each next to the Figma screenshot (`get_screenshot`) of the same node.
4. **Checklist:** types, lint, tests, axe, Lighthouse, reduced motion, links and hovers (template below).
5. **Deviations from the design:** anything that differs from Figma, and why.
6. **Open items:** content that is missing or unknown, and decisions waiting on the user.

Add this template as `.github/pull_request_template.md` in PR 1:

```markdown
## Summary

## Figma
- Desktop: <node link>
- Mobile: <node link>

## Screenshots
| Figma 1440 | Build 1440 |
|---|---|
|  |  |

| Figma 390 | Build 390 |
|---|---|
|  |  |

## Checklist
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Unit tests pass (new logic has tests)
- [ ] Playwright smoke and visual tests pass
- [ ] axe: 0 violations at 1440 and 390 (including open states)
- [ ] Lighthouse CI budget passes
- [ ] Reduced motion respected
- [ ] No overflow, no colliding neighbours, nothing off the page edge (1440, 1024, 768, 390, 360)
- [ ] Every card and button has a destination and keeps its hover
- [ ] All fixed strings come from messages/bg.json and are listed in docs/i18n.md
- [ ] No invented content; empty fields hide their element
- [ ] No secrets committed

## Deviations from the design

## Open items
```

## 5. CI (GitHub Actions, on every PR)

| Job | What it runs |
|---|---|
| `typecheck` | `tsc --noEmit` |
| `lint` | ESLint and Prettier check |
| `test` | Vitest unit tests |
| `build` | `next build` with a PostgreSQL service container and migrations applied |
| `e2e` | Playwright against the production build with seeded data: smoke tests (every route returns 200, no console errors), the overflow and link checks, axe at 1440 and 390, reduced-motion checks, and visual regression snapshots |
| `lighthouse` | Lighthouse CI on the key pages with the budget in `lighthouserc` |
| `secrets` | A secret scanner (e.g. gitleaks) on the diff |

- **Visual regression vs Figma comparison.** Playwright snapshots catch regressions against the last approved build. They are not compared pixel-by-pixel with Figma renders (fonts and anti-aliasing differ). The Figma comparison is the side-by-side screenshots in the PR, reviewed by the user.
- When a visual change is intended, update the snapshots in the same PR and say so in the summary.
- Cache dependencies and Playwright browsers between runs.

## 6. Merging

- **Squash-merge** after the user's review. The squash commit message is the PR title in Conventional Commit form.
- Delete the branch after merging.

## 7. Secrets and environment

- Secrets only in environment variables. Never commit `.env`, `.env.local` or any real credential.
- `.env.example` lists every variable with a comment and a fake value: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `INQUIRY_EMAIL_OVERRIDE`, `GA4_MEASUREMENT_ID`, storage settings once known.
- CI secrets are GitHub Actions secrets, set by the user.

## 8. Preview deployments

Preview deployments run on the **user's infrastructure**, not on a managed platform. The mechanism (a preview server per PR, a shared staging server, Docker images pushed to a registry) is an open item for the user. Until it's agreed, CI builds a Docker image on every PR so it's ready to deploy, and the PR screenshots come from the local production build.

Staging and previews always set `INQUIRY_EMAIL_OVERRIDE` and `noindex` (header `X-Robots-Tag: noindex` and `robots.txt` disallow), and never load analytics.
