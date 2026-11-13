'use client'

import { Link, useDocumentInfo, useLocale } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import { formatDateLong, formatPrice } from '@/lib/format'
import { resolvePrice } from '@/lib/price'
import type { Group, Office, Price } from '@/payload-types'
import styles from './groups.module.css'

// The «Групи» tab of a course («Admin · 03 Курс», 367:890): each group a row named by its start
// date and days (never «Item 01»), opened to its fields. A group is a record of its own, so it's
// saved on its own («Запази групата»), apart from the course's draft. Its price isn't here: it
// lives in «Цени», and the row only shows it.

type Draft = {
  id?: number
  name: string
  start: string
  end: string
  seats: string
  days: string
  hours: string
  format: string
  office: string
}

const formatLabels: Record<string, string> = { 'in-person': 'Присъствено', online: 'Онлайн' }
const day = (iso?: string | null) => (iso ? iso.slice(0, 10) : '')
const draftOf = (group?: Group): Draft => ({
  id: group?.id,
  name: group?.name ?? '',
  start: day(group?.start),
  end: day(group?.end),
  seats: typeof group?.seats === 'number' ? String(group.seats) : '',
  days: group?.days ?? '',
  hours: group?.hours ?? '',
  format: group?.format ?? '',
  office: group?.office
    ? String(typeof group.office === 'object' ? group.office.id : group.office)
    : '',
})
/** «3 ноември 2026 · пн и ср или вт и чт», then the name if it has one. */
const titleOf = (draft: Draft) =>
  [
    draft.start ? formatDateLong(`${draft.start}T12:00:00.000Z`) : 'Нова група',
    draft.days,
    draft.name,
  ]
    .filter(Boolean)
    .join(' · ')

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!response.ok) throw new Error(String(response.status))
  return response.json() as Promise<T>
}

export function GroupsEditor() {
  const { id: courseId } = useDocumentInfo()
  const locale = useLocale()
  const [groups, setGroups] = useState<Draft[] | null>(null)
  const [stored, setStored] = useState<Record<number, Draft>>({})
  const [prices, setPrices] = useState<Price[]>([])
  const [offices, setOffices] = useState<Office[]>([])
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Read again after every save (`version`), and when the content language changes.
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((current) => current + 1)
  useEffect(() => {
    if (!courseId) return
    let stale = false
    const query = `where[course][equals]=${courseId}&depth=0&limit=100&locale=${locale.code}`
    Promise.all([
      api<{ docs: Group[] }>(`groups?${query}&sort=start`),
      api<{ docs: Price[] }>(`prices?${query}`),
      api<{ docs: Office[] }>(`offices?depth=0&limit=50&locale=${locale.code}`),
    ])
      .then(([g, p, o]) => {
        if (stale) return
        const drafts = g.docs.map(draftOf)
        setGroups(drafts)
        setStored(Object.fromEntries(drafts.map((draft) => [draft.id!, draft])))
        setPrices(p.docs)
        setOffices(o.docs)
      })
      .catch(() => {
        if (!stale) setError('Групите не се заредиха. Презаредете страницата.')
      })
    return () => {
      stale = true
    }
  }, [courseId, locale.code, version])

  if (!courseId)
    return <p className={styles.hint}>Запазете курса, за да добавите групи към него.</p>
  if (!groups) return <p className={styles.hint}>{error ?? 'Зареждане…'}</p>

  const key = (draft: Draft, index: number) => String(draft.id ?? `new-${index}`)
  const change = (index: number, field: keyof Draft, value: string) =>
    setGroups((current) =>
      current!.map((draft, i) => (i === index ? { ...draft, [field]: value } : draft)),
    )
  const dirty = (draft: Draft) =>
    !draft.id || JSON.stringify(stored[draft.id]) !== JSON.stringify(draft)

  const save = async (draft: Draft, index: number) => {
    if (!draft.start) return setError('Групата има нужда от начална дата.')
    setError(null)
    setBusy(key(draft, index))
    const data = {
      course: courseId,
      name: draft.name || null,
      start: `${draft.start}T00:00:00.000Z`,
      end: draft.end ? `${draft.end}T00:00:00.000Z` : null,
      seats: draft.seats === '' ? null : Number(draft.seats),
      days: draft.days || null,
      hours: draft.hours || null,
      format: draft.format || null,
      office: draft.office ? Number(draft.office) : null,
    }
    try {
      await api(
        draft.id ? `groups/${draft.id}?locale=${locale.code}` : `groups?locale=${locale.code}`,
        {
          method: draft.id ? 'PATCH' : 'POST',
          body: JSON.stringify(data),
        },
      )
      reload()
    } catch {
      setError('Групата не се запази. Опитайте пак.')
    } finally {
      setBusy(null)
    }
  }

  const remove = async (draft: Draft, index: number) => {
    if (!draft.id) return setGroups((current) => current!.filter((_, i) => i !== index))
    if (
      !window.confirm(
        `Да изтрия ли групата «${titleOf(draft)}»? Цената ѝ в «Цени» също се изтрива.`,
      )
    )
      return
    setBusy(key(draft, index))
    try {
      await api(`groups/${draft.id}`, { method: 'DELETE' })
      reload()
    } catch {
      setError('Групата не се изтри. Опитайте пак.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className={styles.editor}>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {groups.length === 0 && (
        <p className={styles.hint}>
          Курсът няма групи: на сайта е «Няма насрочена дата», с бутон за запитване.
        </p>
      )}
      {groups.map((draft, index) => {
        const id = key(draft, index)
        const expanded = open[id] ?? !draft.id
        const price = draft.id ? resolvePrice(prices, { id: draft.id }) : undefined
        const own = price && price.group
        return (
          <section key={id} className={styles.group}>
            <header className={styles.groupHeader}>
              <button
                type="button"
                className={styles.toggle}
                aria-expanded={expanded}
                onClick={() => setOpen((current) => ({ ...current, [id]: !expanded }))}
              >
                <span className={styles.groupTitle}>{titleOf(draft)}</span>
                {draft.format && <span className={styles.pill}>{formatLabels[draft.format]}</span>}
                {draft.seats !== '' && (
                  <span className={styles.seats}>
                    {draft.seats === '1' ? '1 свободно място' : `${draft.seats} свободни места`}
                  </span>
                )}
                {dirty(draft) && <span className={styles.unsaved}>Незаписано</span>}
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d={expanded ? 'M4 10l4-4 4 4' : 'M4 6l4 4 4-4'}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </header>
            {expanded && (
              <div className={styles.body}>
                <div className={styles.row}>
                  <Field label="Име на групата" localized help="По избор. Напр. «Вечерна група».">
                    {(fieldId) => (
                      <input
                        id={fieldId}
                        type="text"
                        value={draft.name}
                        onChange={(e) => change(index, 'name', e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label="Свободни места">
                    {(fieldId) => (
                      <input
                        id={fieldId}
                        type="number"
                        min={0}
                        value={draft.seats}
                        onChange={(e) => change(index, 'seats', e.target.value)}
                      />
                    )}
                  </Field>
                </div>
                <div className={styles.row}>
                  <Field label="Начало">
                    {(fieldId) => (
                      <input
                        id={fieldId}
                        type="date"
                        required
                        value={draft.start}
                        onChange={(e) => change(index, 'start', e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label="Край" help="По избор.">
                    {(fieldId) => (
                      <input
                        id={fieldId}
                        type="date"
                        value={draft.end}
                        onChange={(e) => change(index, 'end', e.target.value)}
                      />
                    )}
                  </Field>
                </div>
                <div className={styles.row}>
                  <Field label="Учебни дни" localized>
                    {(fieldId) => (
                      <input
                        id={fieldId}
                        type="text"
                        value={draft.days}
                        onChange={(e) => change(index, 'days', e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label="Учебни часове">
                    {(fieldId) => (
                      <input
                        id={fieldId}
                        type="text"
                        value={draft.hours}
                        onChange={(e) => change(index, 'hours', e.target.value)}
                      />
                    )}
                  </Field>
                </div>
                <div className={styles.row}>
                  <Field label="Формат">
                    {(fieldId) => (
                      <select
                        id={fieldId}
                        value={draft.format}
                        onChange={(e) => change(index, 'format', e.target.value)}
                      >
                        <option value="">Като на курса</option>
                        <option value="in-person">Присъствено</option>
                        <option value="online">Онлайн</option>
                      </select>
                    )}
                  </Field>
                  <Field label="Офис">
                    {(fieldId) => (
                      <select
                        id={fieldId}
                        value={draft.office}
                        onChange={(e) => change(index, 'office', e.target.value)}
                      >
                        <option value="">Без офис</option>
                        {offices.map((office) => (
                          <option key={office.id} value={office.id}>
                            {[office.name, office.address].filter(Boolean).join(' · ')}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                </div>

                {draft.id && (
                  <div className={styles.price}>
                    <p>
                      <span>
                        {own
                          ? 'Цена за тази група (иначе важи цената на курса)'
                          : price
                            ? 'Важи основната цена на курса'
                            : 'Няма цена: на сайта е «Попитайте»'}
                      </span>
                      {price && (
                        <strong>
                          {[formatPrice(price.price, price.currency), price.label]
                            .filter(Boolean)
                            .join(' · ')}
                        </strong>
                      )}
                    </p>
                    <Link href={`/admin/collections/prices#course-${courseId}`}>
                      Промени в «Цени»
                    </Link>
                  </div>
                )}

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.save}
                    disabled={!dirty(draft) || busy === id}
                    onClick={() => save(draft, index)}
                  >
                    Запази групата
                  </button>
                  <button
                    type="button"
                    className={styles.remove}
                    disabled={busy === id}
                    onClick={() => remove(draft, index)}
                  >
                    Изтрий групата
                  </button>
                </div>
              </div>
            )}
          </section>
        )
      })}
      <button
        type="button"
        className={styles.add}
        onClick={() => setGroups((current) => [...current!, draftOf()])}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Добави група
      </button>
    </div>
  )
}

let fieldCount = 0

/** «Admin / Field» (354:82): the label with its «БГ» badge, the control, the help. */
function Field({
  label,
  localized,
  help,
  children,
}: {
  label: string
  localized?: boolean
  help?: string
  children: (id: string) => React.ReactNode
}) {
  const [id] = useState(() => `group-field-${++fieldCount}`)
  const locale = useLocale()
  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}
        {localized && (
          <span className={styles.locale}>
            {(locale?.code ?? 'bg') === 'bg' ? 'БГ' : locale.code.toUpperCase()}
          </span>
        )}
      </label>
      {children(id)}
      {help && <p className={styles.help}>{help}</p>}
    </div>
  )
}
