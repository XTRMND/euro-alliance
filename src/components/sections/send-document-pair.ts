import { useSyncExternalStore } from 'react'
import { routes } from '@/lib/routes'
import { slugify } from '@/lib/slug'

// The language pair chosen in «Изпратете документ», shared by the selects, the button and the
// dropzone (separate client islands) and carried to the contact wizard in its link.

export type Pair = { from: string; to: string }

let current = ''
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setPair({ from, to }: Pair) {
  current = `${from}\n${to}`
  listeners.forEach((listener) => listener())
}

/** The chosen pair, or `initial` until the visitor picks one. */
export function usePair(initial?: Pair): Pair | undefined {
  const value = useSyncExternalStore(
    subscribe,
    () => current,
    () => '',
  )
  if (!value) return initial
  const [from, to] = value.split('\n')
  return { from, to }
}

/** The contact wizard on the translations topic, with the pair if there is one. */
export function wizardHref(pair?: Pair): string {
  return routes.contact('prevodi', pair && { from: slugify(pair.from), to: slugify(pair.to) })
}
