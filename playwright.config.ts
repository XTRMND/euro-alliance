import { defineConfig, devices } from '@playwright/test'

// Runs against the production build: `pnpm build && pnpm test:e2e`. Its own port, so a dev
// server on 3000 is never mistaken for the build under test.
const port = 3100
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  updateSnapshots: 'missing',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    // A stored «Само задължителни» choice, so the cookie banner covers no page under test;
    // tests/e2e/consent.spec.ts starts without it.
    storageState: 'tests/e2e/consented.json',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // WebKit for what renders differently in Safari (the logo badge stretched into an oval there).
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testMatch: /badge\.spec\.ts/ },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm start',
        // The server reads DATABASE_URL and PAYLOAD_SECRET from the environment or .env.
        // A test GA4 ID: analytics.spec.ts checks the tag loads only with consent (gtag.js is
        // stubbed in the tests that grant it).
        env: {
          ...process.env,
          PORT: String(port),
          DEV_PAGES: 'true',
          GA4_MEASUREMENT_ID: 'G-TEST123456',
        } as Record<string, string>,
        url: baseURL,
      },
})
