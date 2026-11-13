'use client'

import { Link } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  type PriceFilter,
  type PriceRow,
  type PriceValues,
  isDirty,
  matchesFilter,
  priceChange,
  priceFilterLabels,
  priceFilters,
  priceSections,
  sectionCount,
  unsavedLabel,
} from '@/lib/admin-prices'
import list from './list.module.css'
import styles from './prices.module.css'

// The «Цени» screen's table (370:1398): each row's price, regular price, label and note are typed
// in place; a changed row is marked «Незаписано» and nothing is stored until «Запази промените».
// The chips filter the rows in the browser, so what's typed stays while they change.

type PricesEditorProps = { rows: PriceRow[]; locale: 'bg' | 'en'; courseBase: string }

const columns: { field: keyof PriceValues; label: string; money?: boolean }[] = [
  { field: 'price', label: 'Цена', money: true },
  { field: 'regularPrice', label: 'Редовна цена', money: true },
  { field: 'label', label: 'Етикет' },
  { field: 'note', label: 'Бележка' },
]

export function PricesEditor({ rows, locale, courseBase }: PricesEditorProps) {
  const router = useRouter()
  const [typed, setTyped] = useState<Record<string, PriceValues>>({})
  const [filter, setFilter] = useState<PriceFilter>('all')
  const [closed, setClosed] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<
    Record<string, { field: keyof PriceValues; message: string }>
  >({})
  const [failed, setFailed] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const valuesOf = (row: PriceRow) => typed[row.key] ?? row.values
  const dirty = rows.filter((row) => isDirty(row, valuesOf(row)))

  // Leaving with unsaved prices asks first.
  const unsaved = dirty.length > 0
  useEffect(() => {
    if (!unsaved) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [unsaved])

  // «Промени в «Цени»» on a course opens here at that course's rows.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'center' })
  }, [])

  const change = (row: PriceRow, field: keyof PriceValues, value: string) => {
    setTyped((current) => ({ ...current, [row.key]: { ...valuesOf(row), [field]: value } }))
    setErrors((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => key !== row.key)),
    )
  }
  const cancel = () => {
    setTyped({})
    setErrors({})
    setFailed(null)
  }

  const save = async () => {
    const changes = dirty.map((row) => ({ row, change: priceChange(row, valuesOf(row)) }))
    const wrong: typeof errors = {}
    for (const { row, change: c } of changes)
      if (c.kind === 'error') wrong[row.key] = { field: c.field, message: c.message }
    setErrors(wrong)
    setFailed(null)
    if (Object.keys(wrong).length) {
      // Show the rows that need a fix, whatever chip is on.
      setFilter('all')
      setClosed({})
      return
    }
    setSaving(true)
    const done: string[] = []
    try {
      for (const { row, change: c } of changes) {
        if (c.kind === 'error') continue
        const path = c.kind === 'delete' ? `prices/${c.id}` : c.id ? `prices/${c.id}` : 'prices'
        const response = await fetch(`/api/${path}?locale=${locale}`, {
          method: c.kind === 'delete' ? 'DELETE' : c.id ? 'PATCH' : 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: c.kind === 'save' ? JSON.stringify(c.data) : undefined,
        })
        if (!response.ok) throw new Error(row.title)
        done.push(row.key)
      }
    } catch (error) {
      setFailed(
        `Цената на «${(error as Error).message}» не се запази. Опитайте пак: останалите промени са още тук.`,
      )
    } finally {
      setSaving(false)
      // The saved rows start over from what's stored, read again; the others keep what's typed.
      setTyped((current) =>
        Object.fromEntries(Object.entries(current).filter(([key]) => !done.includes(key))),
      )
      router.refresh()
    }
  }

  const shown = rows.filter((row) => matchesFilter(row, valuesOf(row), filter))
  const sections = priceSections(shown)

  return (
    <div className={list.screen} data-admin="list">
      <header className={list.header}>
        <div className={list.titles}>
          <h1 className={list.title}>Цени</h1>
          <p className={styles.lead}>
            Цените се пазят отделно от курсовете. Всеки курс има основна цена; група може да има
            своя (напр. промоция).
          </p>
        </div>
        <p className={styles.status} role="status">
          {unsaved && (
            <span className={list.pill} data-tone="sand">
              {unsavedLabel(dirty.length)}
            </span>
          )}
        </p>
        <button
          type="button"
          className={list.secondary}
          disabled={!unsaved || saving}
          onClick={cancel}
        >
          Отмени
        </button>
        <button
          type="button"
          className={`${list.primary} ${styles.action}`}
          disabled={!unsaved || saving}
          onClick={save}
        >
          Запази промените
        </button>
      </header>

      <div className={list.filters} role="group" aria-label="Покажи">
        {priceFilters.map((value) => (
          <button
            key={value}
            type="button"
            className={`${list.chip} ${styles.chip}`}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {priceFilterLabels[value]}
          </button>
        ))}
      </div>

      {failed && (
        <p role="alert" className={styles.failed}>
          {failed}
        </p>
      )}

      <div className={list.card} data-admin="card">
        <div className={list.scroll}>
          <table className={`${list.table} ${styles.table}`}>
            <colgroup>
              <col />
              <col style={{ width: 176 }} />
              <col style={{ width: 136 }} />
              <col style={{ width: 136 }} />
              <col style={{ width: 156 }} />
              <col style={{ width: 208 }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Курс</th>
                <th scope="col">Важи за</th>
                {columns.map((column) => (
                  <th key={column.field} scope="col">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            {sections.map((section) => {
              const open = !closed[section.key]
              return (
                <tbody key={section.key}>
                  <tr className={list.group}>
                    <td colSpan={6}>
                      <button
                        type="button"
                        className={list.groupButton}
                        aria-expanded={open}
                        onClick={() =>
                          setClosed((current) => ({ ...current, [section.key]: open }))
                        }
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                          <path
                            d={open ? 'M4 6l4 4 4-4' : 'M6 4l4 4-4 4'}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {section.label}
                        <span className={list.pill} data-tone="neutral">
                          {sectionCount(section.rows, valuesOf)}
                        </span>
                      </button>
                    </td>
                  </tr>
                  {open &&
                    section.rows.map((row) => {
                      const values = valuesOf(row)
                      const changed = isDirty(row, values)
                      const error = errors[row.key]
                      const name = `${row.title}, ${row.scope}`
                      return (
                        <tr
                          key={row.key}
                          id={row.group ? undefined : `course-${row.course}`}
                          className={changed ? `${styles.row} ${styles.changed}` : styles.row}
                        >
                          <td>
                            <span className={list.titleCell}>
                              <Link
                                href={`${courseBase}/${row.course}`}
                                className={`${list.rowLink} ${styles.course}`}
                              >
                                {row.title}
                              </Link>
                              {changed && (
                                <span className={list.pill} data-tone="sand">
                                  Незаписано
                                </span>
                              )}
                            </span>
                          </td>
                          <td>{row.scope}</td>
                          {row.free ? (
                            <>
                              <td colSpan={3}>
                                <span className={list.pill}>Безплатно</span>
                              </td>
                              <td className={list.muted}>{row.values.note}</td>
                            </>
                          ) : (
                            columns.map((column) => {
                              const invalid = error?.field === column.field
                              return (
                                <td key={column.field}>
                                  <span className={styles.input} data-money={column.money}>
                                    <input
                                      type="text"
                                      inputMode={column.money ? 'decimal' : undefined}
                                      value={values[column.field]}
                                      placeholder="—"
                                      aria-label={`${column.label}: ${name}`}
                                      aria-invalid={invalid || undefined}
                                      aria-describedby={invalid ? `error-${row.key}` : undefined}
                                      onChange={(e) => change(row, column.field, e.target.value)}
                                    />
                                    {column.money && (
                                      <span aria-hidden="true">
                                        {row.currency === 'BGN' ? 'лв.' : '€'}
                                      </span>
                                    )}
                                  </span>
                                  {invalid && (
                                    <span id={`error-${row.key}`} className={styles.error}>
                                      {error.message}
                                    </span>
                                  )}
                                </td>
                              )
                            })
                          )}
                        </tr>
                      )
                    })}
                </tbody>
              )
            })}
          </table>
          {sections.length === 0 && (
            <p className={list.empty}>
              {rows.length === 0
                ? 'Още няма курсове: цените се задават на курс или на негова група.'
                : filter === 'promotions'
                  ? 'Няма промоции: промоция е цена с редовна цена до нея.'
                  : 'Тук няма курсове.'}
            </p>
          )}
        </div>
      </div>

      <p className={styles.info}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="9" cy="9" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 8v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="9" cy="5.6" r="0.9" fill="currentColor" />
        </svg>
        Цените са в евро. При промоция редовната цена се показва зачертана до новата. Безплатните
        курсове показват „Безплатно“.
      </p>
    </div>
  )
}
