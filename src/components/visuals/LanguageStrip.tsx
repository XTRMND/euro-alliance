import { getTranslations } from 'next-intl/server'
import styles from './LanguageStrip.module.css'
import { Marquee } from './Marquee'

// Marquee / Languages (63:524): the seven languages in their own names on a navy strip, white and
// sand in turn, with sand dots between them. Each name carries its language for screen readers.

const languages = [
  ['english', 'en'],
  ['german', 'de'],
  ['french', 'fr'],
  ['spanish', 'es'],
  ['italian', 'it'],
  ['russian', 'ru'],
  ['bulgarian', 'bg'],
] as const

export async function LanguageStrip({ className }: { className?: string }) {
  const t = await getTranslations()

  return (
    <Marquee
      className={[styles.strip, className].filter(Boolean).join(' ')}
      labels={{ pause: t('common.pauseAnimation'), play: t('common.playAnimation') }}
    >
      {languages.map(([key, lang]) => (
        <li key={key} lang={lang} className={styles.item}>
          {t(`languageStrip.${key}`)}
        </li>
      ))}
    </Marquee>
  )
}
