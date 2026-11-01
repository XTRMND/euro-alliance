'use client'

import { useEffect } from 'react'
import { type AnalyticsEvents, track } from '@/lib/analytics'

/** Reports `course_view` once per page view (docs/measurement.md). Renders nothing. */
export function TrackCourseView(params: AnalyticsEvents['course_view']) {
  const { course, language, audience, level } = params
  useEffect(() => {
    track('course_view', { course, language, audience, level })
  }, [course, language, audience, level])
  return null
}
