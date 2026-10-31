import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Project rules live in CLAUDE.md; don't let `next dev` write AGENTS.md.
  agentRules: false,
}

export default nextConfig
