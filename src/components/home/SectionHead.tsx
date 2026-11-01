import type { ReactNode } from 'react'
import { SectionHeading } from '@/components/patterns/SectionHeading'
import { Button } from '@/components/ui/Button'
import styles from './SectionHead.module.css'

// A homepage section's title with its «Всички …» link on the right (48:228, 52:268). The link's
// second word is hidden on small screens («Всички» in the mobile frames) but stays in its name.

type SectionHeadProps = {
  title: string
  id: string
  link?: { href: string; label: (long: (chunks: ReactNode) => ReactNode) => ReactNode }
}

export function SectionHead({ title, id, link }: SectionHeadProps) {
  return (
    <div className={styles.head}>
      <SectionHeading title={title} id={id} />
      {link && (
        <Button href={link.href} variant="link" className={styles.link}>
          {link.label((chunks) => (
            <span className={styles.long}>{chunks}</span>
          ))}
        </Button>
      )}
    </div>
  )
}
