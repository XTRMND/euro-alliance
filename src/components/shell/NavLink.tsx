'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'
import { TrackedLink } from '@/components/contact/TrackedLink'
import { inboxOf } from '@/lib/analytics'

/**
 * A site link that marks itself as the current page. External links are plain anchors; a phone
 * or email link from the navigation reports its click (`tel_click`, `mailto_click`) with the
 * header's or footer's placement. Pages render on request, so links don't prefetch: a visitor
 * would otherwise trigger a render of every visible link's page on arrival.
 */
export function NavLink({
  href,
  placement,
  ...rest
}: ComponentProps<'a'> & { href: string; placement?: 'header' | 'footer' }) {
  const pathname = usePathname()
  if (placement && href.startsWith('tel:')) {
    return (
      <TrackedLink
        href={href}
        event="tel_click"
        params={{ office: 'other', placement }}
        {...rest}
      />
    )
  }
  const inbox = href.startsWith('mailto:') && inboxOf(href.slice('mailto:'.length))
  if (placement && inbox) {
    return <TrackedLink href={href} event="mailto_click" params={{ inbox, placement }} {...rest} />
  }
  if (/^(https?:|tel:|mailto:)/.test(href)) return <a href={href} {...rest} />
  const current = href.split(/[?#]/)[0] === pathname && !href.includes('#')
  return <Link href={href} prefetch={false} aria-current={current ? 'page' : undefined} {...rest} />
}
