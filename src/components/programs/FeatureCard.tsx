import styles from './FeatureCard.module.css'

// Feature card (129:348): a number chip, the title and a line. It turns navy on hover, as in
// Style=Highlight (docs/motion.md § 5); it has no link in Figma.

export function FeatureCard({
  index,
  title,
  text,
}: {
  index: number
  title: string
  text?: string | null
}) {
  return (
    <article className={styles.card}>
      <span className={styles.chip}>{String(index).padStart(2, '0')}</span>
      <h3 className={styles.title}>{title}</h3>
      {text && <p className={styles.text}>{text}</p>}
    </article>
  )
}
