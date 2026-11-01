// Lighthouse budget from CLAUDE.md § 9: mobile, lab, 3 runs per URL, each metric asserted on its
// median across the runs (the user's decision, 01.11.2026). Pages that miss it are flagged and
// fixed in the performance pass (PR 23); the budget isn't relaxed.
// lighthouserc.desktop.cjs reuses this with the desktop preset and a higher performance bar.

const port = 3100

// Key pages; each page PR adds its own.
const paths = ['/']

const median = (options) => ['error', { ...options, aggregationMethod: 'median' }]

module.exports = {
  ci: {
    collect: {
      startServerCommand: `PORT=${port} pnpm start`,
      url: paths.map((path) => `http://localhost:${port}${path}`),
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': median({ minScore: 0.9 }),
        'categories:accessibility': median({ minScore: 1 }),
        'categories:best-practices': median({ minScore: 1 }),
        'categories:seo': median({ minScore: 1 }),
        'largest-contentful-paint': median({ maxNumericValue: 2500 }),
        'cumulative-layout-shift': median({ maxNumericValue: 0.05 }),
        'total-blocking-time': median({ maxNumericValue: 200 }),
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: 'lighthouse-reports/mobile',
    },
  },
  median,
}
