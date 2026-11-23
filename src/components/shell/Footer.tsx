import { Img } from '@/components/ui/Img'
import { getTranslations } from 'next-intl/server'
import { currentYear } from '@/lib/format'
import { routes } from '@/lib/routes'
import type { SiteNavigation } from '@/lib/nav-links'
import type { Media, Site } from '@/payload-types'
import { CookieSettingsButton } from './CookieSettingsButton'
import styles from './Footer.module.css'
import { LogoLink } from './LogoLink'
import { NavLink } from './NavLink'

// Footer (79:887) and Footer Mobile (114:311). The text under the logo and the EU funding notice
// are the client's, from «Навигация» → «Долна част» (v0.27.0): each shows only when it's filled
// in. The notice's official logo strip is shown exactly as uploaded, on white.

type FooterProps = {
  navigation: SiteNavigation
  site: Site
}

export async function Footer({ navigation, site }: FooterProps) {
  const t = await getTranslations('footer')
  const tHeader = await getTranslations('header')
  const { footerNote, funding } = navigation
  const logos =
    funding?.logos && typeof funding.logos === 'object' ? (funding.logos as Media) : null

  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <div className={styles.columns}>
          <div className={styles.brand}>
            <LogoLink theme="dark" label={tHeader('logoLabel')} className={styles.logo} />
            {footerNote && <p className={styles.licence}>{footerNote}</p>}
          </div>

          <nav aria-label={t('navLabel')} className={styles.nav}>
            {navigation.footer.map((column) => (
              <div key={column.id} className={styles.column}>
                <h2 className={styles.heading}>{column.heading}</h2>
                <ul className={styles.links}>
                  {column.links.map((link) => (
                    <li key={link.id}>
                      <NavLink href={link.href} placement="footer" className={styles.link}>
                        {link.icon === 'facebook' ? (
                          <>
                            <span className={styles.icon} aria-hidden="true">
                              f
                            </span>
                            <span className={styles.iconLabel}>{link.label}</span>
                          </>
                        ) : (
                          link.label
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {funding?.statement && (
          <div className={styles.funding}>
            {logos?.url && (
              <div className={styles.fundingLogos}>
                <Img
                  src={logos.url}
                  alt={logos.alt}
                  width={logos.width ?? 176}
                  height={logos.height ?? 44}
                  unoptimized
                />
              </div>
            )}
            <p className={styles.statement}>{funding.statement}</p>
          </div>
        )}
      </div>

      <div className={styles.credit}>
        <div className={styles.legal}>
          {site.legalName && (
            <span className={styles.copyright}>
              {t('copyright', { year: currentYear(), company: site.legalName })}
            </span>
          )}
          <NavLink href={routes.privacy()} className={styles.legalLink}>
            {t('privacy')}
          </NavLink>
          <CookieSettingsButton label={t('cookieSettings')} className={styles.legalLink} />
        </div>
        <p className={styles.madeBy}>
          {t.rich('credit', {
            link: (chunks) => (
              <a href="https://xtrmnd.com" target="_blank" rel="noopener" className={styles.studio}>
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>
    </footer>
  )
}
