import { Link } from '@payloadcms/ui'
import type { ListViewServerProps, Where } from 'payload'
import { initialsOf, timeAgo } from '@/lib/admin-dashboard'
import { formatDateLong, formatDateTime, telHref } from '@/lib/format'
import {
  type InquiryStatus,
  inquiryStatuses,
  inquiryStatusLabels,
  inquiryTopicLabels,
} from '@/lib/inquiries'
import type { Inquiry } from '@/payload-types'
import { retentionDays } from '@/jobs/retention'
import { ContractToggle, Notes, StatusSelect } from './InquiryControls'
import { NavSelect } from './NavSelect'
import { listParams } from './shared'
import list from './list.module.css'
import styles from './inquiries.module.css'

// «Admin · 06 Запитвания» (371:1332): the list and the open inquiry in one card. The chips filter
// by status, the select by the inbox it was sent to. The detail shows what the visitor sent (never
// editable), the consent, the files, and what the team adds: the status, «Довело до договор» and
// the internal notes. The day of the automatic deletion is always in sight.

const officeLabels = { plovdiv: 'Пловдив', sofia: 'София' }
const emailLabels = {
  pending: 'Имейлите чакат изпращане.',
  sent: 'Имейлите са изпратени: до екипа и потвърждение до посетителя.',
  failed: 'Имейлите не са изпратени. Отговорете на посетителя ръчно.',
}
const pillTone: Record<InquiryStatus, string> = {
  new: 'solid',
  'in-progress': 'sand',
  closed: 'neutral',
}

/** «Курс · Английски език A1–B1», «Превод · София». */
const about = (inquiry: Inquiry) =>
  [
    inquiry.topic ? inquiryTopicLabels[inquiry.topic] : null,
    inquiry.topic === 'translation' && inquiry.office ? officeLabels[inquiry.office] : null,
    typeof inquiry.course === 'object' ? inquiry.course?.title : null,
  ]
    .filter(Boolean)
    .join(' · ')

export async function InquiriesList({ payload, searchParams }: ListViewServerProps) {
  const admin = payload.config.routes.admin
  const params = listParams(searchParams)
  const [counts, inboxes] = await Promise.all([
    Promise.all(
      inquiryStatuses.map((status) =>
        payload.count({ collection: 'inquiries', where: { status: { equals: status } } }),
      ),
    ),
    payload.findDistinct({ collection: 'inquiries', field: 'routedTo' }),
  ])
  const newCount = counts[0].totalDocs
  const wanted = params.get('status')
  // «Нови» first, while there are any.
  const status =
    wanted === 'all'
      ? undefined
      : (inquiryStatuses.find((value) => value === wanted) ?? (newCount ? 'new' : undefined))
  const inboxList = inboxes.values
    .map((row) => row.routedTo)
    .filter((value): value is string => Boolean(value))
    .sort()
  const inbox = inboxList.find((value) => value === params.get('inbox'))

  const where: Where[] = [
    ...(status ? [{ status: { equals: status } }] : []),
    ...(inbox ? [{ routedTo: { equals: inbox } }] : []),
  ]
  const { docs } = await payload.find({
    collection: 'inquiries',
    where: { and: where },
    sort: '-createdAt',
    depth: 1,
    locale: 'bg',
    limit: 200,
  })
  const selectedId = Number(params.get('id'))
  const selected =
    docs.find((inquiry) => inquiry.id === selectedId) ??
    (selectedId
      ? await payload
          .findByID({ collection: 'inquiries', id: selectedId, depth: 1, disableErrors: true })
          .catch(() => null)
      : null) ??
    docs[0]

  const chips: [string, string][] = [
    ['new', `Нови (${newCount})`],
    ['in-progress', 'В работа'],
    ['closed', 'Приключени'],
    ['all', 'Всички'],
  ]

  return (
    <div className={list.screen} data-admin="list">
      <header className={list.header}>
        <div className={list.titles}>
          <h1 className={list.title}>Запитвания</h1>
          <p className={list.subtitle}>Пазят се 1 година, освен ако не са довели до договор.</p>
        </div>
        {chips.map(([value, label]) => (
          <Link
            key={value}
            href={params.href({ status: value, id: undefined })}
            className={list.chip}
            aria-current={(status ?? 'all') === value ? 'true' : undefined}
          >
            {label}
          </Link>
        ))}
        <NavSelect
          id="inbox"
          label="Поща"
          hideLabel
          value={inbox ?? ''}
          options={[
            { value: '', label: 'Всички пощи' },
            ...inboxList.map((value) => ({ value, label: value })),
          ]}
          hrefTemplate={params.href({ inbox: '{value}', id: undefined })}
        />
      </header>

      <div className={`${list.card} ${styles.card}`} data-admin="card">
        <nav className={styles.list} aria-label="Запитвания">
          {docs.length === 0 ? (
            <p className={list.empty}>
              {status === 'new' ? 'Няма нови запитвания.' : 'Няма запитвания с този филтър.'}
            </p>
          ) : (
            <ul>
              {docs.map((inquiry) => (
                <li key={inquiry.id}>
                  <Link
                    href={params.href({ id: String(inquiry.id) })}
                    className={styles.row}
                    aria-current={inquiry.id === selected?.id ? 'true' : undefined}
                  >
                    <span className={styles.avatar} aria-hidden="true">
                      {initialsOf(inquiry.name)}
                    </span>
                    <span className={styles.text}>
                      <span className={styles.name}>{inquiry.name || 'Без име'}</span>
                      <span className={styles.sub}>{about(inquiry)}</span>
                    </span>
                    <span className={styles.meta}>
                      <span className={styles.time}>{timeAgo(inquiry.createdAt)}</span>
                      <span className={list.pill} data-tone={pillTone[inquiry.status]}>
                        {inquiryStatusLabels[inquiry.status]}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {selected ? (
          <Detail inquiry={selected} admin={admin} />
        ) : (
          <div className={styles.detail}>
            <p className={list.empty}>Изберете запитване от списъка.</p>
          </div>
        )}
      </div>

      <p className={styles.routing}>
        Коя поща получава кое запитване:{' '}
        <Link href={`${admin}/globals/inquiry-routing`}>Маршрутизиране на запитвания</Link>
      </p>
    </div>
  )
}

function Detail({ inquiry, admin }: { inquiry: Inquiry; admin: string }) {
  const course = typeof inquiry.course === 'object' ? inquiry.course : null
  const files = (inquiry.files ?? []).filter((file) => typeof file === 'object')
  const deletion = new Date(new Date(inquiry.createdAt).getTime() + retentionDays * 86_400_000)
  const facts: [string, React.ReactNode][] = [
    ['Тема', inquiry.topic ? inquiryTopicLabels[inquiry.topic] : null],
    [
      'Курс',
      course && <Link href={`${admin}/collections/courses/${course.id}`}>{course.title}</Link>,
    ],
    ['Страница', inquiry.sourcePage],
    ['Офис', inquiry.office ? officeLabels[inquiry.office] : null],
    ['Имейл', inquiry.email && <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>],
    ['Телефон', inquiry.phone && <a href={telHref(inquiry.phone)}>{inquiry.phone}</a>],
  ]

  return (
    <article className={styles.detail} aria-labelledby="inquiry-name">
      <header className={styles.detailHeader}>
        <div className={styles.who}>
          <h2 id="inquiry-name" className={styles.detailName}>
            {inquiry.name || 'Без име'}
          </h2>
          <p className={styles.sent}>
            {formatDateTime(inquiry.createdAt)}
            {inquiry.routedTo && ` · изпратено до ${inquiry.routedTo}`}
          </p>
        </div>
        <StatusSelect key={`status-${inquiry.id}`} id={inquiry.id} status={inquiry.status} />
        {inquiry.email && (
          <a href={`mailto:${inquiry.email}`} className={list.primary}>
            Отговори по имейл
          </a>
        )}
      </header>

      <div className={styles.body}>
        <section>
          <h3>Запитване</h3>
          <dl className={styles.facts}>
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || <span className={list.muted}>—</span>}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h3>Съобщение</h3>
          {inquiry.message ? (
            <p className={styles.message}>{inquiry.message}</p>
          ) : (
            <p className={list.muted}>Без съобщение.</p>
          )}
        </section>

        {inquiry.answers && inquiry.answers.length > 0 && (
          <section>
            <h3>Отговори от формата</h3>
            <dl className={styles.answers}>
              {inquiry.answers.map((answer, index) => (
                <div key={answer.id ?? index}>
                  <dt>{answer.question}</dt>
                  <dd>{answer.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {inquiry.privacyAck && (
          <p className={styles.consent}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M3 8.5l3.2 3L13 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Прие политиката за поверителност · {formatDateTime(inquiry.createdAt)}
          </p>
        )}

        <section>
          <h3>Файлове</h3>
          {files.length ? (
            <ul className={styles.files}>
              {files.map(
                (file) =>
                  typeof file === 'object' &&
                  file.url && (
                    <li key={file.id}>
                      <a href={file.url} target="_blank" rel="noopener">
                        {file.filename}
                      </a>
                    </li>
                  ),
              )}
            </ul>
          ) : (
            <p className={list.muted}>Няма прикачени файлове.</p>
          )}
        </section>

        <section>
          <h3>Бележки (вътрешни)</h3>
          <Notes key={`notes-${inquiry.id}`} id={inquiry.id} notes={inquiry.notes ?? ''} />
        </section>

        <section>
          <h3>Имейли</h3>
          <p className={styles.plain}>{emailLabels[inquiry.emailStatus ?? 'pending']}</p>
        </section>

        <section>
          <h3>Съхранение</h3>
          <ContractToggle
            key={`contract-${inquiry.id}`}
            id={inquiry.id}
            contract={Boolean(inquiry.contract)}
          />
          <p className={styles.plain}>
            {inquiry.contract
              ? 'Довело е до договор: не се изтрива автоматично.'
              : `Ще се изтрие автоматично на ${formatDateLong(deletion)} (1 година след получаването).`}
          </p>
        </section>
      </div>
    </article>
  )
}

export default InquiriesList
