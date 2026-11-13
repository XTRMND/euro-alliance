'use client'

import { Link } from '@payloadcms/ui'
import { useState } from 'react'
import bulgarian from '@/assets/flags/bulgarian.svg'
import english from '@/assets/flags/english.svg'
import french from '@/assets/flags/french.svg'
import german from '@/assets/flags/german.svg'
import italian from '@/assets/flags/italian.svg'
import russian from '@/assets/flags/russian.svg'
import spanish from '@/assets/flags/spanish.svg'
import { type CourseGroupRows, coursesLabel } from '@/lib/admin-courses'
import styles from './list.module.css'

// The table of «Admin · 02 Езикови курсове · Курсове» (356:283): the header stays put, a group
// row opens and closes its courses, and a group without courses starts closed. The flags are the
// site's own stickers (their SVGs, not the site's component: its styles stay out of the admin).

const flags = { english, german, french, italian, spanish, russian, bulgarian }

const Chevron = ({ open }: { open: boolean }) => (
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
)

type CourseGroupsProps = { groups: CourseGroupRows[]; editBase: string; empty: string }

export function CourseGroups({ groups, editBase, empty }: CourseGroupsProps) {
  const [toggled, setToggled] = useState<Record<string, boolean>>({})
  const isOpen = (group: CourseGroupRows) => toggled[group.key] ?? group.rows.length > 0
  const grouped = groups.length !== 1 || groups[0].label !== ''
  const total = groups.reduce((sum, group) => sum + group.rows.length, 0)

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <colgroup>
          <col />
          <col style={{ width: 246 }} />
          <col style={{ width: 106 }} />
          <col style={{ width: 156 }} />
          <col style={{ width: 86 }} />
          <col style={{ width: 160 }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Заглавие</th>
            <th scope="col">Аудитория и формат</th>
            <th scope="col">Ниво</th>
            <th scope="col">Начало</th>
            <th scope="col">Места</th>
            <th scope="col">Цена</th>
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.key}>
            {grouped && (
              <tr className={styles.group}>
                <td colSpan={6}>
                  <button
                    type="button"
                    className={styles.groupButton}
                    aria-expanded={isOpen(group)}
                    disabled={group.rows.length === 0}
                    onClick={() =>
                      setToggled((current) => ({ ...current, [group.key]: !isOpen(group) }))
                    }
                  >
                    <Chevron open={isOpen(group)} />
                    {group.language && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={flags[group.language].src} alt="" width={24} height={24} />
                    )}
                    {group.label}
                    <span className={styles.pill} data-tone="neutral">
                      {coursesLabel(group.rows.length)}
                    </span>
                  </button>
                </td>
              </tr>
            )}
            {(!grouped || isOpen(group)) &&
              group.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className={styles.titleCell}>
                      <Link href={`${editBase}/${row.id}`} className={styles.rowLink}>
                        {row.title}
                      </Link>
                      {row.draft && (
                        <span className={styles.pill} data-tone="sand">
                          Чернова
                        </span>
                      )}
                    </span>
                  </td>
                  <td>{row.tags || <Dash />}</td>
                  <td>{row.level ? <span className={styles.pill}>{row.level}</span> : <Dash />}</td>
                  <td>
                    {row.start ?? <Dash label="няма насрочена дата" />}
                    {row.running && <span className={styles.small}>в ход</span>}
                  </td>
                  <td>{row.seats ?? <Dash label="не е зададено" />}</td>
                  <td>
                    {row.price ? (
                      <span className={styles.strong}>{row.price}</span>
                    ) : (
                      <Dash label="няма цена" />
                    )}
                    {row.priceLabel && <span className={styles.small}>{row.priceLabel}</span>}
                  </td>
                </tr>
              ))}
          </tbody>
        ))}
      </table>
      {total === 0 && !grouped && <p className={styles.empty}>{empty}</p>}
    </div>
  )
}

/** «—», said as what's missing. */
function Dash({ label }: { label?: string }) {
  return (
    <span className={styles.muted}>
      <span aria-hidden="true">—</span>
      {label && <span className={styles.srOnly}>{label}</span>}
    </span>
  )
}
