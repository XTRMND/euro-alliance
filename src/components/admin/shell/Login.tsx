import logoDark from '@/assets/logo-dark.svg'
import styles from './login.module.css'

// The login screen (Figma «Admin · 05 Вход», 360:1120): the navy panel on the left and the card's
// heading come before Payload's form; the note comes after it. Payload's form keeps its fields
// and its «Забравена парола?» link; the styles are in custom.css (the login section).

export function BeforeLogin() {
  return (
    <>
      <div className={styles.panel}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoDark.src} alt="Евро Алианс" width={210} height={59} className={styles.logo} />
        <div className={styles.middle}>
          <p className={styles.hand}>добре дошли!</p>
          <p className={styles.title}>
            Управление на <span className={styles.highlight}>съдържанието</span>
          </p>
          <p className={styles.lead}>
            Курсове, програми, новини и страници на euro-alliance.net — на едно място.
          </p>
        </div>
        <p className={styles.company}>ЕВРО-АЛИАНС ООД · от 1999 г.</p>
      </div>
      <h1 className={styles.heading}>Вход</h1>
      <p className={styles.intro}>Влезте с имейла и паролата си.</p>
    </>
  )
}

export function AfterLogin() {
  return <p className={styles.note}>Проблем с достъпа? Пишете на администратора на сайта.</p>
}
