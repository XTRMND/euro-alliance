'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { type InquiryStatus, inquiryStatuses, inquiryStatusLabels } from '@/lib/inquiries'
import styles from './inquiries.module.css'

// What the team changes on an inquiry (371:1332): its status, whether it led to a contract, and
// the internal notes. Each change is saved through Payload's API as the signed-in user, then the
// screen is read again (the list's pills and the menu's count follow).

async function save(id: number, data: Record<string, unknown>) {
  const response = await fetch(`/api/inquiries/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(String(response.status))
}

function useSave(id: number) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState(false)
  const run = (data: Record<string, unknown>, done?: () => void) => {
    setError(false)
    startTransition(async () => {
      try {
        await save(id, data)
        done?.()
        router.refresh()
      } catch {
        setError(true)
      }
    })
  }
  return { run, pending, error }
}

export function StatusSelect({ id, status }: { id: number; status: InquiryStatus }) {
  const { run, pending, error } = useSave(id)
  return (
    <label className={styles.status}>
      <span>Статус:</span>
      <select
        value={status}
        disabled={pending}
        onChange={(event) => run({ status: event.target.value })}
      >
        {inquiryStatuses.map((value) => (
          <option key={value} value={value}>
            {inquiryStatusLabels[value]}
          </option>
        ))}
      </select>
      {error && (
        <span role="alert" className={styles.error}>
          Не се запази. Опитайте пак.
        </span>
      )}
    </label>
  )
}

export function ContractToggle({ id, contract }: { id: number; contract: boolean }) {
  const { run, pending, error } = useSave(id)
  return (
    <label className={styles.checkbox}>
      <input
        type="checkbox"
        checked={contract}
        disabled={pending}
        onChange={(event) => run({ contract: event.target.checked })}
      />
      Довело до договор
      {error && (
        <span role="alert" className={styles.error}>
          Не се запази. Опитайте пак.
        </span>
      )}
    </label>
  )
}

export function Notes({ id, notes }: { id: number; notes: string }) {
  const [value, setValue] = useState(notes)
  const [saved, setSaved] = useState(false)
  const { run, pending, error } = useSave(id)
  const changed = value !== notes
  return (
    <div className={styles.notes}>
      <label htmlFor="inquiry-notes">Бележка</label>
      <textarea
        id="inquiry-notes"
        rows={3}
        value={value}
        placeholder="Видими само за екипа в админа."
        onChange={(event) => {
          setValue(event.target.value)
          setSaved(false)
        }}
      />
      <div className={styles.notesActions}>
        <button
          type="button"
          className={styles.save}
          disabled={!changed || pending}
          onClick={() => run({ notes: value }, () => setSaved(true))}
        >
          Запази бележката
        </button>
        <span role="status" className={styles.saved}>
          {saved && !changed ? 'Запазено.' : ''}
        </span>
        {error && (
          <span role="alert" className={styles.error}>
            Не се запази. Опитайте пак.
          </span>
        )}
      </div>
    </div>
  )
}
