import type { Payload } from 'payload'

// The site applies migrations when it starts (src/instrumentation.ts); the seed never does. Run
// against a database that's behind the code, its first read failed on a missing column
// (10.11.2026), so `pnpm seed:staging` checks first and refuses with the names.

/** The migrations of this build the database hasn't applied, in their order. */
export async function pendingMigrations(payload: Payload, names: string[]): Promise<string[]> {
  const applied = await payload
    .find({ collection: 'payload-migrations', depth: 0, pagination: false })
    .then(({ docs }) => new Set(docs.map((doc) => doc.name)))
    // No migrations table: an empty database, with every migration still to apply.
    .catch(() => new Set<string>())
  return names.filter((name) => !applied.has(name))
}
