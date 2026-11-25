import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { securityHeaders } from './src/lib/security-headers'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
  // The proxy handles trailing slashes, so an old address with one is still a single redirect
  // (src/proxy.ts).
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  // Project rules live in CLAUDE.md; don't let `next dev` write AGENTS.md.
  agentRules: false,
  images: {
    // Responsive widths in AVIF and WebP come from Next's optimizer, cached behind the CDN.
    formats: ['image/avif', 'image/webp'],
    // 75 for everything; 100 for the photos that are a page's main art: the homepage hero's, the
    // About hero's team photo (TornWindow) and the homepage's About polaroid. Nothing asks for 90
    // now; it stays allowed for a photo that needs something in between. Next encodes AVIF 20
    // below the number asked for, so 75 is AVIF 55, which smears faces and hair; 100 is AVIF 80,
    // about 10 KB more at the hero's size.
    qualities: [75, 90, 100],
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/api/media-tints/file/**' }],
    // The encoded files stay in a volume across deploys (Dockerfile), so they're bounded: the
    // least recently used go first past 500 MB. Next's default is half the free disk, and the
    // server shares its disk with the database.
    maximumDiskCacheSize: 500_000_000,
  },
  turbopack: { root: dirname },
  // The same security headers on every response; the per-page Content-Security-Policy comes from
  // src/proxy.ts (src/lib/security-headers.ts).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders({ production: process.env.NODE_ENV === 'production' }),
      },
    ]
  },
  experimental: {
    // The contact wizard's server action carries translation documents: up to 10 files of 20 MB
    // (src/lib/inquiries.ts), checked again on the server.
    serverActions: { bodySizeLimit: '205mb' },
    // The proxy keeps a copy of a request's body for the route behind it, 10 MB unless told: a
    // larger upload would arrive cut short. As much as the wizard's form may carry.
    proxyClientMaxBodySize: '205mb',
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
