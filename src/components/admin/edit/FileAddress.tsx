'use client'

import { useFormFields } from '@payloadcms/ui'
import { useState } from 'react'
import { fileAddress } from '@/lib/files'
import styles from './file-address.module.css'

// «Файлове»: the uploaded file's address, to paste into a link in any text. Without the host, so
// a link made on staging still works on the live site.

export function FileAddress() {
  const filename = useFormFields(([fields]) => fields.filename?.value)
  const [copied, setCopied] = useState(false)

  if (typeof filename !== 'string' || !filename)
    return <p className={styles.hint}>Запазете файла, за да получите адреса му.</p>

  const address = fileAddress(filename)
  const copy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.field}>
      <span className={styles.label} id="file-address-label">
        Адрес за връзка
      </span>
      <div className={styles.row}>
        <code className={styles.address} aria-labelledby="file-address-label">
          {address}
        </code>
        <button type="button" className={styles.copy} onClick={copy}>
          {copied ? 'Копирано' : 'Копирай адреса'}
        </button>
      </div>
      <p className={styles.hint} aria-live="polite">
        В текста маркирайте думите, натиснете бутона за връзка и поставете този адрес.
      </p>
    </div>
  )
}
