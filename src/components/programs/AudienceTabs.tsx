import Link from 'next/link'
import styles from './AudienceTabs.module.css'

// Audience tabs (129:321): the language's adults and students pages. They're links (each page is
// its own URL); the current one is marked. Hidden when the language has one audience (Russian).

type AudienceTabsProps = {
  label: string
  tabs: { label: string; href: string; current: boolean }[]
}

export function AudienceTabs({ label, tabs }: AudienceTabsProps) {
  if (tabs.length < 2) return null
  return (
    <nav aria-label={label} className={styles.tabs}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          prefetch={false}
          aria-current={tab.current ? 'page' : undefined}
          className={styles.tab}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
