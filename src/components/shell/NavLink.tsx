'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'

/**
 * A site link that marks itself as the current page. External links are plain anchors. Pages
 * render on request, so links don't prefetch: a visitor would otherwise trigger a render of every
 * visible link's page on arrival.
 */
export function NavLink({ href, ...rest }: ComponentProps<'a'> & { href: string }) {
  const pathname = usePathname()
  if (/^(https?:|tel:|mailto:)/.test(href)) return <a href={href} {...rest} />
  const current = href.split(/[?#]/)[0] === pathname && !href.includes('#')
  return <Link href={href} prefetch={false} aria-current={current ? 'page' : undefined} {...rest} />
}
