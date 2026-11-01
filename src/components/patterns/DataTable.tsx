import type { ReactNode } from 'react'
import styles from './DataTable.module.css'

// Data table (259:621): a real <table> with an uppercase header row, rows from the CMS and an
// empty state. Below 768px the header hides and each row stacks with its labels, as the Figma
// description says (the legal pages' table, 226:2834, stacks without them). The explicit roles
// keep the table semantics when CSS changes the display.

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
  /** Below 768px, each value with its column's label (the default) or on its own. */
  stackLabels?: boolean
}

export function DataTable<Row>({
  caption,
  columns,
  rows,
  rowKey,
  empty,
  stackLabels = true,
}: DataTableProps<Row>) {
  return (
    <div className={[styles.wrap, !stackLabels && styles.plain].filter(Boolean).join(' ')}>
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
