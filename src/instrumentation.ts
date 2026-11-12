// Starts Payload when the production server starts, so pending migrations (`prodMigrations`) and
// the seed that fills in what's missing (`onInit`, src/seed) run before the first request rather
// than during it. Payload otherwise starts on the first page that reads the CMS: a deploy with a
// migration left staging's database unchanged until someone opened a page, and that visitor
// waited for the seed and the search rebuild (10.11.2026). Next awaits `register` before the
// server takes requests.

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'production') return
  // `next build` loads this file too, and a build needs no database.
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const started = Date.now()
  try {
    const payload = await getPayload({ config })
    payload.logger.info(`Payload started in ${Date.now() - started} ms.`)
  } catch (error) {
    // The server still starts; the first request tries again, as it did before this file.
    console.error('Payload could not start; the first request will try again.', error)
  }
}
