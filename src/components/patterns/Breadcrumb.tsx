import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { routes } from '@/lib/routes'
import styles from './Breadcrumb.module.css'

// Breadcrumb (80:897): «Начало / Курсове». The current page is the last item, not a link.

type BreadcrumbProps = {
  /** The pages after «Начало»; the last one is the current page. */
  items: { label: string; href?: string }[]
  className?: string
}

export async function Breadcrumb({ items, className }: BreadcrumbProps) {
  const t = await getTranslations('breadcrumb')
  const trail = [{ label: t('home'), href: routes.home() }, ...items]

  return (
    <nav aria-label={t('label')} className={className}>
      <ol className={styles.trail}>
        {trail.map((item, i) => {
          const current = i === trail.length - 1
          return (
            <li key={i} className={styles.item}>
              {current || !item.href ? (
                <span aria-current={current ? 'page' : undefined}>{item.label}</span>
              ) : (
                <Link href={item.href} prefetch={false} className={styles.link}>
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
