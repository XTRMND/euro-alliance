import { Link } from '@payloadcms/ui'
import type { ListViewServerProps, Where } from 'payload'
import { formatDateLong } from '@/lib/format'
import { SearchIcon, listParams } from './shared'
import styles from './list.module.css'

// «Новини»: the list of articles on the pattern of the course list (356:100; this screen isn't in
// Figma): the title, search, the status chips and one card at the full height, newest first.

const statuses = [
  ['', 'Всички'],
  ['published', 'Публикувани'],
  ['draft', 'Чернови'],
] as const

export async function NewsList({ payload, searchParams }: ListViewServerProps) {
  const admin = payload.config.routes.admin
  const params = listParams(searchParams)
  const query = params.get('q').trim()
  const status = statuses.find(([value]) => value && value === params.get('status'))?.[0] ?? ''

  const where: Where[] = [
    ...(status ? [{ _status: { equals: status } }] : []),
    ...(query ? [{ title: { like: query } }] : []),
  ]
  const { docs, totalDocs } = await payload.find({
    collection: 'news',
    where: { and: where },
    select: { title: true, date: true, _status: true, cover: true },
    locale: 'bg',
    depth: 0,
    draft: true,
    sort: '-date',
    pagination: false,
  })

  return (
    <div className={styles.screen} data-admin="list">
      <header className={styles.header}>
        <div className={styles.titles}>
          <h1 className={styles.title}>Новини</h1>
          <p className={styles.subtitle}>
            {totalDocs === 1 ? '1 статия' : `${totalDocs} статии`}, най-новите първи
          </p>
        </div>
        <form className={styles.search} role="search" action={`${admin}/collections/news`}>
          {params.hidden(['q'])}
          <SearchIcon />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Търси по заглавие…"
            aria-label="Търси по заглавие"
          />
        </form>
        <Link href={`${admin}/collections/news/create`} className={styles.primary}>
          + Нова новина
        </Link>
      </header>

      <div className={styles.filters}>
        {statuses.map(([value, label]) => (
          <Link
            key={value}
            href={params.href({ status: value || undefined })}
            className={styles.chip}
            aria-current={status === value ? 'true' : undefined}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className={styles.card} data-admin="card">
        <div className={styles.scroll}>
          <table className={styles.table}>
            <colgroup>
              <col />
              <col style={{ width: 180 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 150 }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Заглавие</th>
                <th scope="col">Дата</th>
                <th scope="col">Снимка</th>
                <th scope="col">Статус</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((article) => (
                <tr key={article.id}>
                  <td>
                    <Link
                      href={`${admin}/collections/news/${article.id}`}
                      className={styles.rowLink}
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td>{article.date ? formatDateLong(article.date) : '—'}</td>
                  <td className={article.cover ? undefined : styles.muted}>
                    {article.cover ? 'има' : 'няма'}
                  </td>
                  <td>
                    <span
                      className={styles.pill}
                      data-tone={article._status === 'published' ? undefined : 'sand'}
                    >
                      {article._status === 'published' ? 'Публикувана' : 'Чернова'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {docs.length === 0 && (
            <p className={styles.empty}>
              {query ? `Няма новина с «${query}» в заглавието.` : 'Тук още няма новини.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewsList
