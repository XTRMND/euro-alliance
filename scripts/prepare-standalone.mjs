// The standalone server only serves static assets and public/ when they sit inside
// .next/standalone, so copy them in after `next build`.
import { cpSync, existsSync } from 'node:fs'

cpSync('.next/static', '.next/standalone/.next/static', { recursive: true })

if (existsSync('public')) {
  cpSync('public', '.next/standalone/public', { recursive: true })
}

// Files the production seed uploads on first start (src/seed): the homepage photo, the partner
// logos, the contact page's maps and the About page's photos and scans. Read at runtime from the
// working directory, like public/.
for (const dir of ['home', 'partners', 'contact', 'about']) {
  cpSync(`src/seed/${dir}`, `.next/standalone/src/seed/${dir}`, { recursive: true })
}
