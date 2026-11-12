'use client'

import { Link } from '@payloadcms/ui'
import { useState, useSyncExternalStore } from 'react'
import type { NavNode } from '@/lib/admin-nav'
import styles from './shell.module.css'

// The sidebar's tree («Admin / Nav item», 354:53): three levels, a branch opens and closes, and
// the item of the open screen is marked. The branches above the open screen start open.

const ancestors = (key?: string) =>
  key
    ? key
        .split('/')
        .slice(0, -1)
        .map((_, index, parts) => parts.slice(0, index + 1).join('/'))
    : []

type NavTreeProps = { tree: NavNode[]; footer: NavNode[]; activeKey?: string }

export function NavTree({ tree, footer, activeKey }: NavTreeProps) {
  // A branch is open when it's above the open screen, unless it was opened or closed by hand.
  const [toggled, setToggled] = useState<Record<string, boolean>>({})
  const above = new Set(ancestors(activeKey))
  const isOpen = (key: string) => toggled[key] ?? above.has(key)
  // «Езици» and «Страница» of Преводи are one document: the part of the page tells them apart.
  const hash = useSyncExternalStore(
    (onChange) => {
      window.addEventListener('hashchange', onChange)
      return () => window.removeEventListener('hashchange', onChange)
    },
    () => window.location.hash,
    () => '',
  )

  // The item marked: the open screen's, or its sibling whose part of the page is in the address.
  const parent = activeKey ? find(tree, activeKey.split('/').slice(0, -1).join('/')) : undefined
  const byHash = hash
    ? parent?.children?.find((node) => node.href?.split('#')[1] === hash.slice(1))
    : undefined
  const marked = byHash?.key ?? activeKey
  const isActive = (node: NavNode) => node.key === marked

  const toggle = (key: string) => setToggled((current) => ({ ...current, [key]: !isOpen(key) }))

  const items = (nodes: NavNode[], level: 1 | 2 | 3) => (
    <ul className={styles.list}>
      {nodes.map((node) => {
        const expanded = isOpen(node.key)
        return (
          <li key={node.key}>
            {node.children ? (
              <>
                <button
                  type="button"
                  className={styles.item}
                  data-level={level}
                  aria-expanded={expanded}
                  onClick={() => toggle(node.key)}
                >
                  <span className={styles.label}>{node.label}</span>
                  <Chevron open={expanded} />
                </button>
                {expanded && items(node.children, (level + 1) as 2 | 3)}
              </>
            ) : (
              <Link
                href={node.href ?? '#'}
                className={styles.item}
                data-level={level}
                aria-current={isActive(node) ? 'page' : undefined}
              >
                <span className={styles.label}>{node.label}</span>
                {node.badge ? (
                  <span className={styles.badge}>
                    {node.badge}
                    <span className={styles.srOnly}> нови</span>
                  </span>
                ) : null}
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )

  return (
    <>
      <nav className={styles.tree} aria-label="Съдържание">
        {items(tree, 1)}
      </nav>
      <nav className={styles.footer} aria-label="Профил">
        {items(footer, 1)}
      </nav>
    </>
  )
}

function find(nodes: NavNode[], key: string): NavNode | undefined {
  for (const node of nodes) {
    if (node.key === key) return node
    const inside = node.children && find(node.children, key)
    if (inside) return inside
  }
  return undefined
}

/** «icon/chevron-down» and «icon/chevron-right», 16px. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={styles.chevron} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={open ? 'M4 6l4 4 4-4' : 'M6 4l4 4-4 4'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
