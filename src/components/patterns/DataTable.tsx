import type { ReactNode } from 'react'
import styles from './DataTable.module.css'

// Data table (259:621): a real <table> with an uppercase header row, rows from the CMS and an
// empty state. Below 768px the header hides and each row stacks with its labels, as the Figma
// description says. The explicit roles keep the table semantics when CSS changes the display.

export type Column<Row> = {
  key: string
  label: string
  /** Fixed width from 768px up, e.g. '150px'; one column should flex. */
  width?: string
  cell: (row: Row) => ReactNode
}

type DataTableProps<Row> = {
  caption: string
  columns: Column<Row>[]
  rows: Row[]
  rowKey: (row: Row) => string
  empty: { title: string; text?: string }
}

export function DataTable<Row>({ caption, columns, rows, rowKey, empty }: DataTableProps<Row>) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table} role="table">
        <caption className="sr-only">{caption}</caption>
        <thead className={styles.head} role="rowgroup">
          <tr role="row">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                role="columnheader"
                style={column.width ? { width: column.width } : undefined}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.length === 0 ? (
            <tr role="row">
              <td colSpan={columns.length} role="cell" className={styles.empty}>
                <p className={styles.emptyTitle}>{empty.title}</p>
                {empty.text && <p className={styles.emptyText}>{empty.text}</p>}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} role="row" className={styles.row}>
                {columns.map((column) => (
                  <td key={column.key} role="cell" data-label={column.label}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
