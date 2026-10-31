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
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm start',
        env: { PORT: String(port), DEV_PAGES: 'true' },
        url: baseURL,
      },
})
