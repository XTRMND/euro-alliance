import styles from './FigureCard.module.css'

// Figure card (259:410): a key figure and a short uppercase label, in «в цифри» rows. Only
// official numbers. The number is navy, not Figma's sand: sand text on white is 2.3:1 and fails
// WCAG even at this size (CLAUDE.md § 5, open item in § 12). A figure in words («десетки
// хиляди», 194:2839) is set smaller, as in Figma.

export function FigureCard({ figure, label }: { figure: string; label: string }) {
  const words = /\p{L}{3,}/u.test(figure)
  return (
    <div className={styles.card}>
      <p className={[styles.figure, words && styles.words].filter(Boolean).join(' ')}>{figure}</p>
      <p className={styles.label}>{label}</p>
    </div>
  )
}
