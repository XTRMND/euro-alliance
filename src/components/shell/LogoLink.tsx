'use client'

import { Img } from '@/components/ui/Img'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MouseEvent } from 'react'
import logoDark from '@/assets/logo-dark.svg'
import logoLight from '@/assets/logo-light.svg'

// Logo: the client's own files since 23.11.2026 (Figma's 18:21 before), as supplied: Light (navy)
// on paper and white, Dark (white) on navy. It links home; on the homepage it scrolls to the top
// and moves focus to the start of <main> (docs/motion.md § 8).

type LogoLinkProps = {
  theme: 'light' | 'dark'
  label: string
  className?: string
}

// Not preloaded: the logo is never the largest paint, and a preload competes with the fonts.
export function LogoLink({ theme, label, className }: LogoLinkProps) {
  const pathname = usePathname()

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (pathname !== '/') return
    event.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    document.getElementById('main')?.focus({ preventScroll: true })
  }

  return (
    <Link href="/" aria-label={label} className={className} onClick={onClick}>
      <Img src={theme === 'light' ? logoLight : logoDark} alt="" unoptimized />
    </Link>
  )
}
