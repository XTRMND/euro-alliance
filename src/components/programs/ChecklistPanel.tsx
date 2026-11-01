import { List } from '@/components/patterns/List'
import styles from './ChecklistPanel.module.css'

// The navy checklist under the farmers' Index cards (246:3916): a title and List rows with boxes
// on navy («Документи преди старта на обучението»), two columns from 1024px. The boxes are a
// checklist look, not form controls.
export function ChecklistPanel({ title, items }: { title?: string | null; items: string[] }) {
  return (
    <div className={styles.panel}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <List marker="box" items={items.map((text) => ({ text }))} className={styles.list} />
    </div>
  )
}
