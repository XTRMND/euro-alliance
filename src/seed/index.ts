import type { Payload } from 'payload'
import { company, offices } from './data'

/**
 * Fills in what's missing and never overwrites, so it's safe on every start: the client's edits
 * always win. Runs from onInit in production and from `pnpm seed` in development.
 */
export async function seed(payload: Payload) {
  const site = await payload.findGlobal({ slug: 'site', locale: 'bg' })
  if (!site.legalName) {
    await payload.updateGlobal({ slug: 'site', locale: 'bg', data: company })
    payload.logger.info('Seeded the company facts.')
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
