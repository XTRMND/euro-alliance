import { getTranslations } from 'next-intl/server'
import styles from './SkipLink.module.css'

/** The first thing a keyboard user reaches: jumps past the header to <main>. */
export async function SkipLink() {
  const t = await getTranslations('header')
  return (
    <a href="#main" className={styles.skip}>
      {t('skipLink')}
    </a>
  )
}
