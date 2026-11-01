'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { type DragEvent, useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { countCharacters, type Extracted, fileText, standardPages } from '@/lib/page-count'
import { handOverFiles } from '@/lib/pending-upload'
import { routes } from '@/lib/routes'
import styles from './PageCounter.module.css'

// Page counter (173:378): standard pages (1800 characters with spaces) from pasted text or a
// file, counted in the browser (src/lib/page-count.ts; PDFs with pdf.js, loaded only then).
// Nothing is uploaded. «Поискай оферта» opens the wizard on translations, with the file when
// there is one. Figma has Empty and Counted; pasting, counting, the files we can't count and
// removing the file are added.

type State =
  | { kind: 'empty' }
  | { kind: 'text'; characters: number }
  | { kind: 'counting'; file: File }
  | { kind: 'file'; file: File; characters: number }
  | {
      kind: 'uncountable'
      file: File
      reason: Extract<Extracted, { kind: 'uncountable' }>['reason']
    }

const accept = '.pdf,.docx,.odt,.txt,.doc,image/*'
const pagesFormat = new Intl.NumberFormat('bg-BG', { maximumFractionDigits: 1 })
const countFormat = new Intl.NumberFormat('bg-BG')

export function PageCounter() {
  const t = useTranslations('pageCounter')
  const router = useRouter()
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const textarea = useRef<HTMLTextAreaElement>(null)
  const [state, setState] = useState<State>({ kind: 'empty' })
  const [dragging, setDragging] = useState(false)

  const count = async (file: File) => {
    if (textarea.current) textarea.current.value = ''
    setState({ kind: 'counting', file })
    const extracted = /\.pdf$/i.test(file.name)
      ? await (await import('@/lib/pdf-text')).pdfText(file)
      : await fileText(file)
    setState(
      extracted.kind === 'text'
        ? { kind: 'file', file, characters: countCharacters(extracted.text) }
        : { kind: 'uncountable', file, reason: extracted.reason },
    )
  }

  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    setDragging(true)
  }

  const characters = state.kind === 'text' || state.kind === 'file' ? state.characters : 0
  const counted = characters > 0
  const file = state.kind === 'empty' || state.kind === 'text' ? null : state.file

  return (
    <div className={styles.counter} role="group" aria-labelledby={`${id}-title`}>
      <div className={styles.head}>
        <h3 id={`${id}-title`} className={styles.title}>
          {t('title')}
        </h3>
        <span className={styles.rule}>{t('rule')}</span>
      </div>
      <div
        className={styles.input}
        data-dragging={dragging || undefined}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          const dropped = event.dataTransfer.files[0]
          if (dropped) void count(dropped)
        }}
      >
        {file ? (
          <div className={styles.file}>
            <span className={styles.badge} aria-hidden="true">
              {file.name.split('.').pop()?.slice(0, 4).toUpperCase()}
            </span>
            <span className={styles.fileText}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileMeta}>
                {state.kind === 'counting'
                  ? t('counting')
                  : state.kind === 'file'
                    ? t('characters', { count: countFormat.format(state.characters) })
                    : t(
                        `uncountable.${state.kind === 'uncountable' ? state.reason : 'unreadable'}`,
                      )}
              </span>
            </span>
            <button
              type="button"
              className={styles.remove}
              onClick={() => {
                setState({ kind: 'empty' })
                if (input.current) input.current.value = ''
              }}
            >
              {t('remove')}
              <span className="sr-only"> {file.name}</span>
            </button>
          </div>
        ) : (
          <>
            <label htmlFor={`${id}-text`} className="sr-only">
              {t('textLabel')}
            </label>
            <textarea
              ref={textarea}
              id={`${id}-text`}
              className={styles.text}
              rows={2}
              placeholder={t('prompt')}
              aria-describedby={`${id}-hint`}
              onChange={(event) => {
                const value = countCharacters(event.target.value)
                setState(value > 0 ? { kind: 'text', characters: value } : { kind: 'empty' })
              }}
            />
            <p id={`${id}-hint`} className={styles.hint}>
              {t('hint')}
            </p>
            <Button variant="secondary" onClick={() => input.current?.click()}>
              {t('upload')}
            </Button>
          </>
        )}
        <input
          ref={input}
          type="file"
          accept={accept}
          hidden
          onChange={(event) => {
            const chosen = event.target.files?.[0]
            if (chosen) void count(chosen)
          }}
        />
      </div>
      <div className={styles.result} data-counted={counted || undefined} aria-live="polite">
        <span className={styles.number}>{pagesFormat.format(standardPages(characters))}</span>
        <span className={styles.resultText}>
          <span className={styles.label}>{t('pages')}</span>
          <span className={styles.note}>{t('note')}</span>
        </span>
      </div>
      <div className={styles.actions}>
        <Button
          onClick={() => {
            if (file) handOverFiles([file])
            router.push(routes.contact('prevodi'))
          }}
        >
          {t('quote')}
        </Button>
        <Button variant="link" href={routes.contact('prevodi')}>
          {t('framework')}
        </Button>
      </div>
    </div>
  )
}
