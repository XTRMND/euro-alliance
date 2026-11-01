import { notFound } from 'next/navigation'

// Any address no page matches: the 404 page (../not-found.tsx) with a real 404 status, inside the
// site's layout. The admin's and the API's routes are more specific, so they never land here. Old
// addresses are redirected before this, by the proxy (src/proxy.ts).
export default function UnknownPage() {
  notFound()
}
