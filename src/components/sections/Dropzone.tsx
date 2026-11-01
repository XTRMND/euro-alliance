'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { handOverFiles } from '@/lib/pending-upload'
import { type Pair, usePair, wizardHref } from './send-document-pair'
import styles from './SendDocument.module.css'

// The dropzone (51:322): drop a document, or choose one, and the contact wizard opens on its
// upload step with the files (src/lib/pending-upload.ts) and the chosen language pair. Nothing is
// uploaded here. The button is the control; dropping is the shortcut for a mouse.

const accept = '.pdf,.doc,.docx,.odt,.rtf,image/*'

type DropzoneProps = {
  art: ReactNode
  labels: { title: string; hint: string; choose: string }
  initial?: Pair
}

export function Dropzone({ art, labels, initial }: DropzoneProps) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const pair = usePair(initial)

  const send = (files: FileList | null) => {
    if (!files || files.length === 0) return
    handOverFiles(files)
    router.push(wizardHref(pair))
  }

  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    setDragging(true)
  }

  return (
    <div
      className={styles.dropzone}
      data-dragging={dragging || undefined}
      onDragOver={onDragOver}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        send(event.dataTransfer.files)
      }}
    >
      {art}
      <h3 className={styles.dropTitle}>{labels.title}</h3>
      <p className={styles.dropHint}>{labels.hint}</p>
      <Button variant="secondary" onClick={() => input.current?.click()}>
        {labels.choose}
      </Button>
      <input
        ref={input}
        type="file"
        multiple
        accept={accept}
        hidden
        onChange={(event) => send(event.target.files)}
      />
    </div>
  )
}
