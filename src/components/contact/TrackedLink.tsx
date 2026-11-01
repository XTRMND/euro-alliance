'use client'

import type { ComponentProps } from 'react'
import { type AnalyticsEvents, track } from '@/lib/analytics'

type Tracked =
  | { event: 'tel_click'; params: AnalyticsEvents['tel_click'] }
  | { event: 'mailto_click'; params: AnalyticsEvents['mailto_click'] }

/** A tel: or mailto: link that reports its click (docs/measurement.md). */
export function TrackedLink({ event, params, onClick, ...link }: ComponentProps<'a'> & Tracked) {
  return (
    <a
      {...link}
      onClick={(click) => {
        if (event === 'tel_click') track('tel_click', params as AnalyticsEvents['tel_click'])
        else track('mailto_click', params as AnalyticsEvents['mailto_click'])
        onClick?.(click)
      }}
    />
  )
}
