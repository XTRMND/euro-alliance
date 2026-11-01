'use client'

import { useRef, useState } from 'react'
import styles from './DocumentPhoto.module.css'

// Document photo (193:351): a real scan, taped and tilted 2°, with its caption. Hover and focus
// straighten and lift it; pressing it opens the scan full size in a dialog (Esc or «Затвори»
// closes it). The scan is shown as it is: no tint. The full-size file loads only when opened.

type DocumentPhotoProps = {
  title: string
  /** The scan, sized for the card and full size. */
  image: { src: string; srcSet?: string; width?: number; height?: number }
  full: string
  alt: string
  labels: { open: string; close: string }
  className?: string
}

export function DocumentPhoto({ title, image, full, alt, labels, className }: DocumentPhotoProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [opened, setOpened] = useState(false)
  return (
    <figure className={[styles.document, className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={styles.button}
        aria-label={labels.open}
        onClick={() => {
          setOpened(true)
          dialog.current?.showModal()
        }}
      >
        <span className={styles.tape} aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image's props, from the server */}
        <img {...image} alt="" className={styles.scan} loading="lazy" decoding="async" />
      </button>
      <figcaption className={styles.caption}>{title}</figcaption>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label={title}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close()
        }}
      >
        {opened && (
          // eslint-disable-next-line @next/next/no-img-element -- the original scan, full size
          <img src={full} alt={alt} className={styles.full} />
        )}
        <button type="button" className={styles.close} onClick={() => dialog.current?.close()}>
          {labels.close}
        </button>
      </dialog>
    </figure>
  )
}
