# Git workflow

How Claude Code works with git on this project.

## 1. Repository

- The user creates the GitHub repository. Claude Code clones it.
- **Nothing is pushed to `main`** (the user, 09.11.2026; it replaces the straight-to-`main` rule of 31.10.2026). Every change goes through a branch (§ 2) and a pull request (§ 4), one per version (§ 6), which the user reviews and merges. Never force-push `main`.
- Before every push, run the checks of every CI job locally. After it, confirm CI is green on the PR; if it isn't, fix it on the branch.
- Screenshots go in `docs/screenshots/`, open items also in `CLAUDE.md` § 12.
- `main` can now be protected (a pull request and green CI required): the user's setting on GitHub.

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

## 6. Versions, merging and releases

- **One PR per version.** Each PR raises `version` in `package.json` ([SemVer](https://semver.org)): `0.x` until launch, `1.0.0` at launch (PR 27). Minor (`0.2.0` → `0.3.0`) for new features, content or tooling; patch (`0.3.0` → `0.3.1`) for fixes only; after launch, major for changes that break something outside the code (the URL scheme, a content change that needs manual steps). CI's `version` job fails a PR that doesn't raise it, or raises it to a version already tagged.
- The PR title is the Conventional Commit with the version at the end: `feat(seed): staging seed (v0.2.0)`.
- Two open PRs can't both take the next version: the one merged second raises its version again (and rebases) before it's merged.
- **Squash-merge** after the user's review. The squash commit message is the PR title.
- **Release:** when CI passes on `main` after the merge, `.github/workflows/release.yml` tags the merge commit `v<version>` and publishes a GitHub release whose notes are the PR's description. A version already tagged isn't released twice.
- Delete the branch after merging.

## 7. Secrets and environment

- Secrets only in environment variables. Never commit `.env`, `.env.local` or any real credential.
- `.env.example` lists every variable with a comment and a fake value: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `INQUIRY_EMAIL_OVERRIDE`, `GA4_MEASUREMENT_ID`, storage settings once known.
- CI secrets are GitHub Actions secrets, set by the user.

## 8. Preview deployments

Preview deployments run on the **user's infrastructure**, not on a managed platform. There is one shared staging server (the user, 05.11.2026): every push to `main` is pushed to Docker Hub and, once the fast checks pass, deployed to https://staging.euro-alliance.net by the `deploy-staging` job ([`deploy/README.md`](../deploy/README.md)). There are no per-PR previews; CI still builds the image on every PR, and the PR screenshots come from the local production build.

Staging and previews always set `INQUIRY_EMAIL_OVERRIDE` and `noindex` (header `X-Robots-Tag: noindex` and `robots.txt` disallow), and never load analytics.
