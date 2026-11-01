import type { Payload } from 'payload'
import { company, navigation, offices } from './data'

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') {
    return Object.entries(value).every(([key, v]) => key === 'id' || isEmpty(v))
  }
  return false
}

/**
 * Fills in what's missing and never overwrites, so it's safe on every start: the client's edits
 * always win. Runs from onInit in production and from `pnpm seed` in development.
 */
export async function seed(payload: Payload) {
  const site = await payload.findGlobal({ slug: 'site', locale: 'bg', depth: 0 })
  const missing = Object.fromEntries(
    Object.entries(company).filter(([key]) => isEmpty(site[key as keyof typeof site])),
  )
  if (Object.keys(missing).length > 0) {
    await payload.updateGlobal({ slug: 'site', locale: 'bg', data: missing })
    payload.logger.info(`Seeded company facts: ${Object.keys(missing).join(', ')}.`)
  }

  const nav = await payload.findGlobal({ slug: 'navigation', locale: 'bg', depth: 0 })
  if (isEmpty(nav.header) && isEmpty(nav.menu) && isEmpty(nav.footer)) {
    await payload.updateGlobal({ slug: 'navigation', locale: 'bg', data: navigation })
    payload.logger.info('Seeded the navigation.')
  }

  for (const office of offices) {
    const { totalDocs } = await payload.count({
      collection: 'offices',
      where: { role: { equals: office.role } },
    })
    if (totalDocs === 0) {
      await payload.create({
        collection: 'offices',
        locale: 'bg',
        data: {
          ...office,
          phones: [...office.phones],
          emails: [...office.emails],
          _status: 'published',
        },
      })
      payload.logger.info(`Seeded the office «${office.name}».`)
    }
  }
}
