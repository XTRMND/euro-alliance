// Security headers (PR 24, docs/pr-plan.md § 24). Two parts:
// - the same headers on every response (next.config.ts): HSTS in production, nosniff, the referrer
//   policy, a Permissions-Policy denying what the site doesn't use, and X-Frame-Options for
//   browsers without frame-ancestors;
// - a Content-Security-Policy with a fresh nonce per page (src/proxy.ts). Next puts the nonce on
//   its own scripts; ours read it with `requestNonce()`. 'strict-dynamic' lets those trusted scripts
//   load others (the chunks, gtag.js after consent), so no host list is needed for scripts. Styles
//   allow 'unsafe-inline' for React's style attributes (CSS custom properties per element).
// Google Analytics' hosts are allowed only when a measurement ID is set (src/lib/analytics.ts);
// the tag itself still loads only after statistics consent.

export const nonceHeader = 'x-nonce'

/** A fresh nonce for one response: 128 random bits, base64. */
export function createNonce(): string {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))))
}

// GA4's hosts, as Google lists them for a CSP (gtag.js, collection and the region endpoints).
const analyticsHosts = {
  script: ['https://*.googletagmanager.com'],
  img: ['https://*.google-analytics.com', 'https://*.googletagmanager.com'],
  connect: [
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.googletagmanager.com',
  ],
}

type PolicyOptions = {
  nonce: string
  /** Development: React needs eval for its error overlays, and the dev server a web socket. */
  dev?: boolean
  /** A GA4 measurement ID is set. */
  analytics?: boolean
  /** The admin's live preview frame: the admin (the same origin) may show it in a frame. */
  framedBySelf?: boolean
}

function serialize(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(' '))
    .join('; ')
}

/** The site's policy (and the admin's, which runs on the same framework). */
export function contentSecurityPolicy({
  nonce,
  dev = false,
  analytics = false,
  framedBySelf = false,
}: PolicyOptions) {
  const ga = analytics ? analyticsHosts : { script: [], img: [], connect: [] }
  return serialize({
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      ...(dev ? ["'unsafe-eval'"] : []),
      ...ga.script,
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', ...ga.img],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", ...(dev ? ['ws:'] : []), ...ga.connect],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    // The admin shows the live preview in a frame: the admin itself may show frames of this
    // origin (frame-src falls back to default-src 'self'), and only the preview may be framed.
    'frame-ancestors': [framedBySelf ? "'self'" : "'none'"],
  })
}

// HSTS for five minutes, for this host only, until launch (the user, 02.11.2026): no
// includeSubDomains until the client confirms every subdomain serves HTTPS, and no preload. The
// launch checklist (PR 27) raises it to two years.
export const hsts = 'max-age=300'

/** The headers every response carries (next.config.ts). */
export function securityHeaders({ production }: { production: boolean }) {
  return [
    ...(production ? [{ key: 'Strict-Transport-Security', value: hsts }] : []),
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Frame-Options', value: 'DENY' },
    {
      key: 'Permissions-Policy',
      value: [
        'accelerometer',
        'autoplay',
        'bluetooth',
        'browsing-topics',
        'camera',
        'display-capture',
        'geolocation',
        'gyroscope',
        'hid',
        'magnetometer',
        'microphone',
        'midi',
        'payment',
        'serial',
        'usb',
      ]
        .map((feature) => `${feature}=()`)
        .join(', '),
    },
  ]
}
