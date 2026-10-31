import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Project rules live in CLAUDE.md; don't let `next dev` write AGENTS.md.
  agentRules: false,
  images: {
    // Responsive widths in AVIF and WebP come from Next's optimizer, cached behind the CDN.
    formats: ['image/avif', 'image/webp'],
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/api/media-tints/file/**' }],
  },
  turbopack: { root: dirname },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
