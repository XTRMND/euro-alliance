import styles from './Timeline.module.css'

// Timeline (189:361): years on navy bubbles along a dashed sand rail, the title and the text
// under each. One column without the rail on a phone. The hover turns the bubble the other way
// (decoration only: the items aren't links).

export function Timeline({
  items,
}: {
  items: { year: string; title: string; text?: string | null; id?: string | null }[]
}) {
  return (
    <ol className={styles.timeline}>
      {items.map((item, i) => (
        <li key={item.id ?? i} className={styles.item}>
          <span className={styles.year}>{item.year}</span>
          <h3 className={styles.title}>{item.title}</h3>
          {item.text && <p className={styles.text}>{item.text}</p>}
        </li>
      ))}
    </ol>
  )
}
