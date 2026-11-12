'use client'

import { useAllFormFields } from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'
import logo from '@/assets/logo-light.svg'
import styles from './nav-preview.module.css'

// «Преглед» on the Навигация screen (377:2711): the header as the site lays it out, links left of
// the logo, links right of it and the contact button, from what's in the form. A picture of the
// order and the wording only: it isn't the site's header component, and nothing in it is a link.

type Link = { label?: string | null; children?: unknown[] | null }

export function NavPreview({ cta }: { cta?: string }) {
  const [fields] = useAllFormFields()
  const header = (
    reduceFieldsToValues(fields, true) as { header?: { left?: Link[]; right?: Link[] } }
  ).header
  const side = (links: Link[] | undefined) =>
    (links ?? [])
      .filter((link) => link?.label)
      .map((link, index) => (
        <span key={index} className={styles.item}>
          {link.label}
          {link.children?.length ? <span aria-hidden="true"> ▾</span> : null}
        </span>
      ))

  return (
    <div className={styles.preview}>
      <p className={styles.label}>Преглед</p>
      <div className={styles.header} role="img" aria-label="Преглед на горната лента на сайта">
        <div className={styles.side}>{side(header?.left)}</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.src} alt="" width={120} height={34} className={styles.logo} />
        <div className={styles.side} data-side="right">
          {side(header?.right)}
          {cta && <span className={styles.cta}>{cta}</span>}
        </div>
      </div>
    </div>
  )
}
