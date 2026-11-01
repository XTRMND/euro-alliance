import type { ReactNode } from 'react'
import { Breadcrumb } from './Breadcrumb'
import { withHighlight } from './Highlight'
import styles from './PageHero.module.css'

// Page hero (80:895): breadcrumb, the H1 with one highlighted phrase, a lead, and optional art
// beside it (the course-page hero puts the Course visual there).

type PageHeroProps = {
  breadcrumb: { label: string; href?: string }[]
  title: string
  highlight?: string | null
  lead?: string | null
  aside?: ReactNode
  className?: string
}

export function PageHero({ breadcrumb, title, highlight, lead, aside, className }: PageHeroProps) {
  return (
    <div className={[styles.hero, className].filter(Boolean).join(' ')}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <Breadcrumb items={breadcrumb} />
          <h1 className={styles.title}>{withHighlight(title, highlight)}</h1>
          {lead && <p className={styles.lead}>{lead}</p>}
        </div>
        {aside}
      </div>
    </div>
  )
}
