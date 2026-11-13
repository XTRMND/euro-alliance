'use client'

import { Link, useDocumentInfo, useLocale } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import { formatDateLong, formatPrice } from '@/lib/format'
import type { Group, Price } from '@/payload-types'
import styles from './groups.module.css'

// The «Цени» tab of a course: what the course costs, read from «Цени» (the base price and each
// group's own), with the way there. Prices are edited in «Цени», not here.

export function PricesSummary() {
  const { id } = useDocumentInfo()
  const locale = useLocale()
  const [prices, setPrices] = useState<Price[] | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/prices?where[course][equals]=${id}&depth=1&limit=100&locale=${locale.code}`, {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((result: { docs: Price[] }) => setPrices(result.docs))
      .catch(() => setPrices([]))
  }, [id, locale.code])

  if (!id) return <p className={styles.hint}>Запазете курса, за да му зададете цена.</p>
  if (!prices) return <p className={styles.hint}>Зареждане…</p>

  return (
    <div>
      {prices.length === 0 ? (
        <p className={styles.hint}>Курсът няма цена: на сайта е «Попитайте».</p>
      ) : (
        <table className={styles.summary}>
          <thead>
            <tr>
              <th scope="col">Важи за</th>
              <th scope="col">Цена</th>
              <th scope="col">Редовна цена</th>
              <th scope="col">Етикет</th>
              <th scope="col">Бележка</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((price) => {
              const group = typeof price.group === 'object' ? (price.group as Group | null) : null
              return (
                <tr key={price.id}>
                  <td>{group ? `Група · ${formatDateLong(group.start)}` : 'Целия курс'}</td>
                  <td>
                    <strong>{formatPrice(price.price, price.currency)}</strong>
                  </td>
                  <td>
                    {typeof price.regularPrice === 'number'
                      ? formatPrice(price.regularPrice, price.currency)
                      : '—'}
                  </td>
                  <td>{price.label || '—'}</td>
                  <td>{price.note || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      <Link href="/admin/collections/prices" className={styles.toPrices}>
        Промени в «Цени» ›
      </Link>
    </div>
  )
}
