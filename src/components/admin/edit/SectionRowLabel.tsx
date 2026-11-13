'use client'

import { useRowLabel } from '@payloadcms/ui'
import { sectionKind, sectionSummary } from '@/lib/admin-sections'
import styles from './sections.module.css'

// A section's row in a programme («Admin · 08 Програма», 373:1949): the kind's little icon, its
// name and one line of what it holds («4 карти · Групово обучение, …»), never «Item 01».

export function SectionRowLabel() {
  const { data, rowNumber } = useRowLabel<{ blockType?: string }>()
  const kind = sectionKind(data?.blockType)
  if (!kind) return <span>{String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>
  return (
    <span className={styles.row}>
      <span className={styles.icon} data-icon={kind.icon} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className={styles.text}>
        <span className={styles.name}>{kind.name}</span>
        <span className={styles.summary}>{sectionSummary(data?.blockType, data)}</span>
      </span>
    </span>
  )
}
