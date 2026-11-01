import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import tornScrap from '@/assets/torn-scrap.svg'
import { Highlight } from '@/components/patterns/Highlight'
import { SearchField } from '@/components/search/SearchField'
import { Button } from '@/components/ui/Button'
import { Tape } from '@/components/visuals/Tape'
import { routes } from '@/lib/routes'
import { HandFontPreload } from '@/styles/font-hand'
import landing from '@/styles/landing.module.css'
import styles from './not-found.module.css'

// 404 (219:3127 / 226:3254): «Тази страница я няма», a line on why, the search field and four
// places to start, beside a torn scrap with «404» and «страницата липсва» by hand (above the copy
// on a phone). Served with a real 404 status for unknown addresses and missing content.

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notFound')
  return { title: `${t('title')} ${t('highlight')}` }
}

export default async function NotFound() {
  const t = await getTranslations('notFound')
  const links = [
    { href: routes.courses(), label: t('links.courses') },
    { href: routes.translations(), label: t('links.translations') },
    { href: routes.about(), label: t('links.about') },
    { href: routes.contact(), label: t('links.contact') },
  ]
  return (
    <div className={styles.page}>
      <HandFontPreload />
      <div className={styles.copy}>
        <h1 className={[styles.title, landing.rise].join(' ')}>
          {t('title')} <Highlight>{t('highlight')}</Highlight>
        </h1>
        <p className={[styles.lead, landing.copy].join(' ')}>{t('text')}</p>
        <SearchField className={[styles.field, landing.copy].join(' ')} />
        <nav aria-label={t('linksLabel')} className={landing.copy}>
          <ul className={styles.links}>
            {links.map((link) => (
              <li key={link.href}>
                <Button href={link.href} variant="link">
                  {link.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={[styles.scrap, landing.art].join(' ')} aria-hidden="true">
        <div className={styles.paper}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Figma's torn paper, an SVG */}
          <img src={tornScrap.src} alt="" className={styles.paperImage} />
          <span className={styles.rules} />
        </div>
        <Tape className={styles.tape} />
        <span className={styles.code}>{t('code')}</span>
        <span className={styles.note}>{t('note')}</span>
      </div>
    </div>
  )
}
