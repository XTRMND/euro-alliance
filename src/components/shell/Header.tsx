import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/Button'
import { routes } from '@/lib/routes'
import type { Navigation, Office } from '@/payload-types'
import styles from './Header.module.css'
import { LogoLink } from './LogoLink'
import { MobileMenu } from './MobileMenu'
import { NavLink } from './NavLink'

// Header (79:784) from 1024px up; Header Mobile (114:295) with the menu below. White with a torn
// bottom edge and a soft navy shadow. «EN» stays hidden until English exists.

type HeaderProps = {
  navigation: Navigation
  office?: Office
}

export async function Header({ navigation, office }: HeaderProps) {
  const t = await getTranslations('header')
  const { left = [], right = [] } = navigation.header ?? {}

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <nav aria-label={t('navLabel')} className={styles.desktopNav}>
          <ul className={styles.links}>
            {left?.map((link) => (
              <li key={link.id}>
                <NavLink href={link.href} className={styles.link}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <MobileMenu
          className={styles.menu}
          links={navigation.menu ?? []}
          labels={{
            open: t('menuOpen'),
            close: t('menuClose'),
            nav: t('navLabel'),
            logo: t('logoLabel'),
            cta: t('cta'),
          }}
          phone={office?.phones?.[0]?.number}
          email={office?.emails?.[0]?.email}
        />

        <LogoLink theme="light" label={t('logoLabel')} className={styles.logo} />

        <div className={styles.end}>
          <ul className={styles.links}>
            {right?.map((link) => (
              <li key={link.id}>
                <NavLink href={link.href} className={styles.link}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Button href={routes.contact()}>{t('cta')}</Button>
        </div>
      </div>
    </header>
  )
}
