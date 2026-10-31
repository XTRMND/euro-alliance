'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/** The token's computed value, so the page always shows what tokens.css really says. */
export function TokenValue({ name }: { name: string }) {
  const value = useSyncExternalStore(
    subscribe,
    () => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    () => '',
  )
  return <code>{value}</code>
}
