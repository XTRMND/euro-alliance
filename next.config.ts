import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

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
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/api/media-tints/file/**' }],
  },
  turbopack: { root: dirname },
  experimental: {
    // The contact wizard's server action carries translation documents: up to 10 files of 20 MB
    // (src/lib/inquiries.ts), checked again on the server.
    serverActions: { bodySizeLimit: '205mb' },
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
