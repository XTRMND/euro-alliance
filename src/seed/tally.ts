import type { Payload } from 'payload'

// Counts what a seed run creates, updates and skips per collection, for `pnpm seed:staging`
// (docs/seeding.md). `recording()` wraps the Payload instance: its writes are counted and, in a
// dry run, not made. The base seed (./index.ts) reports what it leaves alone with `noteSkipped`,
// which does nothing when the seed runs on start (no tally).

export type Counts = { created: number; updated: number; skipped: number; deleted: number }

export class Tally {
  readonly counts = new Map<string, Counts>()
  /** Every write, made or (in a dry run) planned, one line each. */
  readonly planned: string[] = []
  /** What changes in the next write (the fields of an update), for its line in `planned`. */
  detail?: string

  constructor(readonly dryRun: boolean) {}

  private row(name: string): Counts {
    let row = this.counts.get(name)
    if (!row) {
      row = { created: 0, updated: 0, skipped: 0, deleted: 0 }
      this.counts.set(name, row)
    }
    return row
  }

  add(name: string, kind: keyof Counts, n = 1) {
    if (n > 0) this.row(name)[kind] += n
  }
}

const tallies = new WeakMap<object, Tally>()

/** Notes that the seed left `n` records of a collection (or a global) as they were. */
export function noteSkipped(payload: Payload, name: string, n = 1) {
  tallies.get(payload)?.add(name, 'skipped', n)
}

// The derived search index is rebuilt from what's published; its writes aren't content.
const uncounted = new Set(['search'])

type Args = {
  collection?: string
  slug?: string
  id?: number | string
  data?: Record<string, unknown>
  file?: { name: string }
  where?: unknown
}

const label = (args: Args) => {
  const data = args.data ?? {}
  const name = data.title ?? data.name ?? data.slug ?? args.file?.name ?? data.alt
  return typeof name === 'string' ? ` «${name}»` : args.id ? ` #${args.id}` : ''
}

let fakeId = 0

/**
 * The Payload instance with its writes counted (and, in a dry run, left out). Reads go through,
 * so a dry run sees the database as it is; a record it would create gets a negative id.
 */
export function recording(payload: Payload, tally: Tally): Payload {
  const proxy = new Proxy(payload, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      if (typeof value !== 'function') return value
      const write = (kind: keyof Counts, name: string, args: Args, fake: () => unknown) => {
        if (!uncounted.has(name)) {
          tally.add(name, kind)
          const detail = tally.detail ? ` (${tally.detail})` : ''
          tally.planned.push(`${kind.replace(/d$/, '')} ${name}${label(args)}${detail}`)
        }
        tally.detail = undefined
        return tally.dryRun ? Promise.resolve(fake()) : value.call(target, args)
      }
      switch (property) {
        case 'create':
          return (args: Args) =>
            write('created', args.collection!, args, () => ({
              id: --fakeId,
              ...args.data,
              filename: args.file?.name,
              url: args.file ? `/api/media/file/${args.file.name}` : undefined,
            }))
        case 'update':
          return (args: Args) =>
            write('updated', args.collection!, args, () =>
              args.id === undefined ? { docs: [], errors: [] } : { id: args.id, ...args.data },
            )
        case 'updateGlobal':
          return (args: Args) => write('updated', `global:${args.slug}`, args, () => args.data)
        case 'delete':
          return (args: Args) =>
            write('deleted', args.collection!, args, () =>
              args.id === undefined ? { docs: [], errors: [] } : { id: args.id },
            )
        default:
          return value.bind(target)
      }
    },
  })
  tallies.set(proxy, tally)
  return proxy
}
