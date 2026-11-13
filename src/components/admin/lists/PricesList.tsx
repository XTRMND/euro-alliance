import type { ListViewServerProps } from 'payload'
import { type PriceCourse, type StoredPrice, priceRows } from '@/lib/admin-prices'
import { PricesEditor } from './PricesEditor'

// «Admin · 04 Цени» (370:1186): the prices of every course on one screen, edited in place. The
// rows are read here; typing, the unsaved state and saving are the editor's.

export async function PricesList({ payload, locale }: ListViewServerProps) {
  const admin = payload.config.routes.admin
  const code = (locale?.code ?? 'bg') as 'bg' | 'en'
  const [courses, groups, prices] = await Promise.all([
    payload.find({
      collection: 'courses',
      select: { title: true, category: true, voucherEligible: true, free: true },
      locale: 'bg',
      depth: 0,
      draft: true,
      joins: false,
      sort: 'title',
      pagination: false,
    }),
    payload.find({
      collection: 'groups',
      select: { course: true, start: true, name: true },
      locale: code,
      depth: 0,
      pagination: false,
    }),
    payload.find({ collection: 'prices', locale: code, depth: 0, pagination: false }),
  ])

  return (
    <PricesEditor
      rows={priceRows(courses.docs as PriceCourse[], groups.docs, prices.docs as StoredPrice[])}
      locale={code}
      courseBase={`${admin}/collections/courses`}
    />
  )
}

export default PricesList
