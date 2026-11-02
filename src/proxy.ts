import { type NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { measurementIdOf } from '@/lib/analytics'
import { isSitePath, normalizePath, staticRedirects, withoutEnglish } from '@/lib/redirects'
import { contentSecurityPolicy, createNonce, nonceHeader } from '@/lib/security-headers'

// Old addresses (docs/content-import.md § 5): a single 301 to the new page (302 for the English
// copies under /en until the English site exists), whatever the case and
// with or without a trailing slash (next.config's redirects can't ignore case, and Next's own
// trailing-slash redirect would add a hop: skipTrailingSlashRedirect is on). Pages of the new site
// pass straight through; anything else is looked up in the fixed map, then in the `redirects`
// collection, and otherwise gets the 404 page. The collection is read once a minute at most, with
// its own small pool: the proxy doesn't load Payload.
// Every page it lets through, the site's and the admin's, gets a Content-Security-Policy with a
// fresh nonce (src/lib/security-headers.ts): on the request, where Next reads it to put on its
// scripts, and on the response.

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, max: 2 })
  : null

let stored: { at: number; map: Map<string, string> } | null = null

async function storedRedirects(): Promise<Map<string, string>> {
  if (stored && Date.now() - stored.at < 60_000) return stored.map
  try {
    const { rows } = await pool!.query<{ from: string; to: string }>(
      'select "from", "to" from redirects',
    )
    stored = { at: Date.now(), map: new Map(rows.map((row) => [row.from, row.to])) }
  } catch (error) {
    // Without the table (before its migration) or the database, no stored redirects.
    console.error('Redirects: could not read the collection.', error)
    stored = { at: Date.now(), map: stored?.map ?? new Map() }
  }
  return stored.map
}

/**
 * Where an old address goes, and how: 301 for good, but 302 for the English copies (/en/…), which
 * point at the Bulgarian page only until the English site exists (the user's decision, 02.11.2026).
 */
async function redirectFor(
  pathname: string,
): Promise<{ target: string; status: 301 | 302 } | undefined> {
  const english = normalizePath(pathname)
  const path = withoutEnglish(english)
  const status = path === english ? 301 : 302
  // /en on its own is the old English homepage.
  if (path === '/' && english !== '/') return { target: '/', status }
  const target = staticRedirects[path] ?? (pool ? (await storedRedirects()).get(path) : undefined)
  return target ? { target, status } : undefined
}

// Addresses that end on the 404 page are counted here and written once a minute to the «Липсващи
// адреси» collection (src/collections/MissingAddresses.ts), at most 200 a minute. Bot noise isn't
// counted.
const botNoise =
  /(^|\/)(wp-|wordpress|xmlrpc|cgi-bin|phpmyadmin|\.well-known|\.git|\.env)|\.(php\d?|aspx?|cgi|sql|bak|ini|ya?ml|log|zip|tar|gz|rar)$/i
const missing = new Map<string, { hits: number; lastSeen: Date }>()
let flushing: ReturnType<typeof setTimeout> | null = null

async function flushMissing() {
  flushing = null
  const rows = [...missing].slice(0, 200)
  missing.clear()
  for (const [path, { hits, lastSeen }] of rows) {
    try {
      await pool!.query(
        `insert into missing_addresses (path, hits, last_seen, updated_at, created_at)
         values ($1, $2, $3, now(), now())
         on conflict (path) do update set hits = missing_addresses.hits + excluded.hits,
           last_seen = excluded.last_seen, updated_at = now()`,
        [path, hits, lastSeen],
      )
    } catch (error) {
      // Without the table (before its migration) or the database, nothing is recorded.
      console.error('Missing addresses: could not record.', error)
      return
    }
  }
}

function recordMissing(request: NextRequest) {
  const path = normalizePath(request.nextUrl.pathname)
  if (!pool || !['GET', 'HEAD'].includes(request.method) || botNoise.test(path)) return
  const seen = missing.get(path)
  if (!seen && missing.size >= 200) return
  missing.set(path, { hits: (seen?.hits ?? 0) + 1, lastSeen: new Date() })
  flushing ??= setTimeout(flushMissing, 60_000)
}

/** The page, with a Content-Security-Policy whose nonce Next puts on its scripts. */
function withPolicy(request: NextRequest) {
  const nonce = createNonce()
  const policy = contentSecurityPolicy({
    nonce,
    dev: process.env.NODE_ENV === 'development',
    analytics: Boolean(measurementIdOf(process.env.GA4_MEASUREMENT_ID)),
  })
  const headers = new Headers(request.headers)
  headers.set(nonceHeader, nonce)
  headers.set('Content-Security-Policy', policy)
  const response = NextResponse.next({ request: { headers } })
  response.headers.set('Content-Security-Policy', policy)
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (isSitePath(pathname) || pathname === '/admin' || pathname.startsWith('/admin/')) {
    return withPolicy(request)
  }

  const redirect = await redirectFor(pathname)
  if (redirect) return NextResponse.redirect(new URL(redirect.target, request.url), redirect.status)

  // The new site's own addresses never end in a slash.
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return NextResponse.redirect(new URL(pathname.replace(/\/+$/, '') + search, request.url), 308)
  }
  // Anything else gets the 404 page.
  recordMissing(request)
  return withPolicy(request)
}

export const config = {
  // Not the framework's files, Payload's API, or the files in public/.
  matcher: [
    '/((?!_next/|api/|fonts/|logos/|icon|apple-touch-icon|favicon|robots\\.txt|sitemap).*)',
  ],
}
