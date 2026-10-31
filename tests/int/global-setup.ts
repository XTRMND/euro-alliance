import { execFileSync } from 'node:child_process'
import { rm } from 'node:fs/promises'
import pg from 'pg'

// Creates the test database if needed, then rebuilds it from the committed migrations with
// Payload's CLI (in a child process, so no Payload instance keeps Vitest's main process alive).
export default async function setup() {
  const url = new URL(process.env.DATABASE_URL!)
  const name = decodeURIComponent(url.pathname.slice(1))

  const server = new URL(url)
  server.pathname = '/postgres'
  const client = new pg.Client({ connectionString: server.toString() })
  await client.connect()
  const { rowCount } = await client.query('select 1 from pg_database where datname = $1', [name])
  if (!rowCount) await client.query(`create database "${name.replaceAll('"', '""')}"`)
  await client.end()

  await rm(process.env.MEDIA_DIR!, { recursive: true, force: true })

  execFileSync('pnpm', ['--silent', 'payload', 'migrate:fresh', '--force-accept-warning'], {
    env: process.env,
    stdio: ['ignore', 'ignore', 'inherit'],
  })
}
