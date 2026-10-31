// The standalone server only serves static assets and public/ when they sit inside
// .next/standalone, so copy them in after `next build`.
import { cpSync, existsSync } from 'node:fs'

cpSync('.next/static', '.next/standalone/.next/static', { recursive: true })

if (existsSync('public')) {
  cpSync('public', '.next/standalone/public', { recursive: true })
}
