import type { SerializedListItemNode } from '@payloadcms/richtext-lexical'
import { type JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'
import { Button } from '@/components/ui/Button'
import { type Column, DataTable } from '@/components/patterns/DataTable'
import { List } from '@/components/patterns/List'
import { hrefOf } from '@/lib/destinations'
import type { LegalPage } from '@/payload-types'
import styles from './LegalPage.module.css'

// A legal section's text (218:2888): paragraphs, numbered lists as List rows (numbers navy, not
// Figma's sand: CLAUDE.md § 12), links, the table block (224:3350) and the link button block.

type Body = NonNullable<LegalPage['sections']>[number]['body']

type TableBlock = {
  columns?: { label: string; id?: string }[]
  rows?: { cells?: { text: string; id?: string }[]; id?: string }[]
}

type LinkBlock = { label: string; destination: string }

type Row = NonNullable<TableBlock['rows']>[number]

/** Figma's column widths for the cookie table, 150 for the first and 130 for the last of three,
    plus the cell's 16px gap. */
const columnWidth = (i: number, count: number) =>
  i === 0 ? '166px' : count > 2 && i === count - 1 ? '146px' : undefined

export function LegalText({ body, caption }: { body: Body; caption: string }) {
  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    list: (args) => {
      const { node, nodesToJSX } = args
      if (node.listType !== 'number') {
        const Default = defaultConverters.list
        return typeof Default === 'function' ? Default(args) : null
      }
      const items = node.children.map((item) => ({
        text: (
          <span className={styles.itemText}>
            {nodesToJSX({ nodes: (item as SerializedListItemNode).children })}
          </span>
        ),
      }))
      return <List marker="number" items={items} className={styles.list} />
    },
    blocks: {
      legalTable: ({ node }: { node: { fields: TableBlock } }) => {
        const { columns: labels = [], rows = [] } = node.fields
        const columns: Column<Row>[] = labels.map((column, i) => ({
          key: column.id ?? String(i),
          label: column.label,
          width: columnWidth(i, labels.length),
          cell: (row) => (
            <span className={i === 0 ? styles.cellFirst : styles.cell}>{row.cells?.[i]?.text}</span>
          ),
        }))
        return (
          <DataTable
            caption={caption}
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id ?? String(rows.indexOf(row))}
            empty={{ title: '' }}
            stackLabels={false}
          />
        )
      },
      legalLink: ({ node }: { node: { fields: LinkBlock } }) => {
        const href = hrefOf(node.fields.destination)
        if (!href) return null
        return (
          <Button href={href} variant="link" className={styles.button}>
            {node.fields.label}
          </Button>
        )
      },
    },
  })

  return body ? <RichText data={body} converters={converters} disableContainer /> : null
}
