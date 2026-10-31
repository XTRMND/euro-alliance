import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Integration tests run Payload against a throwaway database that is wiped and migrated on every
// run, so never point TEST_DATABASE_URL at a database you care about.
const env = {
  DATABASE_URL:
    process.env.TEST_DATABASE_URL ??
    'postgres://euro_alliance:euro_alliance@localhost:5432/euro_alliance_test',
  PAYLOAD_SECRET: 'integration-tests',
  MEDIA_DIR: path.join(os.tmpdir(), 'euro-alliance-int-media'),
}
Object.assign(process.env, env)

const src = (file: string) => fileURLToPath(new URL(`./src/${file}`, import.meta.url))

export default defineConfig({
  resolve: {
    alias: { '@payload-config': src('payload.config.ts'), '@': src('') },
  },
  test: {
    include: ['tests/int/**/*.test.ts'],
    env,
    globalSetup: ['tests/int/global-setup.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
})
