import { type NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { measurementIdOf } from '@/lib/analytics'
import { isSitePath, normalizePath, staticRedirects, withoutEnglish } from '@/lib/redirects'
import { previewHeader, previewTarget } from '@/lib/preview'
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

/** The page, with a Content-Security-Policy whose nonce Next puts on its scripts. */
function withPolicy(request: NextRequest) {
  const nonce = createNonce()
  // The admin's live preview frame: a page of the site with `?preview=` (src/lib/preview.ts). It
  // may be shown in a frame by this origin (the admin); everything else by no one.
  const preview =
    !request.nextUrl.pathname.startsWith('/admin') &&
    previewTarget(request.nextUrl.searchParams) !== undefined
  const policy = contentSecurityPolicy({
    nonce,
    dev: process.env.NODE_ENV === 'development',
    analytics: Boolean(measurementIdOf(process.env.GA4_MEASUREMENT_ID)),
    framedBySelf: preview,
  })
  const headers = new Headers(request.headers)
  headers.set(nonceHeader, nonce)
  // The marker goes on as a header for the readers (src/lib/preview-request.ts), which honour it
  // for a signed-in editor only; a header of that name sent from outside is dropped.
  headers.delete(previewHeader)
  if (preview) headers.set(previewHeader, request.nextUrl.searchParams.toString())
  headers.set('Content-Security-Policy', policy)
  const response = NextResponse.next({ request: { headers } })
  response.headers.set('Content-Security-Policy', policy)
  if (preview) response.headers.set('X-Frame-Options', 'SAMEORIGIN')
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
  return withPolicy(request)
}

export const config = {
  // Not the framework's files, Payload's API, or the files in public/.
  matcher: [
    '/((?!_next/|api/|fonts/|logos/|icon|apple-touch-icon|favicon|robots\\.txt|sitemap).*)',
  ],
}
