import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import styles from './page.module.css'
import { TokenValue } from './TokenValue'

// Reference of every design token (PR 3), for comparing against Figma. Development only: it is
// served when DEV_PAGES=true and never indexed. Specimen text is copy from the Figma file.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Дизайн токени',
  robots: { index: false, follow: false },
}

const colours = [
  'brand-primary',
  'brand-primary-strong',
  'brand-primary-subtle',
  'brand-accent',
  'brand-accent-subtle',
  'bg-page',
  'bg-subtle',
  'bg-warm',
  'text-primary',
  'text-muted',
  'text-on-brand',
  'border-default',
]

const typeStyles: { token: string; sample: string; caps?: boolean }[] = [
  { token: 'display', sample: 'Езиково и професионално обучение' },
  { token: 'h2', sample: 'Заглавие на секцията' },
  { token: 'h3', sample: 'Английски език B2' },
  { token: 'figure', sample: '29' },
  {
    token: 'lead',
    sample:
      'Езикови курсове, професионално обучение, квалификации по програми на МОН и преводи с легализация.',
  },
  {
    token: 'body',
    sample: 'Малки групи с преподавател на живо, присъствено в Пловдив или онлайн.',
  },
  {
    token: 'small',
    sample: 'Образователен бизнес център ЕВРО-АЛИАНС, Пловдив 4003, ул. Самара №13',
  },
  { token: 'label', sample: 'Виж предстоящите курсове' },
  { token: 'kicker', sample: 'Курсове и обучения', caps: true },
]

const radii = ['button', 'image', 'card']
const shadows = ['card', 'card-hover', 'paper', 'photo', 'bubble']
const motion = [
  'motion-button',
  'motion-card',
  'motion-news',
  'motion-landing',
  'ease-out',
  'landing-rise',
  'landing-stagger',
  'strip-height',
  'strip-speed',
]

export default function TokensPage() {
  if (process.env.DEV_PAGES !== 'true') notFound()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Дизайн токени</h1>

      <section aria-labelledby="colours" className={styles.section}>
        <h2 id="colours" className={styles.heading}>
          Цветове
        </h2>
        <ul className={styles.grid}>
          {colours.map((name) => (
            <li key={name} className={styles.colour}>
              <span
                aria-hidden="true"
                className={styles.swatch}
                style={{ background: `var(--color-${name})` }}
              />
              <code>--color-{name}</code>
              <TokenValue name={`--color-${name}`} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="type" className={styles.section}>
        <h2 id="type" className={styles.heading}>
          Типография
        </h2>
        <ul className={styles.list}>
          {typeStyles.map(({ token, sample, caps }) => (
            <li key={token} className={styles.typeRow}>
              <code>--type-{token}</code>
              <p
                className={caps ? styles.caps : undefined}
                style={{ font: `var(--type-${token})` }}
              >
                {sample}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="shape" className={styles.section}>
        <h2 id="shape" className={styles.heading}>
          Форма и сенки
        </h2>
        <ul className={styles.grid}>
          {radii.map((name) => (
            <li key={name} className={styles.shapeItem}>
              <span
                aria-hidden="true"
                className={styles.shape}
                style={{ borderRadius: `var(--radius-${name})` }}
              />
              <code>--radius-{name}</code>
              <TokenValue name={`--radius-${name}`} />
            </li>
          ))}
          {shadows.map((name) => (
            <li key={name} className={styles.shapeItem}>
              <span
                aria-hidden="true"
                className={styles.shape}
                style={{ boxShadow: `var(--shadow-${name})` }}
              />
              <code>--shadow-{name}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="layout" className={styles.section}>
        <h2 id="layout" className={styles.heading}>
          Оформление и движение
        </h2>
        <dl className={styles.values}>
          {['page-max', 'content-max', 'page-margin', 'space-section', 'gap-cards', ...motion].map(
            (name) => (
              <div key={name}>
                <dt>
                  <code>--{name}</code>
                </dt>
                <dd>
                  <TokenValue name={`--${name}`} />
                </dd>
              </div>
            ),
          )}
        </dl>
      </section>
    </div>
  )
}
